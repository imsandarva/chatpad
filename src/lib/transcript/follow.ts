/** Stay with the latest turn unless the reader has moved up — same idea as iMessage. */
export function follow(node: HTMLElement, _token?: unknown) {
  let pinned = true;
  const near = 72;
  const atEnd = () => node.scrollHeight - node.scrollTop - node.clientHeight <= near;
  const stick = () => { if (pinned) node.scrollTop = node.scrollHeight; };
  const onscroll = () => { pinned = atEnd(); };

  node.addEventListener("scroll", onscroll, { passive: true });
  const onkey = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
    if ((event.target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "Home") { event.preventDefault(); node.scrollTop = 0; pinned = atEnd(); return; }
    if (event.key === "End") { event.preventDefault(); node.scrollTop = node.scrollHeight; pinned = atEnd(); return; }
    if (event.key !== "PageUp" && event.key !== "PageDown") return;
    event.preventDefault();
    node.scrollTop += (event.key === "PageDown" ? 1 : -1) * node.clientHeight * 0.9;
    pinned = atEnd();
  };
  window.addEventListener("keydown", onkey);
  const ro = new ResizeObserver(stick);
  let inner: Element | undefined;
  const watch = () => {
    const next = node.firstElementChild ?? undefined;
    if (next === inner) { stick(); return; }
    if (inner) ro.unobserve(inner);
    inner = next;
    if (inner) ro.observe(inner);
    stick();
  };
  const mo = new MutationObserver(watch);
  mo.observe(node, { childList: true });
  watch();

  return {
    update() { pinned = true; stick(); },
    destroy() {
      node.removeEventListener("scroll", onscroll);
      window.removeEventListener("keydown", onkey);
      ro.disconnect();
      mo.disconnect();
    },
  };
}
