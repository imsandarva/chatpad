/** Put text on the clipboard — Clipboard API first, a hidden field if WebKit refuses. */
export async function writeText(text: string): Promise<boolean> {
  const value = text.replace(/\s+$/u, "");
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const node = document.createElement("textarea");
    node.value = value;
    node.setAttribute("readonly", "");
    node.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(node);
    node.select();
    const ok = document.execCommand("copy");
    node.remove();
    return ok;
  }
}
