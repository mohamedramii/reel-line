import { useCallback, useEffect, useRef, useState } from 'react';
import { isMotionReduced } from '@shared/motion.jsx';
import { useLang } from '@shared/i18n.jsx';
import { useReelModal } from '@shared/media.jsx';
import { reels } from './reels.js';
import { getLenis, headerH, useInView, useMedia, useRunway } from '@shared/scroll.jsx';
import { pad2, useHDrag } from '../v2/line.js';

// Design 1.1 keeps its own copy of Design 2's cut, because its six reels are its own (reels.js): three of the
// shared ones and three new ones, whose names are in this design's copy.
// The cut: a held scene laid out like an edit suite. A 9:16 viewer, and under it a timeline with one track of six
// clip blocks (each a filmstrip of that reel) and the white line as its playhead.
// The page scroll moves the playhead across the track (the scroll is the single source of truth: dragging the
// playhead or tapping a block only scrolls the page), and the viewer shows the very frame under the playhead by
// setting video.currentTime on a "scrub" copy of the clip (a keyframe every 3 frames).
// Behind the playhead the track is in colour, ahead of it grey: the reel is made as the line passes.
// Reduced motion: no runway and no scrubbing. A block selects its reel, the viewer shows its poster and a play button.
// `--ph` on the stage is the playhead, 0..1 across the track. The timeline runs left to right in both languages.
// a reel's title and one-line idea: this design's own for the new reels, the shared copy's for the others
const nameOf = (t, c, id) => c.reels?.[id] || t.reels[id];
const N = reels.length;
const FPS = 24; // the clips' own frame rate
const GUESS = 7; // seconds, until a clip reports its own length
const scrubSrc = (r) => `/media/d2/${r.id}-scrub.mp4`;
const stripSrc = (r) => `/img/d2-strip-${r.id}.webp`;
const TICKS = [0, 1, 2, 3, 4, 5, 6];
// which of the strip's 8 frames a block shows, by how many fit: each stands for its share of the clip
const FRAMES = { 4: [1, 3, 5, 7], 3: [1, 4, 7], 2: [2, 6] };

// minutes : seconds : frames, in the clip's own real time
const timecode = (s) => {
  const f = Math.max(0, Math.round(s * FPS));
  return `${pad2(Math.floor(f / FPS / 60))}:${pad2(Math.floor(f / FPS) % 60)}:${pad2(f % FPS)}`;
};

