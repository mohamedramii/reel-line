// The reel line logo, always from the brand kit's own SVG files (public/brand), never redrawn.
// White on dark surfaces, graphite on light ones (guide p.8). Minimum widths: horizontal 180px, icon 24px (p.7).
// The kit's files carry their own clear space (32 units round the lockup, 30 round the icon).
const SIZES = { horizontal: [716.56, 220], icon: [204, 216], stacked: [560.56, 400], wordmark: [528.56, 170] };

export function Logo({ variant = 'horizontal', tone = 'graphite', className = '', alt = 'reel line' }) {
  const [w, h] = SIZES[variant];
  return (
    <img
      className={`logo logo--${variant} ${className}`}
      src={`/brand/reel-line-${variant}-${tone}.svg`}
      alt={alt}
      width={Math.round(w)}
      height={Math.round(h)}
      decoding="async"
      draggable="false"
    />
  );
}

// The mark's two shapes, exactly as in the kit (02-Colors/brand-tokens.json: upper_path, lower_path, viewBox 144 x 156).
export const MARK = {
  w: 144,
  h: 156,
  upper: 'M48 0H144V96H108V78H126V18H66V36H48Z',
  lower: 'M0 60H96V114H78V78H18V138H96V156H0Z',
  travel: 36, // how far each frame starts from home in the kit's motion, along the diagonal
};

// The kit's own motion (guide p.22, 07-Digital/Motion): the two frames approach their places along the diagonal and
// the motion ends on the exact mark. `t` is 0 (apart) to 1 (home). This is the only place the parts ever move, and
// they are never rotated, stretched or recoloured. `spread` multiplies the kit's 36-unit travel.
export function MarkMotion({ t = 1, spread = 1, className = '', title }) {
  const d = (1 - Math.min(1, Math.max(0, t))) * MARK.travel * spread;
  const pad = MARK.travel * spread;
  return (
    <svg
      className={`mark ${className}`}
      viewBox={`${-pad} ${-pad} ${MARK.w + pad * 2} ${MARK.h + pad * 2}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path d={MARK.upper} transform={`translate(${d} ${-d})`} />
      <path d={MARK.lower} transform={`translate(${-d} ${d})`} />
    </svg>
  );
}

// The kit's logo reveal (07-Digital/Motion/reel-line-reveal-animated.svg) driven by `t` (0 to 1) instead of a clock:
// the two frames come home along the diagonal, then the wordmark fades in, with the kit's own timing (frames home at
// 0.9s, wordmark from 0.54s to 1.2s). The geometry is the kit's horizontal lockup: the mark at 32,32 and the kit's
// wordmark file placed where the lockup has it, so at t = 1 this is the horizontal logo itself, clear space included.
// Never mirrored: the mark stays left of the wordmark in Arabic too. Keep it 180px wide or more (guide p.7).
// `rest` is how much of the wordmark shows while the motion waits at t = 0 (the kit starts from nothing; a page that
// holds the first frame until the visitor acts can keep a faint wordmark so the row does not end in a hole).
const TONES = { white: '#FFFFFF', graphite: '#4B4E53', charcoal: '#202225' };
export function LogoMotion({ t = 1, tone = 'white', rest = 0, className = '', title = 'reel line' }) {
  const k = Math.min(1, Math.max(0, t));
  const d = (1 - Math.min(1, k / 0.75)) * MARK.travel;
  const word = rest + (1 - rest) * Math.min(1, Math.max(0, (k - 0.45) / 0.55));
  return (
    <svg className={`logo-motion ${className}`} viewBox="0 0 716.56 220" role="img" aria-label={title} overflow="visible">
      <g transform="translate(32 32)" fill={TONES[tone]}>
        <path d={MARK.upper} transform={`translate(${d} ${-d})`} />
        <path d={MARK.lower} transform={`translate(${-d} ${d})`} />
      </g>
      <image href={`/brand/reel-line-wordmark-${tone}.svg`} x="188" y="22" width="528.56" height="170" opacity={word} />
    </svg>
  );
}
