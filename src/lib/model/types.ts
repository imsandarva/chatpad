export type ModelParam = { id: string; value: string };
export type ModelSelection = { id: string; params?: ModelParam[] };

export type CatalogParam = { id: string; label?: string; values: { value: string; label?: string }[] };
export type CatalogVariant = { label: string; hint?: string; def?: boolean; params: ModelParam[] };
export type CatalogItem = {
  id: string;
  label: string;
  hint?: string;
  aliases?: string[];
  parameters?: CatalogParam[];
  variants?: CatalogVariant[];
};

/** One row in the write-box list — a model, or a variant of one. */
export type Option = {
  key: string;
  id: string;
  params?: ModelParam[];
  label: string;
  note?: string;
  group: string;
  aliases?: string[];
};
