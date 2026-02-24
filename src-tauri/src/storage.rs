use std::fs;
use std::path::{Path, PathBuf};
use tauri::{State, AppHandle, Manager};
use crate::db::DbPool;
use crate::auth::check_auth;
use crate::models::Role;
use crate::audit::log_audit;

// Prevent path traversal by ensuring the final path is within the intended directory
fn get_safe_photo_dir(app: &AppHandle, sub_dir: &str) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let photo_dir = app_dir.join(sub_dir);
    
    if !photo_dir.exists() {
        if let Err(e) = fs::create_dir_all(&photo_dir) {
            return Err(e.to_string());
        }
    }
    
    Ok(photo_dir)
}

fn validate_image_file(file_path: &str) -> Result<(), String> {
    let path = Path::new(file_path);
    let extension = path.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .ok_or("Invalid file extension")?;
        
    match extension.as_str() {
        "jpg" | "jpeg" | "png" => Ok(()),
        _ => Err("Only JPG and PNG files are allowed".to_string()),
    }
}

#[tauri::command]
pub async fn save_photo(
    app: AppHandle,
    pool: State<'_, DbPool>,
    user_id: String,
    entity_type: String, // "student" or "staff"
    entity_id: String, 
    source_path: String
) -> Result<String, String> {
    // Auth Check
    check_auth(&pool, &user_id, &[Role::Admin, Role::Teacher]).await?;

    if let Err(e) = validate_image_file(&source_path) {
        return Err(e);
    }
    
    // Check file size (limit to 5MB)
    let metadata = fs::metadata(&source_path).map_err(|e| e.to_string())?;
    if metadata.len() > 5 * 1024 * 1024 {
        return Err("File size exceeds 5MB limit".to_string());
    }

    let sub_dir = match entity_type.as_str() {
        "student" => "student_photos",
        "staff" => "staff_photos",
        _ => return Err("Invalid entity type".to_string()),
    };

    let photo_dir = get_safe_photo_dir(&app, sub_dir)?;
    
    // Determine extension from source
    let source_p = Path::new(&source_path);
    let ext = source_p.extension().and_then(|s| s.to_str()).unwrap_or("jpg");
    
    let target_filename = format!("{}.{}", entity_id, ext);
    let target_path = photo_dir.join(&target_filename);

    if let Err(e) = fs::copy(&source_path, &target_path) {
        return Err(e.to_string());
    }

    let relative_path = format!("{}/{}", sub_dir, target_filename);

    // Audit Log
    let _ = log_audit(
        &pool, 
        &user_id, 
        "SAVE_PHOTO", 
        &entity_type.to_uppercase(), 
        &entity_id, 
        Some(&relative_path)
    ).await;

    // Ideally, we store "student_photos/student_123.jpg"
    Ok(relative_path)
}

#[tauri::command]
pub async fn delete_photo(
    app: AppHandle,
    pool: State<'_, DbPool>,
    user_id: String,
    entity_type: String,
    entity_id: String
) -> Result<(), String> {
    check_auth(&pool, &user_id, &[Role::Admin]).await?; // Only admin delete? Or Teacher? Let's say Admin.

    let sub_dir = match entity_type.as_str() {
        "student" => "student_photos",
        "staff" => "staff_photos",
        _ => return Err("Invalid entity type".to_string()),
    };

    let photo_dir = get_safe_photo_dir(&app, sub_dir)?;
    
    // Try to find file with jpg or png
    let possible_exts = ["jpg", "jpeg", "png"];
    let mut deleted = false;
    for ext in possible_exts {
        let filename = format!("{}.{}", entity_id, ext);
        let path = photo_dir.join(&filename); // Join safe path
        if path.exists() {
            if let Err(e) = fs::remove_file(path) {
                return Err(e.to_string());
            }
            deleted = true;
        }
    }
    
    if deleted {
        let _ = log_audit(
            &pool, 
            &user_id, 
            "DELETE_PHOTO", 
            &entity_type.to_uppercase(), 
            &entity_id, 
            None
        ).await;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_photo_path(
    app: AppHandle,
    relative_path: String
) -> Result<String, String> {
    // Validate relative path prevents traversal
    if relative_path.contains("..") || relative_path.starts_with("/") || relative_path.contains("\\") {
        return Err("Invalid path".to_string());
    }
    
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let full_path = app_dir.join(&relative_path);
    
    if full_path.exists() {
        Ok(full_path.to_string_lossy().to_string())
    } else {
        Err("File not found".to_string())
    }
}
