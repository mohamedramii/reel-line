import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ar from './ar.js';
import en from './en.js';

// Arabic is the default. `?lang=en|ar` sets it and the choice is remembered; the header button switches in place.
const KEY = 'reelline-lang';
const shared = { ar, en };

export function initialLang() {
  const q = new URLSearchParams(window.location.search).get('lang');
  if (q === 'ar' || q === 'en') {
    try { localStorage.setItem(KEY, q); } catch { /* storage unavailable */ }
    return q;
  }
  try {
    const s = localStorage.getItem(KEY);
    if (s === 'ar' || s === 'en') return s;
  } catch { /* storage unavailable */ }
  return 'ar';
}

// Set <html lang dir> before the first paint (called from each design's main.jsx).
export function applyLang(lang = initialLang()) {
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === 'ar' ? 'rtl' : 'ltr';
  return lang;
}

const Ctx = createContext(null);

// `copy` is the design's own wording: { ar: {...}, en: {...} }.
export function LangProvider({ copy, children }) {
  const [lang, setLangState] = useState(initialLang);
  const setLang = useCallback((next) => {
    applyLang(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
    setLangState(next);
  }, []);
  const value = useMemo(
    () => ({ lang, isRTL: lang === 'ar', t: shared[lang], c: copy ? copy[lang] : null, setLang, toggle: () => setLang(lang === 'ar' ? 'en' : 'ar') }),
    [lang, copy, setLang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

// The language button: shows the other language in its own script.
export function LangButton({ className = '' }) {
  const { t, toggle, lang } = useLang();
  return (
    <button type="button" className={`lang-btn ${className}`} onClick={toggle} aria-label={t.ui.switchLangLabel} lang={lang === 'ar' ? 'en' : 'ar'}>
      {t.ui.switchLang}
    </button>
  );
}
