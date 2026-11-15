import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';
import { isMotionReduced } from './motion.jsx';

// Smooth scrolling and held scenes.
// Lessons carried over from the earlier projects: no GSAP pins (they shook on the owner's iPhone); a held scene is a
// CSS sticky stage inside a tall "runway", and the page scroll is the single source of truth. Phones keep native
// scrolling; Lenis runs only with a mouse or trackpad and only in full motion.

let lenisInstance = null;
export const getLenis = () => lenisInstance;

export function useSmoothScroll({ lerp = 0.1 } = {}) {
  useEffect(() => {
    if (isMotionReduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const lenis = new Lenis({ lerp, smoothWheel: true, wheelMultiplier: 1 });
    lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [lerp]);
}

export const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 60;

// Scroll to a y position or to an element (sections carry scroll-margin-top, so no extra offset is added here).
export function scrollToY(y) {
  if (lenisInstance) lenisInstance.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: isMotionReduced() ? 'auto' : 'smooth' });
}
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { duration: 1.2 });
  else el.scrollIntoView({ behavior: isMotionReduced() ? 'auto' : 'smooth', block: 'start' });
}

// In-page links: <a href="#id" onClick={jump}>.
export function jump(e) {
  const href = e.currentTarget.getAttribute('href') || '';
  if (!href.startsWith('#')) return;
  e.preventDefault();
  scrollToId(href.slice(1));
  window.history.replaceState(null, '', href);
}

export function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

// True once the element has been on screen (stays true), or while it is on screen when `once` is false.
export function useInView(ref, { once = false, margin = '0px', threshold = 0.25 } = {}) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          if (once) io.disconnect();
        } else if (!once) setSeen(false);
      },
      { rootMargin: margin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin, threshold]);
  return seen;
}

// A held scene: `runwayRef` is the tall wrapper, its child is `position: sticky; top: var(--hh)`.
// onProgress(p) gets 0..1 as the page scrolls through it. Returns goTo(p), which scrolls the page to that progress.
// Off (enabled = false) when motion is reduced: the caller then lays the steps out as tabs or a row.
export function useRunway(runwayRef, onProgress, { enabled = true } = {}) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const el = runwayRef.current;
    if (!enabled || !el) return undefined;
    let raf = 0;
    let last = -1;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const hh = headerH();
      const span = r.height - (window.innerHeight - hh);
      const p = span > 0 ? Math.min(1, Math.max(0, (hh - r.top) / span)) : 0;
      if (Math.abs(p - last) > 0.0004) {
        last = p;
        cb.current(p);
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    measure();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [runwayRef, enabled]);
  return useCallback(
    (p) => {
      const el = runwayRef.current;
      if (!el || !enabled) return false;
      const r = el.getBoundingClientRect();
      const hh = headerH();
      const span = r.height - (window.innerHeight - hh);
      scrollToY(Math.round(window.scrollY + r.top - hh + p * span) + (p === 0 ? 1 : 0));
      return true;
    },
    [runwayRef, enabled],
  );
}
