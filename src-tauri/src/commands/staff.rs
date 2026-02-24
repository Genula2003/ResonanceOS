use crate::db::DbPool;
use crate::auth::check_auth;
use crate::models::Role;
use tauri::State;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct StaffProfile {
    pub id: String,
    pub full_name: String,
    pub staff_code: String,
    pub campus_email: String,
    pub position_title: String,
    pub department: Option<String>,
    pub photo_path: Option<String>,
    pub status: String,
}

#[tauri::command]
pub async fn get_staff(
    pool: State<'_, DbPool>,
    user_id: String,
) -> Result<Vec<StaffProfile>, String> {
    // All roles can see staff list (directory)
    check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher, Role::ManagementFinance]).await?;

    let staff = sqlx::query_as::<_, StaffProfile>(
        r#"
        SELECT 
            id, full_name, staff_code, campus_email, 
            position_title, department, photo_path, status
        FROM staff
        WHERE status = 'ACTIVE'
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(staff)
}
