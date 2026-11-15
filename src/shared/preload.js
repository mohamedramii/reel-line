// Downloads the first clips a visitor meets while the loading screen runs, and keeps them as in-memory blobs so
// they start at once (no network wait, no still frame) when they come on screen.
// A clip is asked for in the format this device will play (see video.js), so call this after `codecReady`.
import { videoUrl } from './video.js';

const blobs = new Map(); // the address a clip is served at -> its blob address, once it has fully arrived

// the address a <video> should use: the downloaded blob when there is one. Fix it once per element: a clip that has
// started streaming must not be swapped for its blob when that arrives later.
export const cachedUrl = (url) => blobs.get(url) || url;

// Fetches every clip (4 at a time, in the order given) and reports overall progress 0 to 1.
// Resolves when all are in; a clip that fails just streams normally later.
export function preloadVideos(urls, onProgress) {
  const list = [...new Set(urls.filter(Boolean).map(videoUrl))];
  const done = list.map(() => 0);
  const report = () => onProgress?.(list.length ? done.reduce((s, d) => s + d, 0) / list.length : 1);
  if (!list.length) {
    report();
    return Promise.resolve();
  }

  const one = async (url, i) => {
    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const total = Number(res.headers.get('content-length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      for (;;) {
        const { done: end, value } = await reader.read();
        if (end) break;
        chunks.push(value);
        got += value.length;
        if (total) done[i] = Math.min(0.99, got / total);
        report();
      }
      blobs.set(url, URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' })));
    } catch {
      /* the clip just streams normally later */
    }
    done[i] = 1;
    report();
  };

  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const i = next++;
      await one(list[i], i);
    }
  };
  return Promise.all(Array.from({ length: Math.min(4, list.length) }, worker));
}
