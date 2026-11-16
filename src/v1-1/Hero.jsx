import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@shared/gsap.js';
import { isMotionReduced } from '@shared/motion.jsx';
import { useLang } from '@shared/i18n.jsx';
import { Reel, useReelModal } from '@shared/media.jsx';
import { reelOf } from './reels.js';
import { useCallLink } from '@shared/brief.jsx';
import { jump, useInView, useMedia } from '@shared/scroll.jsx';
import { usePageOpen } from './Loader.jsx';

// The first screen: two frames that start apart and, as soon as the page opens, come together by themselves and
// lock in the arrangement of the logo: upper right behind, lower left in front, with a clear gap round the front one.
// After that they are the visitor's: a drag or a tap pulls them apart and links them again, and so does the button.
// The upper frame is the thinking (it looks like the kit's reel cover), the lower one is the reel itself. Grey and
// still until they are linked; colour and movement after. `--p` on the stage is 0 (apart) to 1 (linked).
const REEL = reelOf('ghazala'); // the reel of the first screen (the owner's choice, 16 Nov 2026)

export default function Hero() {
  const { t, c } = useLang();
  const h = c.hero;
  const reduced = isMotionReduced();
  const openReel = useReelModal();
  const callLink = useCallLink();
  const stage = useRef(null);
  const prox = useRef({ p: 0 });
  const drag = useRef(null);
  const open = usePageOpen();
  const phone = useMedia('(max-width: 759px)');
  const [linked, setLinked] = useState(reduced); // with reduced motion they are linked from the start
  const [touched, setTouched] = useState(false);
  const [dragged, setDragged] = useState(false); // the visitor has taken a frame in hand at least once
  const held = useRef(false); // the visitor has taken the frames: nothing moves them by itself any more
  const onScreen = useInView(stage, { threshold: 0.2 });

  const paint = useCallback(() => {
    if (stage.current) stage.current.style.setProperty('--p', prox.current.p.toFixed(4));
  }, []);
  const settle = useCallback(
    (to) => {
      gsap.killTweensOf(prox.current);
      if (reduced) {
        prox.current.p = to;
        paint();
      } else {
        gsap.to(prox.current, { p: to, duration: to ? 0.6 : 0.45, ease: to ? 'back.out(1.7)' : 'power3.out', onUpdate: paint });
      }
      setLinked(to === 1);
    },
    [reduced, paint],
  );
  useEffect(() => () => gsap.killTweensOf(prox.current), []);
  // linked from the start when motion is reduced
  useEffect(() => {
    if (!reduced) return;
    prox.current.p = 1;
    paint();
  }, [reduced, paint]);
  // the page has opened: the two frames link by themselves, once
  useEffect(() => {
    if (reduced || !open) return undefined;
    const id = setTimeout(() => !held.current && settle(1), 950); // as the last of the loading screen leaves
    return () => clearTimeout(id);
  }, [open, reduced, settle]);

  const onDown = (which) => (e) => {
    if (e.button) return;
    held.current = true;
    setTouched(true);
    setDragged(true);
    gsap.killTweensOf(prox.current);
    const span = Math.max(110, stage.current.getBoundingClientRect().width * 0.34);
    drag.current = { which, x: e.clientX, y: e.clientY, p: prox.current.p, span, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    // the lower-left frame travels right and up to link; the upper-right one left and down
    const along = d.which === 'lower' ? dx - dy * 0.35 : dy * 0.35 - dx;
    prox.current.p = Math.min(1.05, Math.max(-0.05, d.p + along / d.span));
    paint();
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (!d.moved) settle(linked ? (d.which === 'upper' ? 0 : 1) : 1); // a tap links; a tap on the linked thinking frame lets go
    else settle(prox.current.p > 0.5 ? 1 : 0);
  };
  const frameProps = (which) => ({ onPointerDown: onDown(which), onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp });

  return (
    <section className={`scr hero ${linked ? 'is-linked' : ''}`} id="top" aria-labelledby="hero-h">
      <div className="hero__text">
        <h1 id="hero-h">
          <span>{h.h1a}</span>{' '}
          <span>
            {h.h1b} <span className="u">{h.h1u}</span>
          </span>
        </h1>
        <p className="lead">
          <span className="wide">{h.sub}</span>
          <span className="narrow">{h.subShort}</span>
        </p>
        <ul className="pillars" aria-label={t.agency}>
          {t.pillars.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="hero__cta">
          <a className="btn" id="hero-cta" href={callLink} target="_blank" rel="noopener noreferrer">{t.ui.bookCall}</a>
          <a className="btn btn--line" href="#pricing" onClick={jump}>{h.packages}</a>
        </div>
      </div>

      <div className="hero__side">
       <div className="rig">
        <div className={`pair ${touched ? 'is-touched' : ''}`} ref={stage} role="group" aria-label={h.stageLabel}>
          <div className="fr fr--upper" {...frameProps('upper')}>
            <strong className="ltr" lang="en">{h.think}</strong>
            <span>{h.thinkAr}</span>
          </div>
          <div className="fr fr--lower" {...frameProps('lower')}>
            <Reel key={phone ? 'tile' : 'loop'} item={REEL} size={phone ? 'tile' : 'loop'} still playing={linked && onScreen && !reduced} />
            <span className="fr__cap">
              <strong className="ltr" lang="en">{h.reel}</strong>
              <span>{h.reelAr}</span>
            </span>
            {linked && (
              <button
                type="button"
                className="fr__watch"
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={t.ui.watch}
                onClick={() => openReel(REEL, `${(c.reels?.[REEL.id] || t.reels[REEL.id]).title} · ${(c.reels?.[REEL.id] || t.reels[REEL.id]).note}`)}
              >
                {t.ui.sound}
              </button>
            )}
          </div>
          {/* the frames link by themselves, so the cue only speaks once the visitor has let them go with the button */}
          <span className={`cue ${!linked && touched && !dragged ? '' : 'is-off'}`} aria-hidden="true">
            <i />
            {h.cue}
          </span>
        </div>
        <div className="hero__ctrl">
          <button type="button" className="link-btn" id="hero-link" aria-pressed={linked} onClick={() => { held.current = true; setTouched(true); settle(linked ? 0 : 1); }}>
            {linked ? h.unlink : h.link}
          </button>
          <span className="sr-only" role="status">{linked ? h.linked : h.apart}</span>
        </div>
       </div>
      </div>
    </section>
  );
}
