import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { waLink } from './content.js';
import { useLang } from './i18n.jsx';

// The visitor's enquiry, shared by every section of a page (a package chosen in the price list shows up in the form).
// Nothing is sent by the page: `link` opens WhatsApp on the visitor's side with the message written.
const Ctx = createContext(null);
const EMPTY = { name: '', brand: '', reach: '', needs: [], budget: null, pkg: null };

export function briefMessage(t, s) {
  const m = t.contact.msg;
  const sep = t.lang === 'ar' ? '، ' : ', ';
  const lines = [s.name.trim() && s.brand.trim() ? m.hello(s.name.trim(), s.brand.trim()) : m.helloBare];
  if (s.pkg) lines.push(m.pkg(t.pricing.names[s.pkg]));
  if (s.needs.length) lines.push(m.interested(s.needs.map((i) => t.contact.needs[i]).join(sep)));
  if (s.budget !== null) lines.push(m.budget(t.contact.budgets[s.budget]));
  if (s.reach.trim()) lines.push(m.reach(s.reach.trim()));
  if (lines.length === 1) lines.push(m.call);
  return lines.join('\n');
}

export function BriefProvider({ children }) {
  const { t } = useLang();
  const [s, setS] = useState(EMPTY);
  const set = useCallback((key, value) => setS((prev) => ({ ...prev, [key]: value })), []);
  const toggleNeed = useCallback(
    (i) => setS((prev) => ({ ...prev, needs: prev.needs.includes(i) ? prev.needs.filter((n) => n !== i) : [...prev.needs, i].sort((a, b) => a - b) })),
    [],
  );
  const value = useMemo(() => {
    const message = briefMessage(t, s);
    return { ...s, set, toggleNeed, message, link: waLink(message), ready: Boolean(s.name.trim() && s.brand.trim()) };
  }, [s, t, set, toggleNeed]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useBrief = () => useContext(Ctx);

// "Book a call": a WhatsApp link with the short intro message, for header and hero buttons.
export function useCallLink() {
  const { t } = useLang();
  return waLink(`${t.contact.msg.helloBare}\n${t.contact.msg.call}`);
}
