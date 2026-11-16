import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getLenis } from './scroll.jsx';
import { useLang } from './i18n.jsx';
import { holdClip, startClip, videoUrl } from './video.js';
import { cachedUrl } from './preload.js';

// The agency's own footage is the only colour on these pages, so it is handled with care:
// a clip is muted, loops, and is only loaded and played while its parent says `playing`.
// Nothing here decides *when* to play: each design does (on screen, on hover, after the visitor's own action),
// and in reduced motion a clip never starts by itself.
// How it is served and started is in video.js: the lightest format the device
// plays well, clips starting one at a time, a refused autoplay retried on the next tap, the poster underneath
// (iPhones draw nothing for a <video> without a source), everything behind the full player holding still, and a clip
// that the loading screen already downloaded (preload.js) starting from memory.

// true while the full player is open, so the loops behind it hold still
const WatchingCtx = createContext(false);
export const useWatching = () => useContext(WatchingCtx);

// item: an entry of `reels`, `webFeatured` or `webMore` from content.js.  size: 'tile' (small 7s cut) or 'loop'.
// still: the clip's still picture is drawn as a real <img> under it, and the clip fades in over it once its frames
// are really playing (an iPhone draws nothing for a <video> that has no source yet).
// The picture and the clip then lie one over the other, so their parent must place `.reel` absolutely (inset 0).
export function Reel({ item, playing = false, size = 'tile', still = false, className = '', videoRef, label, style, ...rest }) {
  const own = useRef(null);
  const ref = videoRef || own;
  const watching = useWatching();
  const base = item[size] || item.loop;
  // the file is requested only once it is first needed, and its address is fixed then (format included)
  const [src, setSrc] = useState(() => (playing ? { base, url: cachedUrl(videoUrl(base)) } : null));
  useEffect(() => {
    if (src && src.base !== base) setSrc(playing ? { base, url: cachedUrl(videoUrl(base)) } : null);
    else if (playing && !src) setSrc({ base, url: cachedUrl(videoUrl(base)) });
  }, [playing, base, src]);
  // with `still`: are the clip's own frames on screen yet? (until then the picture under it is what shows)
  const url = src ? src.url : undefined;
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(false), [url]);
  const focus = item.focus ? { objectPosition: item.focus } : null;
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    // React sets `muted` only as a property; iOS checks the attribute before it allows autoplay
    v.muted = true;
    v.setAttribute('muted', '');
    return () => holdClip(v);
  }, [ref]);
  const live = playing && !watching && Boolean(src);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (live) startClip(v);
    else holdClip(v);
  }, [live, ref, src]);
  const clip = (
    <video
      ref={ref}
      className={`reel ${still ? `reel--over ${shown ? 'is-shown' : ''}` : ''} ${className}`}
      src={url}
      poster={item.poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      tabIndex={-1}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPlaying={still ? () => setShown(true) : undefined}
      style={{ backgroundImage: `url(${item.poster})`, backgroundSize: 'cover', backgroundPosition: item.focus || '50% 50%', ...focus, ...style }}
      {...rest}
    />
  );
  if (!still) return clip;
  return (
    <>
      <img className={`reel reel--still ${className}`} src={item.poster} alt="" aria-hidden="true" decoding="async" draggable="false" style={focus || undefined} />
      {clip}
    </>
  );
}

// The full clip with sound, in a native <dialog> (focus stays inside, Esc closes, the page behind does not scroll).
const ModalCtx = createContext(() => {});
export const useReelModal = () => useContext(ModalCtx);

export function ReelModalProvider({ children }) {
  const { t } = useLang();
  const [show, setShow] = useState(null); // { item, title, wide }
  const ref = useRef(null);
  const open = useCallback((item, title, wide = false) => setShow({ item, title, wide }), []);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (show && !d.open) {
      d.showModal();
      getLenis()?.stop();
    }
  }, [show]);
  const onClose = () => {
    setShow(null);
    getLenis()?.start();
  };
  return (
    <ModalCtx.Provider value={open}>
      <WatchingCtx.Provider value={Boolean(show)}>{children}</WatchingCtx.Provider>
      <dialog
        ref={ref}
        className={`reel-modal ${show?.wide ? 'is-wide' : ''}`}
        onClose={onClose}
        onClick={(e) => e.target === ref.current && ref.current.close()}
        data-lenis-prevent
        aria-label={show?.title}
      >
        {show && (
          <div className="reel-modal__box">
            <video src={videoUrl(show.item.full || show.item.loop)} poster={show.item.poster} controls autoPlay playsInline />
            <div className="reel-modal__bar">
              <strong>{show.title}</strong>
              <button type="button" onClick={() => ref.current.close()}>{t.ui.close}</button>
            </div>
          </div>
        )}
      </dialog>
    </ModalCtx.Provider>
  );
}
