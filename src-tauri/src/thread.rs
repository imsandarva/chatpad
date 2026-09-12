//! One JSON file per folder — the thread and agent id survive a closed window.

use sha2::{Digest, Sha256};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn thread_load(app: AppHandle, cwd: String) -> Result<Option<String>, String> {
    let path = thread_path(&app, &cwd)?;
    if !path.is_file() {
        return Ok(None);
    }
    std::fs::read_to_string(path).map(Some).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn thread_save(app: AppHandle, cwd: String, body: String) -> Result<(), String> {
    let path = thread_path(&app, &cwd)?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, body.as_bytes()).map_err(|err| err.to_string())?;
    std::fs::rename(tmp, path).map_err(|err| err.to_string())
}

fn thread_path(app: &AppHandle, cwd: &str) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|err| err.to_string())?.join("threads");
    std::fs::create_dir_all(&dir).map_err(|err| err.to_string())?;
    Ok(dir.join(format!("{}.json", key(cwd))))
}

fn key(cwd: &str) -> String {
    let digest = Sha256::digest(cwd.as_bytes());
    let mut out = String::with_capacity(digest.len() * 2);
    for byte in digest {
        out.push(char::from(b"0123456789abcdef"[(byte >> 4) as usize]));
        out.push(char::from(b"0123456789abcdef"[(byte & 0x0f) as usize]));
    }
    out
}
