import { useEffect, useState } from 'react';
import { LangButton, LangProvider, useLang } from '@shared/i18n.jsx';
import { ReelModalProvider } from '@shared/media.jsx';
import { BriefProvider, useCallLink } from '@shared/brief.jsx';
import { Logo } from '@shared/brand.jsx';
import { jump, useSmoothScroll } from '@shared/scroll.jsx';
import copy from './copy.js';
import Hero from './Hero.jsx';
import { Digital, Services } from './Sections.jsx';
import { Contact, Faq, Footer, Pricing, Process } from './More.jsx';
import Cut from './Cut.jsx';
import Line from './Line.jsx';
import { PageOpenProvider } from './Loader.jsx';
import { LINKS } from './nav.js';

// reel line, the page. The idea comes from the logo itself, two frames that link, and from the name: reel + line.
// A loading screen fetches the first clips; the two frames of the first screen then link by themselves; the line
// between real and reel and the cut follow; then the services, the screens, the steps (the scroll moves from one
// to the next), the package offer, the questions and the form. Motion is always on (see main.jsx).

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
          <PageOpenProvider>
            <Page />
          </PageOpenProvider>
        </ReelModalProvider>
      </BriefProvider>
    </LangProvider>
  );
}
