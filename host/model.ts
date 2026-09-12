/** What `Agent.create` accepts — the page picks, the host only applies. */
export type ModelParam = { id: string; value: string };
export type ModelSelection = { id: string; params?: ModelParam[] };

export const fallback: ModelSelection = { id: "composer-2.5" };

export function pick(raw?: ModelSelection | null): ModelSelection {
  const id = typeof raw?.id === "string" ? raw.id.trim() : "";
  if (!id) return { ...fallback };
  const params = Array.isArray(raw.params)
    ? raw.params.filter((row) => row && typeof row.id === "string" && typeof row.value === "string")
    : [];
  return params.length ? { id, params } : { id };
}

export function key(model: ModelSelection): string {
  return JSON.stringify(model);
}
