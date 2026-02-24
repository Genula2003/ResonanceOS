use crate::db::DbPool;
use crate::models::{Role};
use crate::auth::check_auth;
use tauri::State;
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::NaiveDate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Invoice {
    pub id: String,
    pub student_id: String,
    pub due_date: NaiveDate,
    pub total_amount: f64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Payment {
    pub id: String,
    pub invoice_id: String,
    pub amount: f64,
    pub paid_at: chrono::NaiveDateTime,
    pub method: String,
}

#[tauri::command]
pub async fn get_invoices(
    pool: State<'_, DbPool>,
    user_id: String,
) -> Result<Vec<Invoice>, String> {
    // Teacher cannot access finance
    check_auth(&pool, &user_id, &[Role::Admin, Role::ManagementFinance]).await?;

    let invoices = sqlx::query_as::<_, Invoice>(
        "SELECT id, student_id, due_date, total_amount, status FROM invoices ORDER BY due_date DESC"
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(invoices)
}

#[tauri::command]
pub async fn get_student_invoices(
    pool: State<'_, DbPool>,
    user_id: String,
    student_id: String
) -> Result<Vec<Invoice>, String> {
    // Teacher cannot access finance
    check_auth(&pool, &user_id, &[Role::Admin, Role::ManagementFinance]).await?;

    let invoices = sqlx::query_as::<_, Invoice>(
        "SELECT id, student_id, due_date, total_amount, status FROM invoices WHERE student_id = ? ORDER BY due_date DESC"
    )
    .bind(student_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(invoices)
}
