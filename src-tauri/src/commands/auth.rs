use crate::db::DbPool;
use tauri::State;
use serde::{Serialize};
use bcrypt::verify;
use sqlx::Row;

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub id: String,
    pub email: String,
    pub role: String,
}

#[tauri::command]
pub async fn login(
    pool: State<'_, DbPool>,
    email: String,
    password_plain: String
) -> Result<AuthResponse, String> {
    let row = sqlx::query("SELECT * FROM users WHERE email = ? AND active = 1")
        .bind(&email)
        .fetch_optional(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(row) = row {
        let hash_str: String = row.try_get("password_hash").map_err(|e| e.to_string())?;
        
        // Verify password
        let valid = verify(&password_plain, &hash_str).map_err(|e| e.to_string())?;
        if valid {
            let user_id: String = row.try_get("id").map_err(|e| e.to_string())?;
            let role: String = row.try_get("role").map_err(|e| e.to_string())?;
            
            // Update last login
            let _ = sqlx::query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(&user_id)
                .execute(&*pool)
                .await;

            return Ok(AuthResponse {
                id: user_id,
                email,
                role,
            });
        }
    }

    Err("Invalid credentials".to_string())
}
