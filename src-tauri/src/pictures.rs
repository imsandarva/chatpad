//! WebKitGTK does not hand the page clipboard pictures or OS file drops.
//! These commands read the picture on the native side and pass bytes up.

use serde::Serialize;
use std::path::{Path, PathBuf};

const MAX: u64 = 8 * 1024 * 1024;

#[derive(Default, Serialize)]
pub struct Pictures {
    pub items: Vec<Picture>,
    pub oversize: bool,
}

#[derive(Serialize)]
pub struct Picture {
    pub name: String,
    pub mime: String,
    pub data: String,
}

/// Read dropped or copied file paths — images only, size-capped.
#[tauri::command]
pub fn read_pictures(paths: Vec<String>) -> Pictures {
    let mut out = Pictures::default();
    for raw in paths {
        if let Some(pic) = load_path(&path_from(&raw), &mut out.oversize) {
            out.items.push(pic);
        }
    }
    out
}

/// Linux: read the GTK clipboard the window already shares (image, then file URIs).
#[tauri::command]
pub async fn clipboard_attach(app: tauri::AppHandle) -> Result<Pictures, String> {
    #[cfg(not(target_os = "linux"))]
    {
        let _ = app;
        return Ok(Pictures::default());
    }
    #[cfg(target_os = "linux")]
    {
        let (tx, rx) = std::sync::mpsc::sync_channel(1);
        app.run_on_main_thread(move || {
            let _ = tx.send(linux_clipboard());
        })
        .map_err(|err| err.to_string())?;
        tauri::async_runtime::spawn_blocking(move || {
            rx.recv_timeout(std::time::Duration::from_secs(2))
        })
        .await
        .map_err(|err| err.to_string())?
        .map_err(|_| "clipboard".to_string())
    }
}

fn load_path(path: &Path, oversize: &mut bool) -> Option<Picture> {
    let meta = std::fs::metadata(path).ok()?;
    if !meta.is_file() {
        return None;
    }
    if meta.len() > MAX {
        *oversize = true;
        return None;
    }
    let bytes = std::fs::read(path).ok()?;
    let name = path.file_name()?.to_string_lossy().into_owned();
    let mime = mime_of(&bytes, &name)?;
    Some(Picture { name, mime: mime.into(), data: b64(&bytes) })
}

fn mime_of(bytes: &[u8], name: &str) -> Option<&'static str> {
    if bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A]) {
        return Some("image/png");
    }
    if bytes.len() > 2 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF {
        return Some("image/jpeg");
    }
    if bytes.len() > 11 && &bytes[..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        return Some("image/webp");
    }
    if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        return Some("image/gif");
    }
    match Path::new(name).extension()?.to_str()?.to_ascii_lowercase().as_str() {
        "png" => Some("image/png"),
        "jpg" | "jpeg" => Some("image/jpeg"),
        "webp" => Some("image/webp"),
        "gif" => Some("image/gif"),
        _ => None,
    }
}

fn path_from(raw: &str) -> PathBuf {
    let raw = raw.trim();
    if let Some(rest) = raw.strip_prefix("file://") {
        let path = if rest.starts_with('/') {
            percent_decode(rest)
        } else if let Some(slash) = rest.find('/') {
            percent_decode(&rest[slash..])
        } else {
            return PathBuf::from(raw);
        };
        return PathBuf::from(path);
    }
    PathBuf::from(raw)
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(byte) = u8::from_str_radix(std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or(""), 16) {
                out.push(byte);
                i += 3;
                continue;
            }
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn b64(bytes: &[u8]) -> String {
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    STANDARD.encode(bytes)
}

#[cfg(target_os = "linux")]
fn linux_clipboard() -> Pictures {
    let clip = gtk::Clipboard::get(&gdk::SELECTION_CLIPBOARD);
    let mut out = Pictures::default();
    if let Some(pic) = gtk_image(&clip, &mut out.oversize) {
        out.items.push(pic);
        return out;
    }
    let uris = if clip.wait_is_uris_available() { clip.wait_for_uris() } else { Vec::new() };
    let texts = if uris.is_empty() { clip.wait_for_text().into_iter().collect::<Vec<_>>() } else { Vec::new() };
    let raws: Vec<String> = if !uris.is_empty() {
        uris.iter().map(|uri| uri.to_string()).collect()
    } else {
        texts.iter().flat_map(|text| text.lines().map(|line| line.trim().to_string())).filter(|line| !line.is_empty() && line != "copy" && line != "cut" && !line.starts_with('#')).collect()
    };
    for raw in raws {
        if let Some(pic) = load_path(&path_from(&raw), &mut out.oversize) {
            out.items.push(pic);
        }
    }
    out
}

#[cfg(target_os = "linux")]
fn gtk_image(clip: &gtk::Clipboard, oversize: &mut bool) -> Option<Picture> {
    if clip.wait_is_image_available() {
        if let Some(pixbuf) = clip.wait_for_image() {
            if let Ok(bytes) = pixbuf.save_to_bufferv("png", &[]) {
                if let Some(pic) = from_bytes("Picture.png", "image/png", bytes, oversize) { return Some(pic); }
            }
        }
    }
    for (target, name, mime) in [("image/png", "Picture.png", "image/png"), ("image/jpeg", "Picture.jpg", "image/jpeg")] {
        let atom = gdk::Atom::intern(target);
        if !clip.wait_is_target_available(&atom) { continue; }
        let Some(sel) = clip.wait_for_contents(&atom) else { continue; };
        if let Some(pic) = from_bytes(name, mime, sel.data(), oversize) { return Some(pic); }
    }
    None
}

fn from_bytes(name: &str, mime: &str, bytes: Vec<u8>, oversize: &mut bool) -> Option<Picture> {
    if bytes.is_empty() { return None; }
    if bytes.len() as u64 > MAX { *oversize = true; return None; }
    Some(Picture { name: name.into(), mime: mime.into(), data: b64(&bytes) })
}
