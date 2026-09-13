import { flatten, labelOf, same, seed, withCurrent } from "./choice";
import { loadCatalog } from "./fetch";
import { readName, readPick, writePick } from "./persist";
import type { ModelSelection, Option } from "./types";

export const model = $state({
  pick: readPick(),
  name: readName(),
  rows: flatten(seed) as Option[],
  live: false,
  loading: false,
  error: "",
});

let onChange: (() => void) | undefined;
/** The next send should open a new agent when the choice changes. */
export function whenModelChanges(fn: () => void) { onChange = fn; }

export function selectionOf(): ModelSelection {
  return model.pick.params?.length ? { id: model.pick.id, params: model.pick.params } : { id: model.pick.id };
}

export function faceOf(): string {
  return labelOf(model.rows, model.pick, model.name);
}

export function setModel(next: ModelSelection, name: string) {
  if (same(model.pick, next)) return;
  model.pick = next;
  model.name = name;
  writePick(next, name);
  onChange?.();
}

function applyRows(rows: Option[], live: boolean) {
  model.rows = withCurrent(rows, model.pick, model.name);
  model.live = live;
  const hit = model.rows.find((row) => row.id === model.pick.id);
  if (hit?.params?.length && !model.pick.params?.length) model.pick = { id: hit.id, params: hit.params };
  const seen = labelOf(model.rows, model.pick, model.name);
  if (seen && seen !== model.name) {
    model.name = seen;
    writePick(model.pick, seen);
  }
}

export function forgetCatalog() {
  applyRows(flatten(seed), false);
  model.error = "";
}

export async function warmCatalog(force = false) {
  if (model.loading || (model.live && !force)) return;
  model.loading = true;
  model.error = "";
  try {
    applyRows(flatten(await loadCatalog()), true);
  } catch {
    applyRows(flatten(seed), false);
    model.error = "Couldn’t load the list. You can still use the last model you picked.";
  } finally {
    model.loading = false;
  }
}
