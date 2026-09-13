import { invoke } from "@tauri-apps/api/core";
import { isNativeShell } from "$lib/platform";
import type { CatalogItem } from "./types";

export async function loadCatalog(): Promise<CatalogItem[]> {
  if (!isNativeShell()) throw new Error("Open the Chatpad window to see every model.");
  const payload = await invoke<{ items?: CatalogItem[] }>("cursor_models");
  if (!Array.isArray(payload?.items) || !payload.items.length) throw new Error("empty");
  return payload.items;
}
