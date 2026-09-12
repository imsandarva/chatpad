use crate::paths::node_host;
use serde::Serialize;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, ChildStdin, Stdio};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Serialize, serde::Deserialize)]
pub struct SendImage {
    data: String,
    #[serde(rename = "mimeType")]
    mime_type: String,
}

#[derive(Serialize)]
struct SendCmd<'a> {
    #[serde(rename = "type")]
    kind: &'static str,
    prompt: &'a str,
    cwd: &'a str,
    #[serde(rename = "agentId")]
    agent_id: Option<&'a str>,
    images: Option<&'a [SendImage]>,
}

struct Turn {
    finished: Mutex<bool>,
    cv: Condvar,
}

impl Turn {
    fn new() -> Arc<Self> {
        Arc::new(Self { finished: Mutex::new(false), cv: Condvar::new() })
    }

    fn wait(&self) {
        let mut done = self.finished.lock().expect("turn lock");
        while !*done {
            done = self.cv.wait(done).expect("turn wait");
        }
    }

    fn finish(&self) {
        *self.finished.lock().expect("turn lock") = true;
        self.cv.notify_all();
    }
}

struct Inner {
    child: Mutex<Option<Child>>,
    stdin: Mutex<Option<ChildStdin>>,
    turn: Mutex<Option<Arc<Turn>>>,
}

/// One Node process for the window — SDK stays loaded, agent stays warm.
#[derive(Clone)]
pub struct Host(Arc<Inner>);

impl Default for Host {
    fn default() -> Self {
        Self(Arc::new(Inner {
            child: Mutex::new(None),
            stdin: Mutex::new(None),
            turn: Mutex::new(None),
        }))
    }
}

impl Host {
    pub fn ensure(&self, app: &AppHandle) -> Result<(), String> {
        {
            let mut child = self.0.child.lock().expect("host child");
            if let Some(live) = child.as_mut() {
                if live.try_wait().ok().flatten().is_none() { return Ok(()); }
            }
            *child = None;
        }

        let mut spawned = node_host()
            .arg("serve")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|err| format!("could not start node: {err}"))?;

        let stdout = spawned.stdout.take().ok_or_else(|| "host stdout closed".to_string())?;
        let stdin = spawned.stdin.take().ok_or_else(|| "host stdin closed".to_string())?;
        *self.0.stdin.lock().expect("host stdin") = Some(stdin);
        *self.0.child.lock().expect("host child") = Some(spawned);

        let host = self.clone();
        let app = app.clone();
        thread::Builder::new()
            .name("chatpad-host".into())
            .spawn(move || host.read_loop(app, stdout))
            .map_err(|err| err.to_string())?;
        Ok(())
    }

    fn read_loop(&self, app: AppHandle, stdout: impl std::io::Read) {
        for line in BufReader::new(stdout).lines() {
            let Ok(line) = line else { break; };
            if !line.starts_with('{') { continue; }
            let Ok(payload) = serde_json::from_str::<serde_json::Value>(&line) else { continue; };
            let kind = payload.get("type").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let _ = app.emit("agent-event", payload);
            if matches!(kind.as_str(), "done" | "cancelled" | "error") {
                if let Some(turn) = self.0.turn.lock().expect("host turn").take() { turn.finish(); }
            }
        }
        if let Some(turn) = self.0.turn.lock().expect("host turn").take() { turn.finish(); }
        *self.0.stdin.lock().expect("host stdin") = None;
        *self.0.child.lock().expect("host child") = None;
    }

    pub fn send(&self, app: &AppHandle, prompt: &str, cwd: &str, agent_id: Option<&str>, images: Option<&[SendImage]>) -> Result<(), String> {
        self.ensure(app)?;
        let turn = Turn::new();
        *self.0.turn.lock().expect("host turn") = Some(turn.clone());

        {
            let mut stdin = self.0.stdin.lock().expect("host stdin");
            let pipe = stdin.as_mut().ok_or_else(|| "host stdin closed".to_string())?;
            serde_json::to_writer(&mut *pipe, &SendCmd { kind: "send", prompt, cwd, agent_id, images }).map_err(|err| err.to_string())?;
            pipe.write_all(b"\n").map_err(|err| err.to_string())?;
            pipe.flush().ok();
        }

        turn.wait();
        Ok(())
    }

    pub fn stop(&self) {
        let mut stdin = self.0.stdin.lock().expect("host stdin");
        if let Some(pipe) = stdin.as_mut() {
            let _ = writeln!(pipe, "{}", serde_json::json!({ "type": "cancel" }));
            let _ = pipe.flush();
        }
    }
}
