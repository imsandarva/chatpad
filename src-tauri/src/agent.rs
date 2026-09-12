use crate::host::{Host, SendImage};
use tauri::{AppHandle, State};

/// Forwards a prompt to the durable host and waits for the turn to settle.
#[tauri::command]
pub async fn cursor_send(
    app: AppHandle,
    host: State<'_, Host>,
    prompt: String,
    cwd: String,
    agent_id: Option<String>,
    images: Option<Vec<SendImage>>,
) -> Result<(), String> {
    let host = host.inner().clone();
    tauri::async_runtime::spawn_blocking(move || host.send(&app, &prompt, &cwd, agent_id.as_deref(), images.as_deref()))
        .await
        .map_err(|err| err.to_string())?
}

/// Asks the live host to `run.cancel()` — no-op if nothing is in flight.
#[tauri::command]
pub fn cursor_stop(host: State<'_, Host>) {
    host.stop();
}
