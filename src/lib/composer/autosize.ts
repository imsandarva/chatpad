/** Grows the field with the draft, capped so the transcript stays visible. */
export function autosize(node: HTMLTextAreaElement, maxPx = 200) {
  const fit = () => {
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, maxPx)}px`;
  };

  fit();
  node.addEventListener("input", fit);
  return { update: fit, destroy() { node.removeEventListener("input", fit); } };
}
