// The page's six reels: three new ones (Ghazala, Near Cafe, De La Vega, added 2026-11-15) and three of the
// shared ones. They took the places of the zat reel (the only one with no full version with sound), the second
// Mamo Fried Chicken reel (the same brand twice) and the Alexandria places reel.
// `tile` is a 360p cut of the first seven of the reel's best twelve seconds, `loop` those twelve at 720p,
// `full` the whole reel with sound. The cut also has a scrub clip and a filmstrip of each.
// The first screen plays the Santos reel.
import { reelById } from '@shared/content.js';

const fresh = (id, focus = '50% 50%') => ({
  id,
  poster: `/media/${id}.webp`,
  tile: `/media/${id}-tile.mp4`,
  loop: `/media/${id}.mp4`,
  full: `/media/${id}-full.mp4`,
  focus, // object-position when the 9:16 frame is cropped
});

export const reels = [
  fresh('ghazala', '50% 45%'),
  fresh('near', '50% 50%'),
  fresh('vega', '50% 55%'),
  reelById('santos'),
  reelById('mamoBite'),
  reelById('talk'),
];
export const reelOf = (id) => reels.find((r) => r.id === id);
