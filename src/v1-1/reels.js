// The page's five reels: Ghazala, Near Cafe and De La Vega (added 2026-11-15), and two zat reels (added 2026-11-17).
// `tile` is a 360p cut of the first seven of the reel's best twelve seconds, `loop` those twelve at 720p,
// `full` the whole reel with sound. The cut also has a scrub clip and a filmstrip of each.
// The two zat reels are short (10 and 6.8 seconds) and are used whole.
// The first screen plays the Ghazala reel.

// id: also the name of the reel's scrub clip and filmstrip. file: the name of its files in /media (the id, unless given).
const fresh = (id, focus = '50% 50%', file = id) => ({
  id,
  poster: `/media/${file}.webp`,
  tile: `/media/${file}-tile.mp4`,
  loop: `/media/${file}.mp4`,
  full: `/media/${file}-full.mp4`,
  focus, // object-position when the 9:16 frame is cropped
});

export const reels = [
  fresh('ghazala', '50% 45%'),
  fresh('near', '50% 50%'),
  fresh('vega', '50% 55%'),
  fresh('zat', '50% 50%'), // cups on the counter, the latte, "Made to start your day"
  fresh('zatTrio', '50% 50%', 'zat-trio'), // the iced latte in three shots at once
];
export const reelOf = (id) => reels.find((r) => r.id === id);

// the short clip behind the websites card of the services
export const webReel = { id: 'webReel', poster: '/media/web-reel.webp', tile: '/media/web-reel-tile.mp4', loop: '/media/web-reel.mp4' };
