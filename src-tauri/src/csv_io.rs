use crate::db::DbPool;
use crate::models::{Role};
use crate::auth::check_auth;
use crate::audit::log_audit;
use tauri::State;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Deserialize)]
struct StudentCsvRow {
    full_name: String,
    student_code: String,
    class_name: String, // We'll need to lookup class_id
    enrollment_date: String, // YYYY-MM-DD
    gender: Option<String>,
    address: Option<String>,
    guardian_name: Option<String>,
    guardian_contact: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    success: bool,
    rows_processed: usize,
    errors: Vec<String>,
}

#[tauri::command]
pub async fn import_students_csv(
    pool: State<'_, DbPool>,
    user_id: String,
    file_path: String,
) -> Result<ImportResult, String> {
    // Only Admin can import for now
    check_auth(&pool, &user_id, &[Role::Admin]).await?;

    let path = Path::new(&file_path);
    if !path.exists() {
        return Err("File not found".to_string());
    }

    let mut rdr = csv::Reader::from_path(path).map_err(|e| e.to_string())?;
    
    // Start transaction
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;
    
    let mut rows_processed = 0;
    let mut errors = Vec::new();

    for result in rdr.deserialize() {
        let row: StudentCsvRow = match result {
            Ok(row) => row,
            Err(e) => {
                errors.push(format!("Row {}: Parse error: {}", rows_processed + 1, e));
                continue; // or break to fail hard
            }
        };

        // Lookup class_id from class_name
        let class_id_opt = sqlx::query_scalar::<_, String>("SELECT id FROM classes WHERE name = ?")
            .bind(&row.class_name)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        let class_id = match class_id_opt {
            Some(id) => id,
            None => {
                errors.push(format!("Row {}: Class '{}' not found", rows_processed + 1, row.class_name));
                continue; 
            }
        };

        // Check duplicates
        let exists = sqlx::query_scalar::<_, i32>("SELECT 1 FROM students WHERE student_code = ?")
            .bind(&row.student_code)
            .fetch_optional(&mut *tx)
            .await
            .map_err(|e| e.to_string())?;

        if exists.is_some() {
             errors.push(format!("Row {}: Duplicate student code '{}'", rows_processed + 1, row.student_code));
             continue;
        }

        // Insert
        let id = uuid::Uuid::new_v4().to_string();
        let campus_id = "campus_01"; // Default or lookup
        
        let res = sqlx::query(
            r#"
            INSERT INTO students (
                id, campus_id, class_id, student_code, full_name, 
                enrollment_date, status, gender, address, 
                guardian_name, guardian_contact
            ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
            "#
        )
        .bind(id)
        .bind(campus_id)
        .bind(class_id)
        .bind(row.student_code)
        .bind(row.full_name)
        .bind(row.enrollment_date) // Assuming string format is valid YYYY-MM-DD
        .bind(row.gender)
        .bind(row.address)
        .bind(row.guardian_name)
        .bind(row.guardian_contact)
        .execute(&mut *tx)
        .await;

        if let Err(e) = res {
            errors.push(format!("Row {}: DB Error: {}", rows_processed + 1, e));
        }

        rows_processed += 1;
    }

    if !errors.is_empty() {
        // Rollback if any critical errors
        tx.rollback().await.map_err(|e| e.to_string())?;
        return Ok(ImportResult {
            success: false,
            rows_processed: 0,
            errors,
        });
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    // Audit Log
    let _ = log_audit(
        &pool, 
        &user_id, 
        "IMPORT_STUDENTS", 
        "BATCH", 
        "CSV", 
        Some(&format!("Processed {} rows from {}", rows_processed, file_path))
    ).await;

    Ok(ImportResult {
        success: true,
        rows_processed,
        errors: Vec::new(),
    })
}

#[tauri::command]
pub async fn export_students_csv(
    pool: State<'_, DbPool>,
    user_id: String,
    export_path: String,
) -> Result<String, String> {
    let _user = check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher]).await?; 
    
    let rows = sqlx::query_as::<_, (String, String, String, String, String)>(
        r#"
        SELECT s.student_code, s.full_name, c.name as class_name, s.enrollment_date, s.status
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.status = 'ACTIVE'
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    let path = Path::new(&export_path);
    let mut wtr = csv::Writer::from_path(path).map_err(|e| e.to_string())?;

    wtr.write_record(&["Student Code", "Full Name", "Class", "Enrollment Date", "Status"]).map_err(|e| e.to_string())?;

    for row in &rows {
        wtr.write_record(&[&row.0, &row.1, &row.2, &row.3, &row.4]).map_err(|e| e.to_string())?;
    }

    wtr.flush().map_err(|e| e.to_string())?;

    // Audit Log
    let _ = log_audit(
        &pool, 
        &user_id, 
        "EXPORT_STUDENTS", 
        "BATCH", 
        "CSV", 
        Some(&format!("Exported {} rows to {}", rows.len(), export_path))
    ).await;

    Ok(format!("Exported {} rows to {}", rows.len(), export_path))
}
