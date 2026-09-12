import { filesFrom } from "./images";

/** Paths from a Nautilus copy or an HTML drop that only carried file URIs. */
export function pathsFromWeb(data: DataTransfer | null): string[] {
  if (!data) return [];
  const listed = pathsFromList(data.getData("text/uri-list"));
  if (listed.length) return listed;
  const text = data.getData("text").trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && line !== "copy" && line !== "cut" && !line.startsWith("#"));
  if (lines.every((line) => line.startsWith("file://") || isImagePath(line))) return lines.flatMap((line) => (line.startsWith("file://") ? pathsFromList(line) : [line]));
  return [];
}

export function inspectPaste(event: ClipboardEvent): { files: File[]; paths: string[]; hasText: boolean } {
  return {
    files: filesFrom(event),
    paths: pathsFromWeb(event.clipboardData),
    hasText: Boolean(event.clipboardData?.getData("text")),
  };
}

function pathsFromList(raw: string): string[] {
  return raw.split(/\r?\n/).flatMap((line) => {
    const text = line.trim();
    if (!text || text.startsWith("#") || text === "copy" || text === "cut") return [];
    if (text.startsWith("file://")) {
      try {
        const path = decodeURIComponent(new URL(text).pathname);
        return [/^\/[A-Za-z]:\//.test(path) ? path.slice(1) : path];
      } catch {
        return [];
      }
    }
    return isImagePath(text) ? [text] : [];
  });
}

function isImagePath(text: string): boolean {
  return /^\/\S+\.(png|jpe?g|webp|gif)$/i.test(text);
}
