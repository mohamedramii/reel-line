import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@shared/gsap.js';
import { isMotionReduced } from '@shared/motion.jsx';
import { useLang } from '@shared/i18n.jsx';
import { Reel, useReelModal } from '@shared/media.jsx';
import { reelById } from '@shared/content.js';
import { useCallLink } from '@shared/brief.jsx';
import { jump, useInView } from '@shared/scroll.jsx';

// The first screen: two frames, apart. The visitor drags one onto the other (or taps, or uses the button) and they
// lock in the arrangement of the logo: upper right behind, lower left in front, with a clear gap round the front one.
// The upper frame is the thinking (it looks like the kit's reel cover), the lower one is the reel itself. Grey and
// still until they are linked; colour and movement after. `--p` on the stage is 0 (apart) to 1 (linked).
const REEL = reelById('santos');

export default function Hero() {
  const { t, c } = useLang();
  const h = c.hero;
  const reduced = isMotionReduced();
  const openReel = useReelModal();
  const callLink = useCallLink();
  const stage = useRef(null);
  const prox = useRef({ p: 0 });
  const drag = useRef(null);
  const [linked, setLinked] = useState(false);
  const [touched, setTouched] = useState(false);
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

  const onDown = (which) => (e) => {
    if (e.button) return;
    setTouched(true);
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
            <Reel item={REEL} size="loop" playing={linked && onScreen && !reduced} />
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
                onClick={() => openReel(REEL, `${t.reels[REEL.id].title} · ${t.reels[REEL.id].note}`)}
              >
                {t.ui.sound}
              </button>
            )}
          </div>
          <span className={`cue ${touched || linked ? 'is-off' : ''}`} aria-hidden="true">
            <i />
            {h.cue}
          </span>
        </div>
        <div className="hero__ctrl">
          <button type="button" className="link-btn" id="hero-link" aria-pressed={linked} onClick={() => { setTouched(true); settle(linked ? 0 : 1); }}>
            {linked ? h.unlink : h.link}
          </button>
          <span className="sr-only" role="status">{linked ? h.linked : h.apart}</span>
        </div>
       </div>
      </div>
    </section>
  );
}
