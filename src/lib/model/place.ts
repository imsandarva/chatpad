/** Sit the menu above the trigger, in the window — not inside a clipped pane. */
export function above(el: HTMLElement, width = 20.5 * 16) {
  const box = el.getBoundingClientRect();
  const gap = 8;
  const w = Math.min(width, window.innerWidth - 24);
  const left = Math.max(12, Math.min(box.left, window.innerWidth - w - 12));
  const maxHeight = Math.max(12 * 16, box.top - gap - 12);
  return { left, bottom: window.innerHeight - box.top + gap, width: w, maxHeight };
}
