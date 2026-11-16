import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { gsap } from '@shared/gsap.js';
import { isMotionReduced } from '@shared/motion.jsx';
import { useLang } from '@shared/i18n.jsx';
import { LogoMotion } from '@shared/brand.jsx';
import { preloadVideos } from '@shared/preload.js';
import { webFeatured } from '@shared/content.js';
import { reels, webReel } from './reels.js';
import { ROWS, sizeNow } from './Line.jsx';

// The loading screen: while it runs, the first clips a visitor meets are downloaded and kept in memory, so they
// start at once when they come on screen (the first-screen reel and the strip of the line; the scrub clips of the
// cut follow behind the open page). What it shows is the brand kit's own logo reveal, driven by the real loading: the two frames come home as
// the clips arrive, the name appears when they are all in, and the screen lifts off the page.
// It never runs faster than MIN_TIME (the reveal is seen whole) and never waits longer than MAX_WAIT: after that
// the page opens and whatever is left goes on downloading behind it.
// With reduced motion (only by ?motion=reduced on this page) there is no loading screen: the page is open at once.
const MIN_TIME = 1.7;
const MAX_WAIT = 7;

// has the page opened? (the loading screen has lifted, or there was none)
const OpenCtx = createContext(true);
export const usePageOpen = () => useContext(OpenCtx);

// What the loading screen waits for: the clips of the first two screens, in the sizes this screen will ask for
// (the first-screen reel, then the strip of the line: short 360p cuts).
function firstClips() {
  const size = sizeNow();
  const hero = reels.find((r) => r.id === 'ghazala'); // the first screen's reel (see Hero.jsx)
  return [size === 'phone' ? hero.tile : hero.loop, ...ROWS[size].map((id) => reels.find((r) => r.id === id).tile)];
}
// What goes on downloading behind the open page, in the order the visitor meets it: the six scrub clips of the cut
// (two screens further down), then the short clip behind the websites card and the screen recordings of the
// websites section, in the size this screen plays them. So every clip on the page starts from memory.
const laterClips = () => [
  ...reels.map((r) => `/media/d2/${r.id}-scrub.mp4`),
  webReel.tile,
  ...webFeatured.map((w) => (sizeNow() === 'phone' ? w.tile : w.loop)),
];

export function PageOpenProvider({ children }) {
  const [open, setOpen] = useState(() => isMotionReduced());
  useEffect(() => {
    if (isMotionReduced()) document.documentElement.dataset.open = '1'; // no loading screen: open from the start
  }, []);
  return (
    <OpenCtx.Provider value={open}>
      {children}
      {!isMotionReduced() && <Loader onOpen={() => setOpen(true)} />}
    </OpenCtx.Provider>
  );
}

function Loader({ onOpen }) {
  const { c } = useLang();
  const root = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);
  const [gone, setGone] = useState(false);
  const [logoT, setLogoT] = useState(0);
  const opened = useRef(onOpen);
  opened.current = onOpen;

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    let loaded = 0;
    preloadVideos(firstClips(), (f) => { loaded = f; }).then(() => preloadVideos(laterClips()));
    const ramp = gsap.parseEase('power2.inOut');
    const start = performance.now();
    const shown = { v: 0 };
    let lastT = -1;
    let exit = null;
    const tick = () => {
      const s = (performance.now() - start) / 1000;
      const target = Math.min(ramp(Math.min(1, s / MIN_TIME)), s > MAX_WAIT ? 1 : loaded);
      shown.v += (target - shown.v) * 0.12;
      if (target === 1 && shown.v > 0.997) shown.v = 1;
      if (count.current) count.current.textContent = String(Math.round(shown.v * 100)).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${shown.v.toFixed(4)})`;
      const lt = Math.round(shown.v * 200) / 200; // the logo is redrawn in steps, not on every frame
      if (lt !== lastT) {
        lastT = lt;
        setLogoT(lt);
      }
      if (shown.v === 1) {
        gsap.ticker.remove(tick);
        // the name has just appeared: hold it a moment, then lift the screen off the page
        exit = gsap.timeline({ delay: 0.35 })
          .add(() => {
            html.style.overflow = '';
            html.dataset.open = '1';
            opened.current?.();
          }, 0.1)
          .to(root.current, { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, 0.1)
          .add(() => setGone(true));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      exit?.kill();
      html.style.overflow = '';
    };
  }, []);

  if (gone) return null;
  return (
    <div className="loader" data-loader ref={root} role="status" aria-label={c.loader.label}>
      <LogoMotion t={logoT} tone="graphite" title="reel line" />
      <p className="loader__say">{c.loader.say}</p>
      <p className="loader__count" aria-hidden="true"><span className="ltr" ref={count}>000</span></p>
      <i className="loader__bar" ref={bar} aria-hidden="true" />
    </div>
  );
}
