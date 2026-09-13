use crate::paths::node_host;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "kebab-case")]
pub enum Session {
    LoggedOut,
    LoggedIn { email: String, name: String },
}

fn display_name(email: &str) -> String {
    let local = email.split('@').next().unwrap_or("");
    if local.is_empty() { "Signed in".into() } else { local.to_string() }
}

fn local_status() -> Session {
    match crate::auth_store::current() {
        Some(who) => { let name = display_name(&who.email); Session::LoggedIn { email: who.email, name } }
        None => Session::LoggedOut,
    }
}

fn run_sync(action: &str) -> Result<Session, String> {
    if action == "status" { return Ok(local_status()); }
    if !matches!(action, "login" | "logout") {
        return Err("unknown auth action".into());
    }

    let output = node_host()
        .arg(action)
        .output()
        .map_err(|err| format!("could not start node: {err}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(stderr.trim().if_empty("sign-in failed").to_string());
    }

    serde_json::from_slice(&output.stdout).map_err(|err| format!("bad host response: {err}"))
}

trait IfEmpty {
    fn if_empty(self, fallback: &str) -> String;
}

impl IfEmpty for &str {
    fn if_empty(self, fallback: &str) -> String {
        if self.is_empty() { fallback.to_string() } else { self.to_string() }
    }
}

/// Browser login lives in Node (`@cursor/sdk`); Rust only spawns the host.
#[tauri::command]
pub async fn cursor_session(action: String) -> Result<Session, String> {
    tauri::async_runtime::spawn_blocking(move || run_sync(&action))
        .await
        .map_err(|err| err.to_string())?
}

fn run_models() -> Result<serde_json::Value, String> {
    let output = node_host()
        .arg("models")
        .output()
        .map_err(|err| format!("could not start node: {err}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(stderr.trim().if_empty("couldn’t load models").to_string());
    }

    serde_json::from_slice(&output.stdout).map_err(|err| format!("bad host response: {err}"))
}

/// Live catalog for this account (`Cursor.models.list()`). The page never sees the key.
#[tauri::command]
pub async fn cursor_models() -> Result<serde_json::Value, String> {
    tauri::async_runtime::spawn_blocking(run_models)
        .await
        .map_err(|err| err.to_string())?
}
