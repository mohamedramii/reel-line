# reel line

The website of reel line, a full-service marketing agency in Alexandria: reels, page management, posts, sponsored
ads, websites and apps.

موقع ريل لاين، وكالة تسويق متكاملة في إسكندرية: ريلز، إدارة صفحات، بوستات، سبونسر، ومواقع وتطبيقات.

## What it is

One page, Arabic first with an English switch (`?lang=en`). The page is built from the brand's own logo, two linked
frames, and from its name:

- **First screen:** two frames, the thinking and the reel, that the visitor drags together until they lock as the
  logo does.
- **The line:** a strip of the agency's reels with one line across it. Left of the line is real, grey and still;
  right of it is reel, in colour and playing. The visitor drags the line.
- **The cut:** the scroll runs a line across six reels and shows the very frame under it.
- Then the services, websites and apps, the steps, the packages, the questions, and a short form that writes a
  WhatsApp message.

The only colour on the page is the agency's own work. Everything else is the brand's greys.

## Good to know

- Prices and packages are in `src/shared/content.js`; the savings shown on the page are worked out from them.
- Wording: `src/shared/ar.js` and `src/shared/en.js` (shared), `src/v1/copy.js` and `src/v1-1/copy.js` (this page).
- The reels on the page are listed in `src/v1-1/reels.js`. Each has a 360p tile, a 720p loop, the full reel with
  sound and a poster in `public/media`, and a smaller AV1 copy in `public/media/av1` that is used where the device
  decodes AV1 smoothly.
- The form sends nothing by itself: its button opens WhatsApp with the message written, and the visitor sends it.
- Motion is full by default; the visitor can reduce it from the footer or with `?motion=reduced`.
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
