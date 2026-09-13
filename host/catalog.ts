import { Cursor } from "@cursor/sdk";

export type CatalogItem = {
  id: string;
  label: string;
  hint?: string;
  aliases?: string[];
  params?: { id: string; value: string }[];
};

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** One row per model, with Cursor’s default params — not the variant explosion. */
export async function listCatalog(): Promise<CatalogItem[]> {
  const items = await Cursor.models.list();
  if (!Array.isArray(items)) return [];
  return items.flatMap((raw) => {
    const id = text(raw?.id);
    const label = text(raw?.displayName) ?? id;
    if (!id || !label) return [];
    const aliases = Array.isArray(raw.aliases) ? raw.aliases.filter((row): row is string => typeof row === "string") : [];
    const chosen = Array.isArray(raw.variants) ? raw.variants.find((row) => row?.isDefault === true) ?? raw.variants[0] : undefined;
    const params = Array.isArray(chosen?.params)
      ? chosen.params.flatMap((row) => {
          const pid = text(row?.id);
          const value = text(row?.value);
          return pid && value ? [{ id: pid, value }] : [];
        })
      : [];
    const item: CatalogItem = { id, label };
    const hint = text(raw?.description);
    if (hint) item.hint = hint;
    if (aliases.length) item.aliases = aliases;
    if (params.length) item.params = params;
    return [item];
  });
}
