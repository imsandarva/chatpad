use crate::paths::node_host;
use serde::Serialize;
use std::io::{BufRead, BufReader, Write};
use std::process::{ChildStdin, Stdio};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};

#[derive(Serialize)]
struct SendRequest<'a> {
    prompt: &'a str,
    cwd: &'a str,
    #[serde(rename = "agentId")]
    agent_id: Option<&'a str>,
}

struct LiveInner {
    stdin: Option<ChildStdin>,
    wants_stop: bool,
    active: bool,
}

/// Stdin of the in-flight host process — Stop writes a cancel line here.
#[derive(Clone)]
pub struct LiveRun(Arc<Mutex<LiveInner>>);

impl Default for LiveRun {
    fn default() -> Self {
        Self(Arc::new(Mutex::new(LiveInner { stdin: None, wants_stop: false, active: false })))
    }
}

impl LiveRun {
    fn begin(&self) {
        let mut live = self.0.lock().expect("live run lock");
        *live = LiveInner { stdin: None, wants_stop: false, active: true };
    }

    fn attach(&self, mut stdin: ChildStdin) {
        let mut live = self.0.lock().expect("live run lock");
        if live.wants_stop {
            let _ = writeln!(stdin, "{}", serde_json::json!({ "type": "cancel" }));
            let _ = stdin.flush();
        }
        live.stdin = Some(stdin);
    }

    fn request_stop(&self) {
        let mut live = self.0.lock().expect("live run lock");
        if !live.active { return; }
        live.wants_stop = true;
        if let Some(stdin) = live.stdin.as_mut() {
            let _ = writeln!(stdin, "{}", serde_json::json!({ "type": "cancel" }));
            let _ = stdin.flush();
        }
    }

    fn clear(&self) {
        let mut live = self.0.lock().expect("live run lock");
        *live = LiveInner { stdin: None, wants_stop: false, active: false };
    }
}

fn run_send(app: &AppHandle, live: &LiveRun, prompt: &str, cwd: &str, agent_id: Option<&str>) -> Result<(), String> {
    live.begin();
    let result = (|| {
        let mut child = node_host()
            .arg("send")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|err| format!("could not start node: {err}"))?;

        let mut stdin = child.stdin.take().ok_or_else(|| "host stdin closed".to_string())?;
        serde_json::to_writer(&mut stdin, &SendRequest { prompt, cwd, agent_id }).map_err(|err| err.to_string())?;
        stdin.write_all(b"\n").map_err(|err| err.to_string())?;
        stdin.flush().ok();
        live.attach(stdin);

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
    })();
    live.clear();
    result
}

/// Spawns the host and forwards NDJSON stream lines as `agent-event`.
#[tauri::command]
pub async fn cursor_send(
    app: AppHandle,
    live: State<'_, LiveRun>,
    prompt: String,
    cwd: String,
    agent_id: Option<String>,
) -> Result<(), String> {
    let live = live.inner().clone();
    tauri::async_runtime::spawn_blocking(move || run_send(&app, &live, &prompt, &cwd, agent_id.as_deref()))
        .await
        .map_err(|err| err.to_string())?
}

/// Asks the live host to `run.cancel()` — no-op if nothing is in flight.
#[tauri::command]
pub fn cursor_stop(live: State<'_, LiveRun>) {
    live.request_stop();
}
