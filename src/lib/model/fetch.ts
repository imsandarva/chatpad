import { invoke } from "@tauri-apps/api/core";
import { isNativeShell } from "$lib/platform";
import { seed } from "./choice";
import type { CatalogItem } from "./types";

export async function loadCatalog(): Promise<CatalogItem[]> {
  if (!isNativeShell()) return [...seed];
  const payload = await invoke<{ items?: CatalogItem[] }>("cursor_models");
  return Array.isArray(payload?.items) && payload.items.length ? payload.items : [...seed];
}
