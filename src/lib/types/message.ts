export type Role = "user" | "assistant";
export type ToolStatus = "running" | "done" | "error";

export type Work = {
  id: string;
  name: string;
  label: string;
  detail?: string;
  status: ToolStatus;
};

export type Block = { kind: "text"; id: string; text: string } | ({ kind: "work" } & Work);

export type Message = {
  id: string;
  role: Role;
  text: string;
  blocks?: Block[];
  failed?: boolean;
  stopped?: boolean;
};
