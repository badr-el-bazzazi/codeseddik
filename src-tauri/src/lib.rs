use tauri::Manager as _;
use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 7,
            description: "create_series_tables",
            sql: "CREATE TABLE Series (serie_id INTEGER PRIMARY KEY AUTOINCREMENT,description TEXT NOT NULL, category TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS Questions (
                question_id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_type TEXT NOT NULL,
                question_image BLOB NOT NULL,
                question_audio BLOB NOT NULL,
                question_answer BLOB NOT NULL,
                question_video BLOB NULL,
                question_1 TEXT NOT NULL,
                question_2 TEXT NULL,
                question_sug_1 TEXT NOT NULL,
                question_sug_2 TEXT NOT NULL,
                question_sug_3 TEXT NULL,
                question_sug_4 TEXT NULL,
                correct_answer_code INTEGER,
                serie_id INTEGER NOT NULL,
                FOREIGN KEY (serie_id) REFERENCES Series(serie_id) ON DELETE CASCADE);
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:roadcode.db", migrations)
                .build(),
        )
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();
            // Add the initialization script to prevent right-clicks
            main_window
                .eval(
                    r#"
                document.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                }, false);
                // Prevent other keyboard shortcuts that might open context menu
                document.addEventListener('keydown', (e) => {
                    // Prevent Shift + F10
                    if (e.shiftKey && e.keyCode === 121) {
                        e.preventDefault();
                        return false;
                    }
                    // Prevent Windows context menu key
                    if (e.keyCode === 93) {
                        e.preventDefault();
                        return false;
                    }
                }, false);
                "#,
                )
                .expect("Failed to inject right-click prevention script");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
