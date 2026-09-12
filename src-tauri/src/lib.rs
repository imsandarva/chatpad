mod agent;
mod auth_store;
mod cursor;
mod host;
mod paths;
mod pictures;
mod thread;
mod workspace;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(host::Host::default())
        .setup(|app| {
            let host = app.state::<host::Host>().inner().clone();
            let handle = app.handle().clone();
            std::thread::spawn(move || { let _ = host.ensure(&handle); });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            agent::cursor_send,
            agent::cursor_stop,
            cursor::cursor_session,
            workspace::default_workspace,
            workspace::pick_workspace,
            pictures::read_pictures,
            pictures::clipboard_attach,
            thread::thread_load,
            thread::thread_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
