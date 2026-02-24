use crate::db::DbPool;
use crate::models::Role;
use crate::auth::check_auth;
use tauri::State;
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AuditLogEntry {
    pub id: i64,
    pub actor_user_id: String,
    pub action: String,
    pub entity_type: String,
    pub entity_id: String,
    pub metadata_json: Option<String>,
    pub created_at: NaiveDateTime,
}

// Helper to log actions from other commands
pub async fn log_audit(
    pool: &DbPool,
    actor_user_id: &str,
    action: &str,
    entity_type: &str,
    entity_id: &str,
    metadata: Option<&str>
) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(actor_user_id)
    .bind(action)
    .bind(entity_type)
    .bind(entity_id)
    .bind(metadata)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_audit_logs(
    pool: State<'_, DbPool>,
    user_id: String,
    limit: Option<i64>
) -> Result<Vec<AuditLogEntry>, String> {
    // Only Admin can view audit logs
    check_auth(&pool, &user_id, &[Role::Admin]).await?;

    let limit_val = limit.unwrap_or(100);

    let logs = sqlx::query_as::<_, AuditLogEntry>(
        "SELECT id, actor_user_id, action, entity_type, entity_id, metadata_json, created_at FROM audit_log ORDER BY created_at DESC LIMIT ?"
    )
    .bind(limit_val)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(logs)
}
