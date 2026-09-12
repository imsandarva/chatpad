use crate::paths::node_host;
use serde::Serialize;
use std::io::{BufRead, BufReader, Write};
use std::process::Stdio;
use tauri::{AppHandle, Emitter};

#[derive(Serialize)]
struct SendRequest<'a> {
    prompt: &'a str,
    cwd: &'a str,
    #[serde(rename = "agentId")]
    agent_id: Option<&'a str>,
}

fn run_send(app: &AppHandle, prompt: &str, cwd: &str, agent_id: Option<&str>) -> Result<(), String> {
    let mut child = node_host()
        .arg("send")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
        .map_err(|err| format!("could not start node: {err}"))?;

    if let Some(mut stdin) = child.stdin.take() {
        serde_json::to_writer(&mut stdin, &SendRequest { prompt, cwd, agent_id })
            .map_err(|err| err.to_string())?;
        stdin.flush().ok();
    }

    if let Some(stdout) = child.stdout.take() {
        for line in BufReader::new(stdout).lines() {
            let line = line.map_err(|err| err.to_string())?;
            if !line.starts_with('{') { continue; }
            let payload: serde_json::Value = serde_json::from_str(&line).map_err(|err| err.to_string())?;
            app.emit("agent-event", payload).map_err(|err| err.to_string())?;
        }
    }

    let status = child.wait().map_err(|err| err.to_string())?;
    if status.success() { Ok(()) } else { Err("the agent stopped".into()) }
}

/// Spawns the host and forwards NDJSON stream lines as `agent-event`.
#[tauri::command]
pub async fn cursor_send(app: AppHandle, prompt: String, cwd: String, agent_id: Option<String>) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || run_send(&app, &prompt, &cwd, agent_id.as_deref()))
        .await
        .map_err(|err| err.to_string())?
}
