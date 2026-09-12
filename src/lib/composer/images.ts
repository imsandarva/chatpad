export type Pic = { id: string; name: string; mime: string; url: string };
export type DraftPic = Pic & { blob: Blob };
export type SendImage = { data: string; mimeType: string };

export const MAX_PICS = 6;
const MAX_IN = 8 * 1024 * 1024;
const MAX_KEEP = 1_200_000;
const MAX_EDGE = 1600;
const JPEG_Q = 0.84;
const KINDS = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);

export function isImage(file: File): boolean {
  return KINDS.has(file.type) || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

export function filesFrom(source: DataTransfer | ClipboardEvent | FileList | File[]): File[] {
  if (source instanceof FileList || Array.isArray(source)) return [...source].filter(isImage);
  if (source instanceof ClipboardEvent) {
    const data = source.clipboardData;
    if (!data) return [];
    const listed = [...data.files].filter(isImage);
    if (listed.length) return listed;
    return [...data.items].flatMap((item) => {
      if (item.kind !== "file") return [];
      const file = item.getAsFile();
      return file && isImage(file) ? [file] : [];
    });
  }
  return [...source.files].filter(isImage);
}

export async function prepare(file: File): Promise<Blob> {
  if (file.size > MAX_IN) throw new Error("too-big");
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const edge = Math.max(bitmap.width, bitmap.height);
  if (edge <= MAX_EDGE && file.size <= MAX_KEEP) {
    bitmap.close();
    return file;
  }
  const scale = Math.min(1, MAX_EDGE / edge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", JPEG_Q));
  return blob ?? file;
}

export async function toDraft(file: File): Promise<DraftPic> {
  const blob = await prepare(file);
  return {
    id: crypto.randomUUID(),
    name: file.name || "Picture",
    mime: blob.type || file.type || "image/jpeg",
    url: URL.createObjectURL(blob),
    blob,
  };
}

export function release(pic: Pick<Pic, "url">) {
  URL.revokeObjectURL(pic.url);
}

export function toPayload(pics: DraftPic[]): Promise<SendImage[]> {
  return Promise.all(pics.map(async (pic) => ({ mimeType: pic.mime, data: await readB64(pic.blob) })));
}

function readB64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      resolve(url.slice(url.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
