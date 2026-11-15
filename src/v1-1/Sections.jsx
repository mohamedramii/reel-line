import { useCallback, useEffect, useRef, useState } from 'react';
import { isMotionReduced } from '@shared/motion.jsx';
import { useLang } from '@shared/i18n.jsx';
import { Reel, useReelModal } from '@shared/media.jsx';
import { egp, photos, prices, services, webFeatured, webMore } from '@shared/content.js';
import { packageFrom } from './offer.js';
import { jump, useInView, useRunway } from '@shared/scroll.jsx';

// ---------------------------------------------------------------- services: a held scene that moves sideways
const SVC_MEDIA = { page: 'zatWall', posts: 'zatCup' };
const WEB_REEL = { id: 'webReel', poster: '/media/web-reel.webp', tile: '/media/web-reel-tile.mp4', loop: '/media/web-reel.mp4' };

function ServiceCard({ s, on, live }) {
  const { t, c } = useLang();
  // the packages card carries this page's own offer (./offer.js): its wording is in this page's copy
  const it = s.id === 'packages' ? { ...t.services.packages, ...c.services.pack } : t.services[s.id];
  const big = { reels: egp(prices.reel), page: egp(prices.page), posts: egp(prices.posts5), packages: egp(packageFrom) }[s.id];
  const tag =
    s.price === 'onRequest' ? t.priceTags.onRequest
    : s.price === 'packages' ? t.priceTags.packages(egp(packageFrom))
    : t.priceTags[s.price](egp(prices[s.price]));
  return (
    <li className={`svc svc--${s.id} ${on ? 'is-on' : ''}`}>
      <div className="svc__back" aria-hidden="true">
        {SVC_MEDIA[s.id] && <img src={photos[SVC_MEDIA[s.id]]} alt="" loading="lazy" decoding="async" />}
        {s.id === 'web' && <Reel item={WEB_REEL} playing={live && on} />}
        {!SVC_MEDIA[s.id] && s.id !== 'web' && <b className="svc__fig ltr">{big || '?'}</b>}
      </div>
      <div className="svc__body">
        <span className="svc__no ltr">{s.no}</span>
        <h3>{it.title}</h3>
        <p>{it.text}</p>
        <ul className="tags">{it.tags.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="svc__price">{tag}</p>
        {s.href && <a className="more" href={s.href} onClick={jump}>{it.cta}</a>}
      </div>
    </li>
  );
}

export function Services() {
  const { t, c, isRTL } = useLang();
  const reduced = isMotionReduced();
  const runway = useRef(null);
  const view = useRef(null);
  const track = useRef(null);
  const last = useRef(0);
  const [active, setActive] = useState(0);
  const onScreen = useInView(view, { threshold: 0.3 });
  const n = services.length;

  const place = useCallback(
    (p) => {
      last.current = p;
      if (!track.current || !view.current) return;
      const travel = Math.max(0, track.current.scrollWidth - view.current.clientWidth);
      track.current.style.transform = `translate3d(${(p * travel * (isRTL ? 1 : -1)).toFixed(1)}px,0,0)`;
      const i = Math.round(p * (n - 1));
      setActive((a) => (a === i ? a : i));
    },
    [isRTL, n],
  );
  const goTo = useRunway(runway, place, { enabled: !reduced });
  // language or size changes move the cards: put them back where the scroll says
  useEffect(() => {
    if (reduced) return undefined;
    const on = () => place(last.current);
    on();
    const ro = new ResizeObserver(on);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, [place, reduced]);

  // reduced motion: a row to swipe, with arrows
  const onRowScroll = () => {
    const el = view.current;
    const step = el.scrollWidth / n;
    const i = Math.min(n - 1, Math.round(Math.abs(el.scrollLeft) / step));
    setActive((a) => (a === i ? a : i));
  };
  const move = (dir) => {
    const i = Math.min(n - 1, Math.max(0, active + dir));
    if (reduced) {
      const card = track.current.children[i];
      view.current.scrollTo({ left: card.offsetLeft - track.current.children[0].offsetLeft, behavior: 'auto' });
    } else goTo(i / (n - 1));
  };

  return (
    <section className={`services ${reduced ? 'is-row' : 'is-held'}`} id="services" aria-labelledby="svc-h" ref={runway} style={{ '--steps': n }}>
      <div className="scr services__stage">
        <header className="head">
          <h2 id="svc-h">{c.services.h2}</h2>
          <p>{c.services.sub}</p>
          <div className="stepper">
            <button type="button" onClick={() => move(-1)} disabled={active === 0} aria-label={t.ui.prev}><i className="arr arr--prev" /></button>
            <span className="ltr" role="status" aria-label={c.services.of(active + 1, n)}>{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            <button type="button" onClick={() => move(1)} disabled={active === n - 1} aria-label={t.ui.next}><i className="arr arr--next" /></button>
          </div>
          <p className="hint">{reduced ? c.services.hintReduced : c.services.hint}</p>
        </header>
        <div className="services__view" ref={view} onScroll={reduced ? onRowScroll : undefined} tabIndex={reduced ? 0 : undefined}>
          <ol className="services__track" ref={track}>
            {services.map((s, i) => <ServiceCard key={s.id} s={s} on={i === active} live={!reduced && onScreen} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- websites and apps: one screen, four projects
export function Digital() {
  const { t, c, isRTL } = useLang();
  const reduced = isMotionReduced();
  const open = useReelModal();
  const ref = useRef(null);
  const onScreen = useInView(ref, { threshold: 0.4 });
  const [pick, setPick] = useState(0);
  const item = webFeatured[pick];
  const p = t.digital.projects[item.id];
  const onKey = (e) => {
    const fwd = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const back = isRTL ? 'ArrowRight' : 'ArrowLeft';
    const d = e.key === 'ArrowDown' || e.key === fwd ? 1 : e.key === 'ArrowUp' || e.key === back ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (pick + d + webFeatured.length) % webFeatured.length;
    setPick(next);
    e.currentTarget.parentElement.children[next]?.focus();
  };
  return (
    <section className="scr digital" id="digital" aria-labelledby="dig-h">
      <header className="head">
        <h2 id="dig-h">{c.digital.h2}</h2>
        <p>{t.digital.sub}</p>
      </header>
      <div className="digital__body">
        <div className="digital__pick">
          <div className="tabs" role="tablist" aria-label={t.nav.digital}>
            {webFeatured.map((w, i) => (
              <button key={w.id} type="button" role="tab" id={`dig-tab-${w.id}`} aria-selected={i === pick} aria-controls="dig-panel" tabIndex={i === pick ? 0 : -1} onClick={() => setPick(i)} onKeyDown={onKey}>
                <b className="ltr">{w.name}</b>
                <span>{t.digital.projects[w.id].type}</span>
              </button>
            ))}
          </div>
          <p className="digital__price">{t.digital.price}</p>
        </div>
        <div className="digital__show" id="dig-panel" role="tabpanel" aria-labelledby={`dig-tab-${item.id}`} ref={ref}>
          <button type="button" className="screen" onClick={() => open(item, item.name, true)} aria-label={c.digital.open(item.name)}>
            <Reel key={item.id} item={item} size="loop" playing={!reduced && onScreen} />
            <span className="screen__bar ltr">{item.url}</span>
          </button>
          <p className="digital__text">{p.text}</p>
        </div>
        <div className="digital__more">
          <h3>{t.digital.moreTitle}</h3>
          <ul>
            {webMore.map((w) => (
              <li key={w.id}>
                <button type="button" onClick={() => open(w, w.name, true)} aria-label={c.digital.open(w.name)}>
                  <b className="ltr">{w.name}</b>
                  <span>{t.digital.more[w.id]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
