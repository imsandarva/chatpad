/** Stable `tool_call` envelope from `run.stream()` — args stay unknown. */
export type WorkStatus = "running" | "done" | "error";

export type WorkEvent = {
  type: "work";
  id: string;
  name: string;
  label: string;
  detail?: string;
  status: WorkStatus;
};

type Rec = Record<string, unknown>;

const kind: Record<string, string> = {
  shell: "shell", bash: "shell", shelltoolcall: "shell",
  edit: "edit", edittoolcall: "edit", strreplace: "edit", search_replace: "edit",
  read: "read", readtoolcall: "read", read_file: "read",
  write: "write", writetoolcall: "write", write_file: "write",
  delete: "delete", deletetoolcall: "delete", delete_file: "delete",
  grep: "grep", greptoolcall: "grep", ripgrep: "grep",
  glob: "glob", globtoolcall: "glob",
  ls: "ls", lstoolcall: "ls",
  semsearch: "search", codebase_search: "search",
};

function rec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Keep enough of a command or path to sit with — not a dump. */
function keep(value: string, n = 4000): string {
  const text = value.replace(/\r\n/g, "\n").trim();
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

function file(path: string): string {
  const norm = path.replace(/\\/g, "/");
  const i = norm.lastIndexOf("/");
  return i >= 0 ? norm.slice(i + 1) : norm;
}

function unwrap(args: Rec): { name: string; args: Rec } {
  for (const [key, value] of Object.entries(args)) {
    if (!rec(value) || !/toolcall$/i.test(key)) continue;
    return { name: key, args: rec(value.args) ? value.args : value };
  }
  return { name: "", args };
}

function pick(args: Rec): Rec {
  const nested = rec(args.args) ? args.args : args;
  return rec(nested) ? nested : args;
}

function statusOf(value: unknown): WorkStatus {
  if (value === "error") return "error";
  if (value === "completed" || value === "done") return "done";
  return "running";
}

function describe(name: string, args: Rec, status: WorkStatus): { label: string; detail?: string } {
  const path = str(args.path) || str(args.file) || str(args.filename) || str(args.target);
  const cmd = str(args.command) || str(args.cmd);
  const query = str(args.pattern) || str(args.query) || str(args.glob) || str(args.needle);
  const who = path ? file(path) : "";
  const fail = status === "error";

  if (name === "shell") {
    const label = fail ? "That command didn’t finish." : status === "running" ? "Running a command" : "Ran a command";
    return { label, detail: cmd ? keep(cmd) : undefined };
  }
  if (name === "edit") {
    const label = fail ? `Couldn’t edit ${who || "that file"}` : status === "running" ? `Editing ${who || "a file"}` : `Edited ${who || "a file"}`;
    return { label, detail: path ? keep(path) : undefined };
  }
  if (name === "read") {
    const label = fail ? `Couldn’t open ${who || "that file"}` : status === "running" ? `Opening ${who || "a file"}` : `Looked at ${who || "a file"}`;
    return { label, detail: path ? keep(path) : undefined };
  }
  if (name === "write") {
    const label = fail ? `Couldn’t write ${who || "that file"}` : status === "running" ? `Writing ${who || "a file"}` : `Wrote ${who || "a file"}`;
    return { label, detail: path ? keep(path) : undefined };
  }
  if (name === "delete") {
    const label = fail ? `Couldn’t remove ${who || "that file"}` : status === "running" ? `Removing ${who || "a file"}` : `Removed ${who || "a file"}`;
    return { label, detail: path ? keep(path) : undefined };
  }
  if (name === "grep") {
    return { label: fail ? "Search didn’t finish." : status === "running" ? "Searching the project" : "Searched the project", detail: query ? keep(query) : undefined };
  }
  if (name === "glob") {
    return { label: fail ? "Couldn’t look for files." : status === "running" ? "Looking for files" : "Looked for files", detail: query ? keep(query) : undefined };
  }
  if (name === "ls") {
    return { label: fail ? "Couldn’t list that folder." : status === "running" ? "Listing a folder" : "Listed a folder", detail: path ? keep(path) : undefined };
  }
  if (name === "search") {
    return { label: fail ? "Search didn’t finish." : status === "running" ? "Searching the project" : "Searched the project", detail: query ? keep(query) : undefined };
  }
  return { label: fail ? "That step didn’t work." : status === "running" ? "Working" : "Finished" };
}

/** Turn a stream event into a short work row. Ignore anything that is not a tool call. */
export function fromTool(event: unknown): WorkEvent | undefined {
  if (!rec(event) || event.type !== "tool_call") return;
  const id = str(event.call_id);
  if (!id) return;
  const raw = rec(event.args) ? unwrap(event.args) : { name: "", args: {} as Rec };
  const name = kind[(str(event.name) || raw.name).toLowerCase()] ?? "tool";
  const status = statusOf(event.status);
  const { label, detail } = describe(name, pick(raw.args), status);
  return { type: "work", id, name, label, detail, status };
}
