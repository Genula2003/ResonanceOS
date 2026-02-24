use crate::models::{Role, User};
use crate::db::DbPool;
use sqlx::Row;

pub async fn check_auth(
    pool: &DbPool,
    user_id: &str,
    required_roles: &[Role],
) -> Result<User, String> {
    let row = sqlx::query("SELECT * FROM users WHERE id = ? AND active = 1")
        .bind(user_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("User not found or inactive")?;

    let role_str: String = row.try_get("role").map_err(|e| e.to_string())?;
    let user_role = Role::from(role_str.clone());

    if required_roles.contains(&user_role) {
        let user = User {
            id: row.try_get("id").unwrap_or_default(),
            email: row.try_get("email").unwrap_or_default(),
            password_hash: row.try_get("password_hash").unwrap_or_default(),
            role: role_str,
            active: row.try_get("active").unwrap_or(false),
            created_at: row.try_get("created_at").unwrap_or_default(),
            last_login_at: row.try_get("last_login_at").ok(),
        };
        Ok(user)
    } else {
        Err(format!("Access denied. User role {:?} does not have permission.", user_role))
    }
}
