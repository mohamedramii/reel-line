# reel line

The website of reel line, a full-service marketing agency in Alexandria: reels, page management, posts, sponsored
ads, websites and apps.

موقع ريل لاين، وكالة تسويق متكاملة في إسكندرية: ريلز، إدارة صفحات، بوستات، سبونسر، ومواقع وتطبيقات.

## What it is

One page, Arabic first with an English switch (`?lang=en`). The page is built from the brand's own logo, two linked
frames, and from its name:

- **Loading screen:** the logo's two frames come home as the first clips download, then the screen lifts.
- **First screen:** two frames, the thinking and the reel, that link by themselves as the logo does, and that the
  visitor can pull apart and link again.
- **The line:** a strip of the agency's reels with one line across it. Left of the line is real, grey and still;
  right of it is reel, in colour and playing. The visitor drags the line.
- **The cut:** the scroll runs a line across six reels and shows the very frame under it.
- **The steps:** five linked frames; the scroll moves from one to the next.
- Then the services, websites and apps, the package offer, the questions, and a short form that writes a WhatsApp
  message.

The only colour on the page is the agency's own work. Everything else is the brand's greys.

## Good to know

- The package offer (where a package starts) is in `src/v1-1/offer.js`; the single-service prices are in
  `src/shared/content.js`.
- Wording: `src/shared/ar.js` and `src/shared/en.js` (shared), `src/v1-1/copy.js` (this page).
- The reels on the page are listed in `src/v1-1/reels.js`. Each has a 360p tile, a 720p loop, the full reel with
  sound and a poster in `public/media`, and a smaller AV1 copy in `public/media/av1` that is used where the device
  decodes AV1 smoothly.
- The loading screen (`src/v1-1/Loader.jsx`) waits for the clips of the first two screens, never less than 1.7
  seconds and never more than 7; the rest goes on downloading behind the open page.
- The form sends nothing by itself: its button opens WhatsApp with the message written, and the visitor sends it.
- Motion is always on. `?motion=reduced` in the address gives a still version of the page.
- The page is marked `noindex` for now (the `robots` meta tag in `index.html` and the header in `vercel.json`).

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Built with Vite, React and GSAP.
