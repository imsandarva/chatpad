import { drag, offset, seek, size } from "./geometry";

/** Paint a rail from a live scrollport — style writes only, no Svelte invalidation on scroll. */
export function attach(port: HTMLElement, track: HTMLElement) {
  const thumb = track.firstElementChild as HTMLElement | null;
  if (!thumb) return () => {};

  let held = false;
  let grab = 0;
  let inner: Element | undefined;

  const paint = () => {
    const view = port.clientHeight;
    const content = port.scrollHeight;
    const trackH = track.clientHeight;
    const open = content > view + 1;
    track.classList.toggle("on", open);
    track.setAttribute("aria-hidden", open ? "false" : "true");
    track.tabIndex = open ? 0 : -1;
    if (!open) return;
    const h = size(view, content, trackH);
    const max = content - view;
    thumb.style.height = `${h}px`;
    thumb.style.transform = `translate3d(0, ${offset(port.scrollTop, max, trackH - h)}px, 0)`;
    track.setAttribute("aria-valuenow", String(max <= 0 ? 0 : Math.round((port.scrollTop / max) * 100)));
  };

  const moveTo = (event: PointerEvent, fromThumb: boolean) => {
    const box = track.getBoundingClientRect();
    port.scrollTop = fromThumb
      ? drag(event.clientY, box.top, grab, box.height, port.clientHeight, port.scrollHeight)
      : seek(event.clientY, box.top, box.height, port.clientHeight, port.scrollHeight);
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    held = true;
    track.classList.add("held");
    const box = thumb.getBoundingClientRect();
    const onThumb = event.clientY >= box.top && event.clientY <= box.bottom;
    if (onThumb) grab = event.clientY - box.top;
    else {
      grab = box.height / 2;
      moveTo(event, false);
    }
  };

  const onMove = (event: PointerEvent) => { if (held) moveTo(event, true); };

  const onUp = (event: PointerEvent) => {
    if (!held) return;
    held = false;
    track.classList.remove("held");
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  };

  const onKey = (event: KeyboardEvent) => {
    const view = port.clientHeight;
    const max = Math.max(0, port.scrollHeight - view);
    let next = port.scrollTop;
    if (event.key === "ArrowDown") next += 48;
    else if (event.key === "ArrowUp") next -= 48;
    else if (event.key === "PageDown") next += view * 0.9;
    else if (event.key === "PageUp") next -= view * 0.9;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = max;
    else return;
    event.preventDefault();
    port.scrollTop = Math.min(max, Math.max(0, next));
  };

  const ro = new ResizeObserver(paint);
  const watch = () => {
    const next = port.firstElementChild ?? undefined;
    if (next === inner) { paint(); return; }
    if (inner) ro.unobserve(inner);
    inner = next;
    if (inner) ro.observe(inner);
    paint();
  };
  const mo = new MutationObserver(watch);

  port.addEventListener("scroll", paint, { passive: true });
  track.addEventListener("pointerdown", onDown);
  track.addEventListener("pointermove", onMove);
  track.addEventListener("pointerup", onUp);
  track.addEventListener("pointercancel", onUp);
  track.addEventListener("keydown", onKey);
  ro.observe(port);
  ro.observe(track);
  mo.observe(port, { childList: true });
  watch();

  return () => {
    port.removeEventListener("scroll", paint);
    track.removeEventListener("pointerdown", onDown);
    track.removeEventListener("pointermove", onMove);
    track.removeEventListener("pointerup", onUp);
    track.removeEventListener("pointercancel", onUp);
    track.removeEventListener("keydown", onKey);
    ro.disconnect();
    mo.disconnect();
  };
}
