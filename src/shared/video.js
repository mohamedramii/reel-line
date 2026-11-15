// How a clip is served and started.
//
// 1. The lightest format this device plays well. The AV1 files (public/media/av1) are about 30 to 45% smaller than
//    the H.264 ones at the same visual quality, but they are used only where decoding is smooth (desktop) or
//    hardware-accelerated (phones), and only for clips that have an AV1 copy (av1-list.js).
// 2. Clips start one at a time: several starting in the same frame is a visible hitch on phones.
// 3. iOS Low Power Mode (and some data savers) refuse autoplay until the visitor touches the page: a refused clip
//    is remembered and started on the next tap.
import AV1_FILES from './av1-list.js';

const AV1 = 'video/mp4; codecs="av01.0.05M.08"';
const OPUS = 'audio/mp4; codecs="opus"';
let useAv1 = false;
let useAv1Audio = false;

async function probe() {
  if (typeof document === 'undefined') return;
  const v = document.createElement('video');
  if (v.canPlayType(AV1) !== 'probably') return;
  try {
    const info = await navigator.mediaCapabilities?.decodingInfo({
      type: 'file',
      video: { contentType: AV1, width: 720, height: 1280, bitrate: 900_000, framerate: 30 },
    });
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    useAv1 = !!info?.supported && (coarse ? info.powerEfficient : info.smooth);
  } catch {
    useAv1 = !window.matchMedia('(pointer: coarse)').matches;
  }
  useAv1Audio = useAv1 && v.canPlayType(OPUS) === 'probably';
}

// resolved a few milliseconds after the page starts; until then clips are served as H.264
export const codecReady = probe();

export function videoUrl(url) {
  if (!url || !useAv1 || !url.startsWith('/media/') || url.startsWith('/media/av1/')) return url;
  const name = url.slice('/media/'.length);
  if (!AV1_FILES.has(name)) return url; // no AV1 copy of this clip (the web walkthroughs' full versions, the scrub clips)
  // full clips carry audio (Opus in the AV1 files): keep H.264/AAC where Opus-in-MP4 is not supported
  if (name.endsWith('-full.mp4') && !useAv1Audio) return url;
  return `/media/av1/${name}`;
}

// ---- starting and holding clips
const wanted = new Set(); // clips that should be playing now
const refused = new Set(); // wanted clips the browser would not start by itself
const queue = new Set();
let timer = 0;

function next() {
  timer = 0;
  const el = queue.values().next().value;
  if (!el) return;
  queue.delete(el);
  if (el.isConnected && wanted.has(el)) {
    const p = el.play?.();
    if (p && p.then) p.then(() => refused.delete(el)).catch(() => wanted.has(el) && refused.add(el));
    timer = setTimeout(next, 90);
  } else next();
}

// start a clip (in its turn)
export function startClip(el) {
  wanted.add(el);
  queue.add(el);
  if (!timer) next();
}
// hold a clip still
export function holdClip(el) {
  wanted.delete(el);
  queue.delete(el);
  refused.delete(el);
  el.pause?.();
}

if (typeof window !== 'undefined') {
  // a tap unlocks every refused clip that is still wanted
  const retry = () =>
    refused.forEach((el) => {
      if (!el.isConnected || !wanted.has(el) || !el.getAttribute('src')) return refused.delete(el);
      return el.play?.().then(() => refused.delete(el)).catch(() => {});
    });
  ['touchend', 'click', 'keydown'].forEach((type) => window.addEventListener(type, retry, { passive: true }));
}
