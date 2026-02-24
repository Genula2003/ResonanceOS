use crate::db::DbPool;
use crate::models::{Role};
use crate::auth::check_auth;
use tauri::State;
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::NaiveDate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AttendanceRecord {
    pub id: String,
    pub student_id: String,
    pub class_id: String,
    pub date: NaiveDate,
    pub status: String,
    pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Assessment {
    pub id: String,
    pub title: String,
    pub subject_id: String,
    pub date: NaiveDate,
    pub max_score: f64,
    pub score: f64,
}

#[tauri::command]
pub async fn get_student_attendance(
    pool: State<'_, DbPool>,
    user_id: String,
    student_id: String
) -> Result<Vec<AttendanceRecord>, String> {
    // Finance cannot access attendance
    check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher]).await?;

    let records = sqlx::query_as::<_, AttendanceRecord>(
        "SELECT id, student_id, class_id, date, status, note FROM attendance_records WHERE student_id = ? ORDER BY date DESC"
    )
    .bind(student_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(records)
}

#[tauri::command]
pub async fn get_student_assessments(
    pool: State<'_, DbPool>,
    user_id: String,
    student_id: String
) -> Result<Vec<Assessment>, String> {
    // Finance cannot access assessments
    check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher]).await?;

    let assessments = sqlx::query_as::<_, Assessment>(
        r#"
        SELECT id, title, subject_id, date, max_score, score 
        FROM assessments 
        WHERE student_id = ? 
        ORDER BY date DESC
        "#
    )
    .bind(student_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(assessments)
}
