import { asSelection, FALLBACK } from "./choice";
import type { ModelSelection } from "./types";

const PICK_KEY = "chatpad.model.pick";
const NAME_KEY = "chatpad.model.name";
const OLD_KEY = "chatpad.settings.model";

export function readPick(): ModelSelection {
  try {
    const raw = localStorage.getItem(PICK_KEY);
    if (raw) return asSelection(JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) return asSelection(old);
  } catch { /* private mode */ }
  return { ...FALLBACK };
}

export function readName(): string {
  try { return localStorage.getItem(NAME_KEY) ?? ""; } catch { return ""; }
}

export function writePick(pick: ModelSelection, name: string) {
  try {
    localStorage.setItem(PICK_KEY, JSON.stringify(pick));
    localStorage.setItem(NAME_KEY, name);
    localStorage.removeItem(OLD_KEY);
  } catch { /* private mode */ }
}
