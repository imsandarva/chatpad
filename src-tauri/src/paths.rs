use std::path::PathBuf;
use std::process::Command;

pub fn project_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..")
}

pub fn project_root_display() -> String {
    project_root()
        .canonicalize()
        .unwrap_or_else(|_| project_root())
        .to_string_lossy()
        .into_owned()
}

pub fn node_host() -> Command {
    let mut cmd = Command::new("node");
    cmd.current_dir(project_root()).arg(project_root().join("host/cli.ts"));
    cmd
}
