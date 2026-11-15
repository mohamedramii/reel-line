import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '@shared/gsap.js';
import { isMotionReduced } from '@shared/motion.jsx';
import { useLang } from '@shared/i18n.jsx';
import { Reel } from '@shared/media.jsx';
import { reelOf } from './reels.js';
import { useInView, useMedia } from '@shared/scroll.jsx';
import { clamp, useHDrag } from '../v2/line.js';

// Design 1.1: the line between real and reel (Design 2's first screen), set inside Design 1 as "the name by hand".
// A strip of the team's reels in one graphite frame, and one line across it. Left of the line is "real": the grey
// still frame of each reel. Right of it is "reel": the same reels in colour, playing. The visitor drags the line
// (anywhere on the strip), taps a spot, or uses the arrow keys on the handle. Under the strip, the three words of
// the name from the brand guide (they were Design 1's three frames).
// The physical order never mirrors (real left, reel right): the name is English. `--x` on the stage is the line's
// place, 0 (far left: all reel) to 100 (far right: all real).
const ROWS = {
  wide: ['near', 'santos', 'ghazala', 'talk', 'vega', 'mamoBite'],
  mid: ['near', 'ghazala', 'talk', 'vega'],
  phone: ['ghazala', 'vega'],
};
const START = { wide: 60, mid: 60, phone: 65 };
const SWAY = { wide: 1.7, mid: 2.2, phone: 3 }; // how far the line sways (in % of the strip) until the first touch
const STEP = 5;
// cells that are wholly on the real side; the rest are at least partly reel and may play
const realCells = (x, n) => Math.min(n, Math.floor((x * n) / 100 + 1e-6));

export default function Line() {
  const { t, c } = useLang();
  const k = c.line;
  const reduced = isMotionReduced();
  const phone = useMedia('(max-width: 759px)');
  const mid = useMedia('(max-width: 1099px)');
  const size = phone ? 'phone' : mid ? 'mid' : 'wide';
  const cells = ROWS[size].map(reelOf);
  const n = cells.length;

  const stage = useRef(null);
  const [value, setValue] = useState(START[size]); // where the visitor left the line (what assistive tech reads)
  const pos = useRef({ x: value }); // where the line is painted right now
  const count = useRef(n);
  count.current = n;
  const still = useRef(realCells(value, n));
  const [real, setReal] = useState(still.current);
  const [touched, setTouched] = useState(false);
  const held = useRef(false);
  const onScreen = useInView(stage, { threshold: 0.15 });

  const paint = useCallback(() => {
    const el = stage.current;
    if (!el) return;
    el.style.setProperty('--x', pos.current.x.toFixed(3));
    const r = realCells(pos.current.x, count.current);
    if (r !== still.current) {
      still.current = r;
      setReal(r);
    }
  }, []);
  useLayoutEffect(paint, [paint, n]);

  const moveTo = useCallback(
    (to, how) => {
      const x = clamp(to, 0, 100);
      gsap.killTweensOf(pos.current);
      if (reduced) {
        pos.current.x = x;
        paint();
      } else if (how === 'follow') gsap.to(pos.current, { x, duration: 0.16, ease: 'power2.out', onUpdate: paint });
      else gsap.to(pos.current, { x, duration: 0.55, ease: 'power3.out', onUpdate: paint });
    },
    [reduced, paint],
  );
  useEffect(() => () => gsap.killTweensOf(pos.current), []);

  // the cue: the line sways a little towards "more reel" until the first touch
  useEffect(() => {
    if (reduced || touched || !onScreen) return undefined;
    const from = pos.current.x;
    const tw = gsap.to(pos.current, { x: from - SWAY[size], duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.8, onUpdate: paint });
    return () => {
      tw.kill();
      if (!held.current) {
        pos.current.x = from;
        paint();
      }
    };
  }, [reduced, touched, onScreen, paint, size]);
  const take = () => {
    held.current = true;
    setTouched(true);
  };

  const dragProps = useHDrag((f, phase) => {
    if (phase === 'down') return;
    const x = f * 100;
    take();
    moveTo(x, phase === 'tap' ? 'glide' : 'follow');
    if (phase !== 'move') setValue(Math.round(x));
  });

  const onKey = (e) => {
    const by = { ArrowLeft: -STEP, ArrowDown: -STEP, ArrowRight: STEP, ArrowUp: STEP, PageDown: -STEP * 4, PageUp: STEP * 4 }[e.key];
    let to = null;
    if (by) to = clamp(Math.round(value / STEP) * STEP + by, 0, 100);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = 100;
    if (to === null) return;
    e.preventDefault();
    take();
    setValue(to);
    moveTo(to, 'glide');
  };

  return (
    <section className="scr ln" id="line" aria-labelledby="line-h">
      <header className="head">
        <h2 id="line-h">{k.h2}</h2>
        <p>{k.sub}</p>
      </header>

      <div className="ln__stage" ref={stage} style={{ '--n': n }} {...dragProps}>
        <div className="ln__strip" role="group" aria-label={k.stageLabel}>
          <div className="ln__row ln__row--real" aria-hidden="true">
            {cells.map((r) => (
              <img key={r.id} src={r.poster} alt="" loading="lazy" decoding="async" draggable="false" style={{ objectPosition: r.focus }} />
            ))}
          </div>
          <div className="ln__row ln__row--reel">
            {cells.map((r, i) => (
              <Reel key={r.id} item={r} playing={!reduced && onScreen && i >= real} />
            ))}
          </div>
          <div className="ln__words">
            <p className="ln__word ln__word--real">
              <b lang="en">real</b>
              <span>{k.realGloss}</span>
            </p>
            <p className="ln__word ln__word--reel">
              <b lang="en">reel</b>
              <span>{k.reelGloss}</span>
            </p>
          </div>
        </div>
        <i className="ln__line" aria-hidden="true" />
        <span className={`ln__cue ${touched ? 'is-off' : ''}`} aria-hidden="true">
          <i />
          {k.cue}
        </span>
        <div
          className="ln__grab"
          id="strip-line"
          role="slider"
          tabIndex={0}
          aria-label={k.slider}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={k.valueText(100 - value)}
          onKeyDown={onKey}
        >
          <i />
          <i />
        </div>
      </div>

      <dl className="ln__names">
        {t.naming.map((w) => (
          <div key={w.word}>
            <dt className="ltr" lang="en">{w.word}</dt>
            <dd>{w.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
