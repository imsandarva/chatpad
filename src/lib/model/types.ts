export type ModelParam = { id: string; value: string };
export type ModelSelection = { id: string; params?: ModelParam[] };

export type CatalogItem = {
  id: string;
  label: string;
  hint?: string;
  aliases?: string[];
  params?: ModelParam[];
};

/** One row in the write-box list. */
export type Option = {
  key: string;
  id: string;
  params?: ModelParam[];
  label: string;
  note?: string;
  group: string;
  aliases?: string[];
};
