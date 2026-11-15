import { useState } from 'react';
import { useLang } from './i18n.jsx';

// Motion policy: each page chooses its default (these designs choose full motion on every
// device, the studio's standing wish, because the owner's own machine has the system's reduced motion switched on),
// and the visitor can switch to reduced. `?motion=full|reduced` sets it too.
// The reduced page must be complete: nothing plays by itself, pinned scenes become rows or steps.
const KEY = 'reelline-motion';

function override() {
  const q = new URLSearchParams(window.location.search).get('motion');
  if (q === 'full' || q === 'reduced') {
    try { localStorage.setItem(KEY, q); } catch { /* storage unavailable */ }
    return q;
  }
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export const osPrefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let pageDefault = null;
export function setMotionDefault(level) {
  pageDefault = level === 'full' || level === 'reduced' ? level : null;
}

export function isMotionReduced() {
  const o = override();
  if (o === 'full') return false;
  if (o === 'reduced') return true;
  if (pageDefault) return pageDefault === 'reduced';
  return osPrefersReduced();
}

export function applyMotionClass() {
  document.documentElement.classList.toggle('motion-reduced', isMotionReduced());
}

export function setMotion(level) {
  try { localStorage.setItem(KEY, level); } catch { /* storage unavailable */ }
  const url = new URL(window.location.href);
  url.searchParams.delete('motion');
  window.location.replace(url.toString());
}

// A small text switch for the footer or the menu.
export function MotionSwitch({ className = '' }) {
  const { t } = useLang();
  const [reduced] = useState(() => isMotionReduced());
  return (
    <button type="button" className={`motion-switch ${className}`} onClick={() => setMotion(reduced ? 'full' : 'reduced')}>
      <b>{reduced ? t.ui.motionReduced : t.ui.motionFull}</b>
      <span>{reduced ? t.ui.toFull : t.ui.toReduced}</span>
    </button>
  );
}
