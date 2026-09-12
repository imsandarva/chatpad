/** Shortest thumb that stays easy to grab, even on a very long thread. */
export const MIN_THUMB = 36;

export function size(view: number, content: number, track: number): number {
  if (content <= view) return track;
  return Math.max(MIN_THUMB, (view / content) * track);
}

export function offset(scroll: number, max: number, travel: number): number {
  return max <= 0 ? 0 : (scroll / max) * travel;
}

/** Click the track — jump so the thumb centers on that point. */
export function seek(y: number, top: number, track: number, view: number, content: number): number {
  const thumb = size(view, content, track);
  const travel = Math.max(1, track - thumb);
  const ratio = Math.min(1, Math.max(0, (y - top - thumb / 2) / travel));
  return ratio * Math.max(0, content - view);
}

/** Drag from a grab point inside the thumb, without snapping. */
export function drag(y: number, top: number, grab: number, track: number, view: number, content: number): number {
  const thumb = size(view, content, track);
  const travel = Math.max(1, track - thumb);
  const ratio = Math.min(1, Math.max(0, (y - top - grab) / travel));
  return ratio * Math.max(0, content - view);
}
