import { useMemo, useRef } from 'react';

// Small helpers for "the line": every control in this design is a horizontal drag along something.
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const pad2 = (n) => String(n).padStart(2, '0');

// Pointer handling for a horizontal control. `onDrag(fraction, phase)` gets the pointer's place across the range
// (0 at its left edge, 1 at its right edge; these controls never mirror) and one of:
//   'down'  the pointer went down (nothing has moved yet)
//   'move'  it is being dragged
//   'up'    a drag ended here
//   'tap'   it went down and up without moving
// The range is the element the props are spread on, or `range.current` when a ref is given.
// Give the element `touch-action: pan-y` so a vertical swipe still scrolls the page.
export function useHDrag(onDrag, { range = null, slop = 4 } = {}) {
  const cb = useRef(onDrag);
  cb.current = onDrag;
  const st = useRef(null);
  return useMemo(() => {
    const at = (e, d) => clamp((e.clientX - d.left) / d.width, 0, 1);
    const end = (e, cancelled) => {
      const d = st.current;
      if (!d || d.id !== e.pointerId) return;
      st.current = null;
      if (cancelled) {
        if (d.moved) cb.current(d.last, 'up', e);
        return;
      }
      cb.current(at(e, d), d.moved ? 'up' : 'tap', e);
    };
    return {
      onPointerDown: (e) => {
        if (e.button) return;
        const r = (range?.current || e.currentTarget).getBoundingClientRect();
        if (!r.width) return;
        st.current = { id: e.pointerId, x0: e.clientX, left: r.left, width: r.width, moved: false, last: 0 };
        st.current.last = at(e, st.current);
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ }
        cb.current(st.current.last, 'down', e);
      },
      onPointerMove: (e) => {
        const d = st.current;
        if (!d || d.id !== e.pointerId) return;
        if (!d.moved && Math.abs(e.clientX - d.x0) < slop) return;
        d.moved = true;
        d.last = at(e, d);
        cb.current(d.last, 'move', e);
      },
      onPointerUp: (e) => end(e, false),
      onPointerCancel: (e) => end(e, true),
    };
  }, [range, slop]);
}
