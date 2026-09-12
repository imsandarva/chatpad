import { asModel, DEFAULT_MODEL, type ModelId } from "./models";

const MARKDOWN_KEY = "chatpad.settings.markdown";
const MODEL_KEY = "chatpad.settings.model";

function readMarkdown(): boolean {
  try {
    const raw = localStorage.getItem(MARKDOWN_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch { /* private mode */ }
  return true;
}

function readModel(): ModelId {
  try { return asModel(localStorage.getItem(MODEL_KEY)); } catch { return DEFAULT_MODEL; }
}

export const settings = $state({
  open: false,
  markdown: readMarkdown(),
  model: readModel(),
});

export function setMarkdown(on: boolean) {
  settings.markdown = on;
  try { localStorage.setItem(MARKDOWN_KEY, on ? "1" : "0"); } catch { /* private mode */ }
}

export function setModel(id: ModelId) {
  if (settings.model === id) return;
  settings.model = id;
  try { localStorage.setItem(MODEL_KEY, id); } catch { /* private mode */ }
  onModel?.();
}

let onModel: (() => void) | undefined;
/** The next send should open a new agent when the choice changes. */
export function whenModelChanges(fn: () => void) { onModel = fn; }

export function openSettings() { settings.open = true; }
export function closeSettings() { settings.open = false; }
