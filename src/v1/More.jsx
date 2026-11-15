import { useEffect, useRef, useState } from 'react';
import { gsap } from '@shared/gsap.js';
import { isMotionReduced, MotionSwitch } from '@shared/motion.jsx';
import { LangButton, useLang } from '@shared/i18n.jsx';
import { Logo, LogoMotion } from '@shared/brand.jsx';
import { aLaCarte, brand, egp, maxSaving, packages, prices, saving, waLink } from '@shared/content.js';
import { useBrief } from '@shared/brief.jsx';
import { jump, scrollToId, useInView } from '@shared/scroll.jsx';

// ---------------------------------------------------------------- process: five frames, each linked to the next
export function Process() {
  const { t, c } = useLang();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, threshold: 0.4 });
  const [at, setAt] = useState(0);
  const steps = t.process;
  const step = steps[at];
  const onKey = (e) => {
    const rtl = document.documentElement.dir === 'rtl';
    const d = e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1 : e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = Math.min(steps.length - 1, Math.max(0, at + d));
    setAt(next);
    e.currentTarget.parentElement.children[next]?.focus();
  };
  return (
    <section className="scr process" id="process" aria-labelledby="proc-h">
      <header className="head">
        <h2 id="proc-h">{c.process.h2}</h2>
      </header>
      <div className={`links ${seen ? 'is-in' : ''}`} ref={ref} role="tablist" aria-label={t.nav.process} style={{ '--at': at }}>
        {steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            id={`proc-tab-${i}`}
            aria-selected={i === at}
            aria-controls="proc-panel"
            tabIndex={i === at ? 0 : -1}
            className={i < at ? 'is-done' : ''}
            style={{ '--i': i }}
            onClick={() => setAt(i)}
            onKeyDown={onKey}
          >
            <span className="ltr">{String(i + 1).padStart(2, '0')}</span>
            <b>{s.title}</b>
          </button>
        ))}
      </div>
      <div className="process__panel" id="proc-panel" role="tabpanel" aria-labelledby={`proc-tab-${at}`}>
        <div key={at} className="process__text">
          <p className="process__when">{c.process.step(at + 1)}</p>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
        <ul className="process__points" key={`p${at}`}>
          {(at === 1 ? c.process.ask : step.points).map((p) => <li key={p}>{p}</li>)}
        </ul>
        <button type="button" className="btn btn--line process__next" onClick={() => setAt((at + 1) % steps.length)}>
          {at === steps.length - 1 ? c.process.again : c.process.next}
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- packages: pick the number of reels, see the sum
export function Pricing() {
  const { t, c } = useLang();
  const brief = useBrief();
  const [pick, setPick] = useState(1); // Growth, the agency's own "our pick"
  const pkg = packages[pick];
  const p = t.pricing;
  const extra = ((pkg.posts - 10) / 5) * prices.posts5;
  const choose = () => {
    brief.set('pkg', pkg.id);
    scrollToId('contact');
  };
  const onKey = (e) => {
    const rtl = document.documentElement.dir === 'rtl';
    const d = e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'ArrowDown' ? 1 : e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (pick + d + packages.length) % packages.length;
    setPick(next);
    e.currentTarget.parentElement.children[next]?.focus();
  };
  return (
    <section className="scr pricing" id="pricing" aria-labelledby="price-h">
      <header className="head">
        <h2 id="price-h">{c.pricing.h2}</h2>
        <p>{p.sub}</p>
      </header>
      <div className="pricing__body">
        <div className="packs" role="radiogroup" aria-label={c.pricing.pick}>
          {packages.map((k, i) => (
            <button key={k.id} type="button" role="radio" aria-checked={i === pick} tabIndex={i === pick ? 0 : -1} onClick={() => setPick(i)} onKeyDown={onKey}>
              <b className="ltr">{k.reels}</b>
              <span>{p.names[k.id]}</span>
            </button>
          ))}
        </div>
        <article className="pack" aria-live="polite">
         <div className="pack__a">
          <header>
            <h3>{p.names[pkg.id]}</h3>
            {pkg.featured && <span className="pack__flag">{p.featured}</span>}
          </header>
          <p className="pack__price"><b className="ltr">{egp(pkg.price)}</b> {t.ui.currency}</p>
          <p className="pack__note">{p.notes[pkg.id]}</p>
         </div>
         <div className="pack__b">
          <ul className="pack__list">
            <li>{p.reels(pkg.reels)}</li>
            <li>{p.posts(pkg.posts)}</li>
            <li>{p.page}</li>
          </ul>
          <p className="pack__sum">
            <span>{c.pricing.sumLabel}</span>
            <b className="ltr">{c.pricing.sum(pkg.reels, egp(prices.reel), egp(prices.pagePlus10), extra ? egp(extra) : '')} = {egp(aLaCarte(pkg))}</b>
          </p>
          <p className="pack__save">{p.save(egp(saving(pkg)))}</p>
          <button type="button" className="btn" id="pack-choose" onClick={choose}>{p.choose}</button>
         </div>
        </article>
        <aside className="singles">
          <h3>{p.singlesTitle}</h3>
          <dl>
            {Object.keys(p.singles).map((k) => (
              <div key={k}>
                <dt>{p.singles[k]}</dt>
                <dd><b className="ltr">{egp(prices[k])}</b> {t.ui.currency}</dd>
              </div>
            ))}
            <div className="singles__ask">
              <dt>{p.onRequestTitle}</dt>
              <dd>{p.onRequest}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- questions
export function Faq() {
  const { t, c } = useLang();
  const [open, setOpen] = useState(0);
  const save = egp(maxSaving());
  return (
    <section className="scr faq" id="faq" aria-labelledby="faq-h">
      <header className="head">
        <h2 id="faq-h">{c.faq.h2}</h2>
        <a className="more" href={waLink(t.contact.msg.helloBare)} target="_blank" rel="noopener noreferrer">{c.faq.ask}</a>
      </header>
      <ul className="faq__list">
        {t.faq.map((f, i) => (
          <li key={f.q} className={i === open ? 'is-open' : ''}>
            <h3>
              <button type="button" id={`faq-q-${i}`} aria-expanded={i === open} aria-controls={`faq-a-${i}`} onClick={() => setOpen(i === open ? -1 : i)}>
                <span>{f.q}</span>
                <i aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={i !== open}>
              <p>{typeof f.a === 'function' ? f.a(save) : f.a}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------- contact: the brief links the visitor's brand to reel line
export function Contact() {
  const { t, c } = useLang();
  const b = useBrief();
  const k = t.contact;
  const reduced = isMotionReduced();
  const mark = useRef({ t: b.ready ? 1 : 0 });
  const [markT, setMarkT] = useState(b.ready ? 1 : 0);
  const [nudge, setNudge] = useState(false);
  // the kit's own logo reveal, driven by the form: when name and brand are filled in, the two frames come home and
  // the wordmark appears (the kit's reveal lasts 1.2s)
  useEffect(() => {
    const to = b.ready ? 1 : 0;
    if (reduced) {
      mark.current.t = to;
      setMarkT(to);
      return undefined;
    }
    const tw = gsap.to(mark.current, { t: to, duration: to ? 1.2 : 0.5, ease: 'power1.out', onUpdate: () => setMarkT(mark.current.t) });
    return () => tw.kill();
  }, [b.ready, reduced]);
  const send = (e) => {
    if (!b.ready) {
      e.preventDefault();
      setNudge(true);
      document.getElementById(b.name.trim() ? 'f-brand' : 'f-name')?.focus();
    }
  };
  return (
    <section className="scr contact" id="contact" aria-labelledby="contact-h">
      <header className="head">
        <h2 id="contact-h">{c.contact.h2}</h2>
        <p>{c.contact.sub}</p>
      </header>
      <div className="contact__body">
        <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="form__two">
            <label className="field">
              <span>{k.name}</span>
              <input id="f-name" type="text" autoComplete="given-name" placeholder={k.namePh} value={b.name} onChange={(e) => b.set('name', e.target.value)} />
            </label>
            <label className="field">
              <span>{k.brand}</span>
              <input id="f-brand" type="text" autoComplete="organization" placeholder={k.brandPh} value={b.brand} onChange={(e) => b.set('brand', e.target.value)} />
            </label>
          </div>
          <fieldset className="chips">
            <legend>{k.need}</legend>
            <div>
              {k.needs.map((n, i) => (
                <button key={n} type="button" aria-pressed={b.needs.includes(i)} onClick={() => b.toggleNeed(i)}>{n}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="chips">
            <legend>{k.budget}</legend>
            <div>
              {k.budgets.map((n, i) => (
                <button key={n} type="button" aria-pressed={b.budget === i} onClick={() => b.set('budget', b.budget === i ? null : i)}>{n}</button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>{k.reach}</span>
            <input id="f-reach" type="text" inputMode="email" autoComplete="off" placeholder={k.reachPh} value={b.reach} onChange={(e) => b.set('reach', e.target.value)} />
          </label>
        </form>
        <div className="send">
          <div className={`send__link ${b.ready ? 'is-linked' : ''}`}>
            <span className="send__you" dir="auto">{b.brand.trim() || c.contact.you}</span>
            <span className="send__plus" aria-hidden="true">+</span>
            <LogoMotion t={markT} tone="graphite" rest={0.3} title={c.contact.us} />
          </div>
          <div className="send__msg">
            <header>
              <h3>{k.preview}</h3>
              {b.pkg && <button type="button" className="more" onClick={() => b.set('pkg', null)}>{k.pkgRemove}</button>}
            </header>
            <p id="msg-preview" data-lenis-prevent>{b.message}</p>
          </div>
          <a className={`btn send__go ${b.ready ? '' : 'is-wait'}`} id="send-wa" href={b.link} target="_blank" rel="noopener noreferrer" aria-describedby="send-note" onClick={send}>
            {k.send}
          </a>
          <p className="send__note" id="send-note" role="status">{!b.ready && nudge ? k.missing : b.ready ? c.contact.linked : k.note}</p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- footer
export function Footer() {
  const { t, c } = useLang();
  const links = ['work', 'services', 'digital', 'process', 'pricing', 'faq'];
  return (
    <footer className="foot">
      <div className="foot__top">
        <Logo tone="white" />
        <p className="foot__line ltr" lang="en">{brand.line}</p>
      </div>
      <nav className="foot__nav" aria-label={t.ui.menu}>
        {links.map((l) => <a key={l} href={`#${l}`} onClick={jump}>{t.nav[l]}</a>)}
        <a href={brand.whatsapp} target="_blank" rel="noopener noreferrer">{t.ui.whatsapp} <span className="ltr">{brand.phone}</span></a>
      </nav>
      <div className="foot__end">
        <span>© 2026 <span className="ltr">reel line</span> · {t.city}</span>
        <MotionSwitch />
        <LangButton />
        <a href="#top" onClick={jump}>{c.footer.top}</a>
      </div>
    </footer>
  );
}
