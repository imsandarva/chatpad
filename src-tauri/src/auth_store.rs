use serde::Deserialize;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
struct Stored {
    #[serde(rename = "apiKey")]
    api_key: Option<String>,
    email: Option<String>,
    #[serde(rename = "apiKeyExpiresAtMs")]
    expires_at_ms: Option<i64>,
}

pub struct LocalIdentity {
    pub email: String,
}

fn auth_path() -> PathBuf {
    std::env::var_os("HOME").map(PathBuf::from).unwrap_or_default().join(".cursor/sdk/auth.json")
}

fn now_ms() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as i64).unwrap_or(0)
}

/// Local login only — reads the SDK store, never returns the key.
pub fn current() -> Option<LocalIdentity> {
    let stored: Stored = serde_json::from_str(&std::fs::read_to_string(auth_path()).ok()?).ok()?;
    if stored.api_key.as_deref().unwrap_or("").is_empty() { return None; }
    if stored.expires_at_ms.is_some_and(|ms| now_ms() >= ms) { return None; }
    Some(LocalIdentity { email: stored.email.unwrap_or_default() })
}
