// Facts shared by every reel line design (no wording here: copy is in ar.js / en.js and in each design's copy.js).
// Source: the agency's own earlier landing page and the reel line brand kit v1.
// Whatever was marked SAMPLE there, or could not be checked, was left out.

export const brand = {
  name: 'reel line',
  nameAr: 'ريل لاين',
  line: 'Ideas, connected.', // the kit's tagline, English only
  phone: '+20 12 81840466', // the agency's number, written as its owner gave it on 19 Nov 2026: the only number on the site
  whatsapp: 'https://wa.me/201281840466',
};

// Price list in EGP. Package savings are computed from these, never typed.
export const prices = {
  reel: 700, // one reel
  page: 2000, // page management
  posts5: 500, // 5 designed posts
  pagePlus10: 2500, // page management + 10 posts
};

export const packages = [
  { id: 'start', reels: 8, posts: 10, price: 6500 },
  { id: 'growth', reels: 12, posts: 10, price: 8000, featured: true },
  { id: 'scale', reels: 20, posts: 15, price: 12000 },
];

// What the same package costs when ordered service by service (cheapest combination).
export const aLaCarte = (pkg) => pkg.reels * prices.reel + prices.pagePlus10 + ((pkg.posts - 10) / 5) * prices.posts5;
export const saving = (pkg) => aLaCarte(pkg) - pkg.price;
export const maxSaving = () => Math.max(...packages.map(saving));
export const egp = (n) => n.toLocaleString('en-US');
export const packageById = (id) => packages.find((p) => p.id === id);

// Reels the team made (9:16). `tile` is a 7-second 360p cut, `loop` a 720p loop, `full` the whole reel with sound.
// The four zat clips are takes of one reel, so only one is listed.
const reel = (id, file, full, focus = '50% 50%') => ({
  id,
  poster: `/media/${file}.webp`,
  tile: `/media/${file}-tile.mp4`,
  loop: `/media/${file}.mp4`,
  full: full ? `/media/${file}-full.mp4` : `/media/${file}.mp4`,
  focus, // object-position when the 9:16 frame is cropped
});
export const reels = [
  reel('santos', 'santos', true, '50% 30%'),
  reel('mamoBite', 'mamo-bite', true, '50% 45%'),
  reel('zatPour', 'zat-pour', false, '50% 40%'),
  reel('alexVlog', 'alex-vlog', true, '50% 40%'),
  reel('talk', 'talk', true, '50% 35%'),
  reel('mamoBowl', 'mamo-bowl', true, '50% 45%'),
];
export const reelById = (id) => reels.find((r) => r.id === id);

// Two photographs from the zat shoot.
export const photos = { zatCup: '/media/zat-cup.webp', zatWall: '/media/zat-wall.webp' };

// Screen recordings of web and app work (wide, about 2.09 : 1).
const screen = (id, file, name, url) => ({
  id,
  name,
  url,
  poster: `/media/${file}.webp`,
  tile: `/media/${file}-tile.mp4`,
  loop: `/media/${file}.mp4`,
  full: `/media/${file}-full.mp4`,
});
export const webFeatured = [
  screen('nizam', 'web-nizam-erp', 'Nizam', 'nizam-accounting.com'),
  screen('khwarizmi', 'web-khw-reports', 'Khwarizmi', 'alkhwarizmi.com'),
  screen('snap', 'web-snap', 'Snap Action', 'snapaction.com'),
  screen('jeel', 'web-jeel', 'JeelTech', 'jeeltech.com'),
];
export const webMore = [
  screen('vbooking', 'web-vbooking', 'vbooking'),
  screen('radx', 'web-radx', 'RADX'),
  screen('byv', 'web-byv', 'BookYourVibes'),
  screen('travelio', 'web-travelio', 'Travelio'),
  screen('culin', 'web-culin', 'Culin'),
  screen('ifish', 'web-ifish', 'i-Fish'),
];

// The six services, in the order of the copy dictionaries. `price` names the tag to show.
export const services = [
  { id: 'reels', no: '01', price: 'reel', reel: 'mamoBite' },
  { id: 'page', no: '02', price: 'page', photo: 'zatWall' },
  { id: 'posts', no: '03', price: 'posts5', photo: 'zatCup' },
  { id: 'ads', no: '04', price: 'onRequest', reel: 'talk' },
  { id: 'web', no: '05', price: 'onRequest', screen: 'snap', href: '#digital' },
  { id: 'packages', no: '06', price: 'packages', reel: 'santos', href: '#pricing' },
];

// A WhatsApp link with a ready message. Nothing is sent by the page itself: the visitor sends it from their own WhatsApp.
export const waLink = (text) => `${brand.whatsapp}?text=${encodeURIComponent(text)}`;
