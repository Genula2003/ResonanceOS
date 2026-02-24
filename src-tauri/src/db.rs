use sqlx::{sqlite::{SqliteConnectOptions, SqlitePoolOptions}, Pool, Sqlite, Row};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use std::str::FromStr;

pub type DbPool = Pool<Sqlite>;

pub async fn init_db(app: &AppHandle) -> Result<DbPool, Box<dyn std::error::Error>> {
    let app_dir = app.path().app_data_dir()?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }

    let db_path = app_dir.join("resonance.db");
    let db_str = db_path.to_str().unwrap();

    // Auto-backup before migration
    if db_path.exists() {
        let backup_dir = app_dir.join("backups");
        if !backup_dir.exists() {
            fs::create_dir_all(&backup_dir)?;
        }
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_file = backup_dir.join(format!("resonance_backup_{}.db", timestamp));
        
        if let Err(e) = fs::copy(&db_path, &backup_file) {
            eprintln!("Failed to create backup: {}", e);
        } else {
             println!("Database backup created at {:?}", backup_file);
        }
    }

    let options = SqliteConnectOptions::from_str(&format!("sqlite:{}", db_str))?
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    // Integrity Check
    let row = sqlx::query("PRAGMA integrity_check")
        .fetch_one(&pool)
        .await?;
    
    let integrity_status: String = row.get(0);
    
    if integrity_status == "ok" {
        println!("Database integrity check passed.");
    } else {
        eprintln!("Database integrity check failed! Attempting recovery...");
    }

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;

    // Seed Data
    if let Err(e) = crate::seed::seed_database(&pool).await {
        eprintln!("Failed to seed database: {}", e);
    }

    Ok(pool)
}

#[tauri::command]
pub async fn backup_db(app: AppHandle) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("resonance.db");
    
    if !db_path.exists() {
        return Err("Database file not found".to_string());
    }

    let backup_dir = app_dir.join("manual_backups");
    if !backup_dir.exists() {
        if let Err(e) = fs::create_dir_all(&backup_dir) {
             return Err(e.to_string());
        }
    }

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_file_name = format!("resonance_manual_{}.db", timestamp);
    let backup_path = backup_dir.join(&backup_file_name);
    
    if let Err(e) = fs::copy(&db_path, &backup_path) {
        return Err(e.to_string());
    }

    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn restore_db(app: AppHandle, backup_path_str: String) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("resonance.db");
    
    let source = PathBuf::from(&backup_path_str);
    if !source.exists() {
        return Err("Backup file not found".to_string());
    }

    // Backup current before restoring
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let safety_backup = app_dir.join(format!("safety_backup_before_restore_{}.db", timestamp));
    if let Err(e) = fs::copy(&db_path, &safety_backup) {
         return Err(format!("Failed to create safety backup: {}", e));
    }

    if let Err(e) = fs::copy(source, &db_path) {
         return Err(format!("Failed to restore database: {}", e));
    }

    Ok("Database restored successfully. Please restart the application.".to_string())
}
