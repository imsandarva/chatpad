const MARKDOWN_KEY = "chatpad.settings.markdown";

function readMarkdown(): boolean {
  try {
    const raw = localStorage.getItem(MARKDOWN_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch { /* private mode */ }
  return true;
}

export const settings = $state({
  open: false,
  markdown: readMarkdown(),
});

export function setMarkdown(on: boolean) {
  settings.markdown = on;
  try { localStorage.setItem(MARKDOWN_KEY, on ? "1" : "0"); } catch { /* private mode */ }
}

export function openSettings() { settings.open = true; }
export function closeSettings() { settings.open = false; }
