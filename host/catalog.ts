import { Cursor } from "@cursor/sdk";

export type CatalogParam = { id: string; label?: string; values: { value: string; label?: string }[] };
export type CatalogVariant = { label: string; hint?: string; def?: boolean; params: { id: string; value: string }[] };
export type CatalogItem = {
  id: string;
  label: string;
  hint?: string;
  aliases?: string[];
  parameters?: CatalogParam[];
  variants?: CatalogVariant[];
};

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Slim `Cursor.models.list()` — only what the write box needs. */
export async function listCatalog(): Promise<CatalogItem[]> {
  const items = await Cursor.models.list();
  if (!Array.isArray(items)) return [];
  return items.flatMap((raw) => {
    const id = text(raw?.id);
    const label = text(raw?.displayName) ?? id;
    if (!id || !label) return [];
    const hint = text(raw?.description);
    const aliases = Array.isArray(raw.aliases) ? raw.aliases.filter((row): row is string => typeof row === "string") : [];
    const parameters = Array.isArray(raw.parameters)
      ? raw.parameters.flatMap((row) => {
          const pid = text(row?.id);
          if (!pid || !Array.isArray(row.values)) return [];
          const values = row.values.flatMap((v) => {
            const value = text(v?.value);
            return value ? [{ value, label: text(v.displayName) }] : [];
          });
          return values.length ? [{ id: pid, label: text(row.displayName), values }] : [];
        })
      : [];
    const variants = Array.isArray(raw.variants)
      ? raw.variants.flatMap((row) => {
          const name = text(row?.displayName);
          if (!name) return [];
          const params = Array.isArray(row.params)
            ? row.params.flatMap((p) => {
                const pid = text(p?.id);
                const value = text(p?.value);
                return pid && value ? [{ id: pid, value }] : [];
              })
            : [];
          return [{ label: name, hint: text(row.description), def: row.isDefault === true, params }];
        })
      : [];
    const item: CatalogItem = { id, label };
    if (hint) item.hint = hint;
    if (aliases.length) item.aliases = aliases;
    if (parameters.length) item.parameters = parameters;
    if (variants.length) item.variants = variants;
    return [item];
  });
}
