use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

/// This repo until the user picks another folder.
#[tauri::command]
pub fn default_workspace() -> String {
    crate::paths::project_root_display()
}

#[tauri::command]
pub fn pick_workspace(app: AppHandle, current: String) -> Option<String> {
    let mut dialog = app.dialog().file();
    if !current.is_empty() {
        dialog = dialog.set_directory(&current);
    }
    dialog
        .blocking_pick_folder()
        .and_then(|path| path.into_path().ok())
        .map(|path| path.to_string_lossy().into_owned())
}
