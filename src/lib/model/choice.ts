import type { CatalogItem, ModelSelection, Option } from "./types";

export const FALLBACK: ModelSelection = { id: "composer-2.5" };

/** Used until Cursor answers, or if you are signed out. */
export const seed: readonly CatalogItem[] = [
  { id: "composer-2.5", label: "Composer 2.5" },
  { id: "default", label: "Auto", aliases: ["auto"] },
];

const legacy: Record<string, ModelSelection> = {
  composer: { id: "composer-2.5" },
  faster: { id: "composer-2.5" },
  auto: { id: "default" },
};

export function same(a: ModelSelection, b: ModelSelection): boolean {
  return a.id === b.id;
}

export function asSelection(raw: unknown): ModelSelection {
  if (typeof raw === "string") return legacy[raw] ?? FALLBACK;
  if (!raw || typeof raw !== "object") return { ...FALLBACK };
  const rec = raw as { id?: unknown; params?: unknown };
  const id = typeof rec.id === "string" ? rec.id.trim() : "";
  if (!id) return { ...FALLBACK };
  const mapped = id === "auto" ? "default" : id;
  const params = Array.isArray(rec.params)
    ? rec.params.flatMap((row) => {
        if (!row || typeof row !== "object") return [];
        const p = row as { id?: unknown; value?: unknown };
        return typeof p.id === "string" && typeof p.value === "string" ? [{ id: p.id, value: p.value }] : [];
      })
    : [];
  return params.length ? { id: mapped, params } : { id: mapped };
}

function pretty(id: string): string {
  return id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bGpt\b/g, "GPT");
}

function family(item: CatalogItem): string {
  const hay = `${item.id} ${item.label}`.toLowerCase();
  if (hay.includes("claude") || hay.includes("opus") || hay.includes("sonnet") || hay.includes("fable")) return "Claude";
  if (hay.includes("gpt") || hay.includes("codex")) return "GPT";
  if (hay.includes("gemini")) return "Gemini";
  if (hay.includes("grok")) return "Grok";
  if (hay.includes("composer")) return "Composer";
  if (hay.includes("muse")) return "Muse";
  if (item.id === "default" || hay === "auto") return "Auto";
  return item.label;
}

export function flatten(items: readonly CatalogItem[]): Option[] {
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    params: item.params,
    label: item.label,
    note: item.hint,
    group: family(item),
    aliases: item.aliases,
  }));
}

export function face(opt: Option): string {
  return opt.label;
}

export function findOption(rows: readonly Option[], pick: ModelSelection): Option | undefined {
  return rows.find((row) => same(row, pick));
}

export function labelOf(rows: readonly Option[], pick: ModelSelection, remembered?: string): string {
  const hit = findOption(rows, pick);
  return hit ? face(hit) : remembered || pretty(pick.id);
}

export function matches(opt: Option, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [opt.label, opt.group, opt.note, opt.id, ...(opt.aliases ?? [])].join(" ").toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

export function withCurrent(rows: Option[], pick: ModelSelection, remembered?: string): Option[] {
  if (findOption(rows, pick)) return rows;
  return [{ key: pick.id, id: pick.id, params: pick.params, label: remembered || pretty(pick.id), group: remembered || pretty(pick.id) }, ...rows];
}
