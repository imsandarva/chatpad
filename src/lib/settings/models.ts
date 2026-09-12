/** The short desk list — not Cursor’s full catalog. */
export type ModelId = "composer" | "faster" | "auto";

export type ModelChoice = {
  id: ModelId;
  label: string;
  hint: string;
  selection: { id: string; params?: { id: string; value: string }[] };
};

export const DEFAULT_MODEL: ModelId = "composer";

export const models: readonly ModelChoice[] = [
  { id: "composer", label: "Composer", hint: "Everyday writing.", selection: { id: "composer-2.5" } },
  { id: "faster", label: "Faster", hint: "Same mind, a little quicker.", selection: { id: "composer-2.5", params: [{ id: "fast", value: "true" }] } },
  { id: "auto", label: "Auto", hint: "Cursor picks as you go.", selection: { id: "auto" } },
];

export function asModel(value: unknown): ModelId {
  return models.some((model) => model.id === value) ? value as ModelId : DEFAULT_MODEL;
}

export function selectionOf(id: ModelId) {
  return (models.find((model) => model.id === id) ?? models[0]).selection;
}
