use crate::db::DbPool;
use crate::models::{Role, StudentEducationProfile, StudentFinanceProfile};
use crate::auth::check_auth;
use tauri::State;
use serde::Serialize;

#[derive(Serialize)]
#[serde(untagged)]
pub enum StudentListResult {
    Finance(Vec<StudentFinanceProfile>),
    Education(Vec<StudentEducationProfile>),
}

#[derive(Serialize)]
#[serde(untagged)]
pub enum StudentProfileResult {
    Finance(StudentFinanceProfile),
    Education(StudentEducationProfile),
}

#[tauri::command]
pub async fn get_students(
    pool: State<'_, DbPool>,
    user_id: String,
) -> Result<StudentListResult, String> {
    let user = check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher, Role::ManagementFinance]).await?;
    let user_role = Role::from(user.role);

    match user_role {
        Role::ManagementFinance => {
            let students = sqlx::query_as::<_, StudentFinanceProfile>(
                r#"
                SELECT 
                    s.id, s.full_name, s.student_code, 
                    c.name as class_name, s.photo_path
                FROM students s
                JOIN classes c ON s.class_id = c.id
                WHERE s.status = 'ACTIVE'
                "#
            )
            .fetch_all(&*pool)
            .await
            .map_err(|e| e.to_string())?;
            
            Ok(StudentListResult::Finance(students))
        }
        _ => {
            let students = sqlx::query_as::<_, StudentEducationProfile>(
                r#"
                SELECT 
                    s.id, s.full_name, s.student_code, 
                    c.name as class_name, 
                    s.date_of_birth, s.gender, s.address, 
                    s.guardian_name, s.guardian_contact, s.emergency_contact,
                    s.photo_path, s.enrollment_date, s.status
                FROM students s
                JOIN classes c ON s.class_id = c.id
                WHERE s.status = 'ACTIVE'
                "#
            )
            .fetch_all(&*pool)
            .await
            .map_err(|e| e.to_string())?;
            
            Ok(StudentListResult::Education(students))
        }
    }
}

#[tauri::command]
pub async fn get_student_details(
    pool: State<'_, DbPool>,
    user_id: String,
    student_id: String
) -> Result<StudentProfileResult, String> {
    let user = check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher, Role::ManagementFinance]).await?;
    let user_role = Role::from(user.role);

    match user_role {
        Role::ManagementFinance => {
            let student = sqlx::query_as::<_, StudentFinanceProfile>(
                r#"
                SELECT 
                    s.id, s.full_name, s.student_code, 
                    c.name as class_name, s.photo_path
                FROM students s
                JOIN classes c ON s.class_id = c.id
                WHERE s.id = ?
                "#
            )
            .bind(student_id)
            .fetch_optional(&*pool)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Student not found".to_string())?;
            
            Ok(StudentProfileResult::Finance(student))
        }
        _ => {
            let student = sqlx::query_as::<_, StudentEducationProfile>(
                r#"
                SELECT 
                    s.id, s.full_name, s.student_code, 
                    c.name as class_name, 
                    s.date_of_birth, s.gender, s.address, 
                    s.guardian_name, s.guardian_contact, s.emergency_contact,
                    s.photo_path, s.enrollment_date, s.status
                FROM students s
                JOIN classes c ON s.class_id = c.id
                WHERE s.id = ?
                "#
            )
            .bind(student_id)
            .fetch_optional(&*pool)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Student not found".to_string())?;
            
            Ok(StudentProfileResult::Education(student))
        }
    }
}
