mod db;
mod auth;
mod models;
mod storage;
mod commands;
mod trajectory;
mod csv_io;
mod audit;
mod seed;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match db::init_db(&handle).await {
                    Ok(pool) => {
                        handle.manage(pool);
                    }
                    Err(e) => {
                        eprintln!("Error initializing database: {}", e);
                    }
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            db::backup_db,
            db::restore_db,
            storage::save_photo,
            storage::delete_photo,
            storage::get_photo_path,
            commands::student::get_students,
            commands::student::get_student_details,
            commands::staff::get_staff,
            commands::education::get_student_attendance,
            commands::education::get_student_assessments,
            commands::finance::get_invoices,
            commands::finance::get_student_invoices,
            commands::auth::login,
            trajectory::compute_trajectory,
            csv_io::import_students_csv,
            csv_io::export_students_csv,
            audit::get_audit_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