export default function Cut() {
  const { t, c } = useLang();
  const k = c.cut;
  const reduced = isMotionReduced();
  const openReel = useReelModal();
  const phone = useMedia('(max-width: 759px)');
  const mid = useMedia('(max-width: 1099px)');
  const frames = FRAMES[phone ? 2 : mid ? 3 : 4];

  const runway = useRef(null);
  const stage = useRef(null);
  const vids = useRef([]);
  const want = useRef([]); // the time each clip should be showing
  const tcEl = useRef(null);
  const at = useRef(0);
  const lastP = useRef(0); // where the scroll last put the playhead
  const [active, setActive] = useState(0);
  const [lengths, setLengths] = useState({}); // each clip's own length, once known
  const [asked, setAsked] = useState(0); // scrub files are asked for one after the other, from the first
  // "near" is once the scene has started to come up the screen: nothing of it is fetched while the visitor is still
  // on the first screen (the scene begins exactly at the fold, so the test has to be stricter than "in view")
  const near = useInView(runway, { once: true, margin: '0px 0px -12% 0px', threshold: 0 });
  const coarse = useMedia('(hover: none)');

  const cur = reels[active];
  const meta = nameOf(t, c, cur.id);
  const label = `${meta.title} · ${meta.note}`;

  // ---- scrubbing: one seek at a time per clip, always ending on the latest wanted time
  const flush = useCallback((i) => {
    const v = vids.current[i];
    const w = want.current[i];
    if (!v || w == null || v.readyState < 1 || v.seeking) return;
    if (Math.abs(v.currentTime - w) > 0.015) v.currentTime = w;
  }, []);
  const place = useCallback(
    (p) => {
      lastP.current = p;
      const i = Math.min(N - 1, Math.floor(p * N));
      const v = vids.current[i];
      const len = v && v.duration ? v.duration : GUESS;
      const time = Math.min(len - 0.05, Math.max(0, (p * N - i) * len));
      stage.current?.style.setProperty('--ph', p.toFixed(5));
      if (tcEl.current) tcEl.current.textContent = timecode(time);
      want.current[i] = time;
      flush(i);
      if (i !== at.current) {
        at.current = i;
        setActive(i);
      }
    },
    [flush],
  );
  const goTo = useRunway(runway, place, { enabled: !reduced });

  // dragging the playhead scrolls the page there at once (no easing: the hand is the easing)
  const scrubTo = useCallback((p) => {
    const el = runway.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const hh = headerH();
    const y = Math.round(window.scrollY + r.top - hh + p * (r.height - (window.innerHeight - hh)));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }, []);
  const byHand = useRef(0); // when the track last answered a pointer itself
  const dragProps = useHDrag((f, phase) => {
    if (phase === 'down') return;
    byHand.current = Date.now();
    if (phase === 'tap') goTo(f);
    else scrubTo(f);
  });

  const onMeta = (i) => (e) => {
    const v = e.currentTarget;
    setLengths((m) => (m[i] ? m : { ...m, [i]: v.duration }));
    // the clip has just told its real length: the frame wanted so far was worked out from a guess, so place the
    // playhead again (without this a clip longer or shorter than the guess shows the wrong frame until the next scroll)
    place(lastP.current);
    // phones only draw a frame after a seek once the clip has been started once
    if (coarse) {
      const pr = v.play();
      if (pr && pr.then) pr.then(() => { v.pause(); flush(i); }).catch(() => {});
    }
    flush(i);
  };
  useEffect(() => {
    if (!reduced && tcEl.current && !tcEl.current.textContent) tcEl.current.textContent = timecode(0);
  }, [reduced]);

  const armed = (i) => !reduced && near && (i <= asked || i === active);
  // a block as a button: for the keyboard and assistive tech. A pointer tap has just been answered by the track
  // itself (it goes to the very spot that was tapped), so the click that follows it is left alone.
  const pick = (i) => () => {
    if (reduced) setActive(i);
    else if (Date.now() - byHand.current > 500) goTo(i / N + 0.002);
  };

  return (
    <section className={`cut ${reduced ? 'is-flat' : 'is-held'}`} id="cut" aria-labelledby="cut-h" ref={runway}>
      <div className="scr cut__stage" ref={stage} style={reduced ? { '--k': frames.length, '--ph': active / N } : { '--k': frames.length }}>
        <header className="head cut__head">
          <h2 id="cut-h">{k.h2}</h2>
          <p>{reduced ? k.subReduced : k.sub}</p>
        </header>

        <div className="viewer">
          {reduced ? (
            <>
              <img src={cur.poster} alt="" decoding="async" style={{ objectPosition: cur.focus }} />
              <button type="button" className="viewer__play" onClick={() => openReel(cur, label)} aria-label={k.open(meta.title)}>
                <i />
              </button>
            </>
          ) : (
            reels.map((r, i) => (
              <video
                key={r.id}
                ref={(el) => { vids.current[i] = el; }}
                className={i === active ? 'is-on' : ''}
                src={armed(i) ? scrubSrc(r) : undefined}
                poster={r.poster}
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                tabIndex={-1}
                aria-hidden="true"
                onLoadedMetadata={onMeta(i)}
                onLoadedData={() => setAsked((a) => Math.max(a, i + 1))}
                onSeeked={() => flush(i)}
              />
            ))
          )}
        </div>

        <div className="clip">
          <p className="clip__no ltr" aria-label={k.of(active + 1, N)}>
            <b>{pad2(active + 1)}</b>
            <span>/ {pad2(N)}</span>
          </p>
          <h3>{meta.title}</h3>
          <p className="clip__note">{meta.note}</p>
          {!reduced && (
            <p className="clip__tc">
              <span>{k.time}</span>
              <span className="clip__now ltr">
                <b ref={tcEl} />
                <i>/ {timecode(lengths[active] || GUESS)}</i>
              </span>
            </p>
          )}
          <button type="button" className="btn btn--line btn--sm" id="cut-watch" onClick={() => openReel(cur, label)} aria-label={k.open(meta.title)}>
            {t.ui.watch}
          </button>
        </div>

        <div className="tl" role="group" aria-label={k.track} {...(reduced ? {} : dragProps)}>
          <ol className="tl__blocks">
            {reels.map((r, i) => (
              <li key={r.id} className={i === active ? 'is-on' : ''} style={{ '--i': i }}>
                <button type="button" onClick={pick(i)} aria-label={k.go(nameOf(t, c, r.id).title)} aria-current={i === active ? 'true' : undefined}>
                  <span className="tl__name">
                    <b className="ltr">{pad2(i + 1)}</b>
                    <span>{nameOf(t, c, r.id).title}</span>
                  </span>
                  <span className="tl__film" style={{ '--strip': `url(${stripSrc(r)})` }} aria-hidden="true">
                    <span className="tl__raw">{frames.map((f) => <i key={f} style={{ '--f': f }} />)}</span>
                    <span className="tl__done">{frames.map((f) => <i key={f} style={{ '--f': f }} />)}</span>
                  </span>
                  <span className="tl__ticks" aria-hidden="true">{TICKS.map((x) => <i key={x} />)}</span>
                </button>
              </li>
            ))}
          </ol>
          <span className="ph" aria-hidden="true"><i /></span>
        </div>
      </div>
    </section>
  );
}
