mod agent;
mod auth_store;
mod cursor;
mod paths;
mod workspace;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(agent::LiveRun::default())
        .invoke_handler(tauri::generate_handler![
            agent::cursor_send,
            agent::cursor_stop,
            cursor::cursor_session,
            workspace::default_workspace,
            workspace::pick_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
