import { useEffect, useState } from 'react';
import { LangButton, LangProvider, useLang } from '@shared/i18n.jsx';
import { ReelModalProvider } from '@shared/media.jsx';
import { BriefProvider, useCallLink } from '@shared/brief.jsx';
import { Logo } from '@shared/brand.jsx';
import { MotionSwitch } from '@shared/motion.jsx';
import { jump, useSmoothScroll } from '@shared/scroll.jsx';
import copy from './copy.js';
import Hero from '../v1/Hero.jsx';
import { Digital, Services } from '../v1/Sections.jsx';
import { Contact, Faq, Footer, Pricing, Process } from '../v1/More.jsx';
import Cut from './Cut.jsx';
import Line from './Line.jsx';

// Design 1.1: Design 1 "Linked" («الكادرين») with two sections brought in from Design 2 and set in Design 1's own
// paper and graphite frames. The line between real and reel takes the place of the three name frames (the three
// words are now under the strip), and the cut, where the scroll scrubs the reels frame by frame, takes the place
// of the grid of six reels. Its six reels are its own (reels.js): three of the shared ones and three new ones.
// Everything else is Design 1's own code, imported as it is.
// [label key in the shared copy's `nav`, section id on this page]
const LINKS = [
  ['work', 'cut'],
  ['services', 'services'],
  ['digital', 'digital'],
  ['process', 'process'],
  ['pricing', 'pricing'],
  ['faq', 'faq'],
];

function Header() {
  const { t, c } = useLang();
  const call = useCallLink();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.title = c.title;
  }, [c.title]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const go = (e) => {
    setOpen(false);
    jump(e);
  };
  return (
    <header className="top">
      <a className="top__logo" href="#top" onClick={go}><Logo tone="graphite" /></a>
      <nav className="top__nav" aria-label={t.ui.menu}>
        {LINKS.map(([l, id]) => <a key={l} href={`#${id}`} onClick={go}>{t.nav[l]}</a>)}
      </nav>
      <div className="top__end">
        <LangButton />
        <a className="btn btn--sm top__call" href={call} target="_blank" rel="noopener noreferrer">{t.ui.bookCall}</a>
        <button type="button" className="top__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          {open ? t.ui.close : t.ui.menu}
        </button>
      </div>
      <div className="menu" id="menu" hidden={!open}>
        <nav aria-label={t.ui.menu}>
          {LINKS.map(([l, id]) => <a key={l} href={`#${id}`} onClick={go}>{t.nav[l]}</a>)}
          <a href="#contact" onClick={go}>{t.nav.contact}</a>
        </nav>
        <a className="btn" href={call} target="_blank" rel="noopener noreferrer">{t.ui.bookCall}</a>
        <MotionSwitch />
      </div>
    </header>
  );
}

function Page() {
  const { t } = useLang();
  useSmoothScroll();
  return (
    <>
      <a className="skip" href="#main">{t.ui.skip}</a>
      <Header />
      <main id="main">
        <Hero />
        <Line />
        <Cut />
        <Services />
        <Digital />
        <Process />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <LangProvider copy={copy}>
      <BriefProvider>
        <ReelModalProvider>
          <Page />
        </ReelModalProvider>
      </BriefProvider>
    </LangProvider>
  );
}
