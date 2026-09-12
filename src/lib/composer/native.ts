import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { isNativeShell } from "$lib/platform";

export type NativePics = { files: File[]; oversize: boolean };

type RawPics = { items: { name: string; mime: string; data: string }[]; oversize: boolean };

/** Read image files the user dropped or copied — paths come from Tauri or a URI list. */
export async function filesFromPaths(paths: string[]): Promise<NativePics> {
  if (!isNativeShell() || !paths.length) return { files: [], oversize: false };
  try {
    return await intoFiles(await invoke<RawPics>("read_pictures", { paths }));
  } catch {
    return { files: [], oversize: false };
  }
}

/** GTK clipboard on Linux — WebKit never sees a copied screenshot as a file. */
export async function clipboardAttach(): Promise<NativePics> {
  if (!isNativeShell()) return { files: [], oversize: false };
  try {
    return await intoFiles(await invoke<RawPics>("clipboard_attach"));
  } catch {
    return { files: [], oversize: false };
  }
}

/** Tauri owns OS file drops; HTML drag events do not fire for the file manager. */
export async function listenFileDrop(onhover: (over: boolean) => void, ondrop: (pics: NativePics) => void): Promise<() => void> {
  if (!isNativeShell()) return () => {};
  return getCurrentWebview().onDragDropEvent(async (event) => {
    const kind = event.payload.type;
    if (kind === "enter" || kind === "over") onhover(true);
    else if (kind === "drop") {
      onhover(false);
      ondrop(await filesFromPaths(event.payload.paths));
    } else {
      onhover(false);
    }
  });
}

async function intoFiles(raw: RawPics): Promise<NativePics> {
  const files = await Promise.all(raw.items.map(async (item) => {
    const blob = await fetch(`data:${item.mime};base64,${item.data}`).then((res) => res.blob());
    return new File([blob], item.name, { type: item.mime });
  }));
  return { files, oversize: raw.oversize };
}
