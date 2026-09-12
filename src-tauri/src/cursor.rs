use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "kebab-case")]
pub enum Session {
    LoggedOut,
    LoggedIn { email: String, name: String },
}

fn project_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..")
}

fn run_sync(action: &str) -> Result<Session, String> {
    if !matches!(action, "status" | "login" | "logout") {
        return Err("unknown auth action".into());
    }

    let host = project_root().join("host/cli.ts");
    let output = Command::new("node")
        .current_dir(project_root())
        .arg(&host)
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
