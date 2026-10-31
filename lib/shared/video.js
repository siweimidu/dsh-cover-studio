/**
 * @local/dsh-cover-studio — Video thumbnail scenes.
 *
 * A video cover is a different animal from a deck page: it is seen at 240px
 * wide in a feed, so the rules are inverted — fewer words, bigger type,
 * stroked outlines for readability over art, and colour used as punctuation
 * rather than as a system.
 *
 * Everything here is pure geometry, like shared/scene.js, so the CLI, the
 * editor and the agent tools all produce the same thumbnail.
 */

/** Thumbnail presets. All are multiples of 8 so a 2x export stays integral. */
export const VIDEO_RATIOS = [
  { id: '16:9', w: 1280, h: 720, label: 'B站 / YouTube', safe: 56 },
  { id: '4:3', w: 960, h: 720, label: '经典横屏', safe: 48 },
  { id: '9:16', w: 720, h: 1280, label: '抖音 / Shorts', safe: 56 },
  { id: '1:1', w: 960, h: 960, label: '方图', safe: 56 }
];

export function videoRatioOf(id) {
  for (var i = 0; i < VIDEO_RATIOS.length; i++) if (VIDEO_RATIOS[i].id === id) return VIDEO_RATIOS[i];
  return VIDEO_RATIOS[0];
}

/** Bold colour ways for thumbnails — deliberately louder than the deck tones. */
export const VIDEO_THEMES = {
  coral: {
    bg: '#f4ede4', ink: '#12100e', dim: '#6f665c',
    accent: '#e8503a', accent2: '#f2a900', panel: '#12100e', panelFg: '#f7f3ec'
  },
  midnight: {
    bg: '#101014', ink: '#f7f5f0', dim: '#9a968e',
    accent: '#ff5a3c', accent2: '#ffd166', panel: '#f7f5f0', panelFg: '#101014'
  },
  mint: {
    bg: '#0f2a24', ink: '#f2fbf6', dim: '#8fb3a8',
    accent: '#3ddc97', accent2: '#ffd166', panel: '#3ddc97', panelFg: '#0f2a24'
  },
  sky: {
    bg: '#0d1b2a', ink: '#f0f6ff', dim: '#8ba3bd',
    accent: '#4ea8de', accent2: '#ffd166', panel: '#4ea8de', panelFg: '#0d1b2a'
  }
};

export function videoThemeOf(name) {
  return VIDEO_THEMES[name] || VIDEO_THEMES.coral;
}

/* --------------------------------------------------------------- helpers */

function r1(n) { return Math.round(n * 10) / 10; }

/**
 * Split a headline into display lines.
 *
 * Thumbnails are read in one glance, so the headline is chunked by meaning
 * rather than by measuring glyphs: the caller passes the intended breaks and
 * this trims and drops empties.
 */
function splitLines(headline) {
  if (Array.isArray(headline)) {
    return headline.map(function (s) { return String(s).trim(); }).filter(Boolean);
  }
  return String(headline || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
}

/* ------------------------------------------------------------- the scene */

/**
 * Build a video thumbnail scene.
 *
 * @param deck {
 *   headline: string | string[],   display lines, e.g. ['还在补偿', '人事变动', '要来大的？']
 *   kicker?:  string,              small line above the headline
 *   badge?:   string,              corner label, e.g. '独家'
 *   date?:    string,              top-right date
 *   channel?: string,              bottom-left channel name
 *   logos?:   [{ src, size?, ring? }],  circular badges stacked on the right
 *   hero?:    { src, size?, x?, y?, ring? },  the one big mark a thumbnail leads with
 *             Prefer a transparent variant (symbol-trans-color) so the mark
 *             sits on the background instead of a white plate.
 *   art?:     { src, x, y, w, h }, full-bleed or corner artwork
 *   theme?:   key of VIDEO_THEMES
 *   ratio?:   key of VIDEO_RATIOS
 *   accentWords?: string[]         words to paint with the second accent
 * }
 */
export function buildVideoCover(deck, stage) {
  var d = deck || {};
  var ratio = videoRatioOf(d.ratio || '16:9');
  var W = (stage && stage.w) || ratio.w;
  var H = (stage && stage.h) || ratio.h;
  var th = videoThemeOf(d.theme || 'coral');

  var KX = W / ratio.w;
  var KY = H / ratio.h;
  var KS = Math.min(KX, KY);

  var pad = ratio.safe * KS;
  var els = [];

  /* ---- artwork sits behind everything ---- */
  if (d.art && d.art.src) {
    var a = d.art;
    els.push({
      key: 'vc-art', type: 'image', role: 'art',
      src: a.src,
      x: Math.round((a.x || 0) * KX),
      y: Math.round((a.y || 0) * KY),
      w: Math.round((a.w || W) * KX),
      h: Math.round((a.h || H) * KY),
      rot: 0, opacity: a.opacity === undefined ? 1 : a.opacity
    });
  }

  /* ---- kicker: small caps line, top-left ---- */
  if (d.kicker) {
    els.push({
      key: 'vc-kicker', type: 'text', role: 'kicker', text: d.kicker,
      x: pad, y: pad * 0.72, w: W - pad * 2, h: Math.round(34 * KS),
      size: Math.round(24 * KS), weight: 700, color: th.ink,
      tracking: 1.5, align: 'left', lineHeight: 1.2, rot: 0,
      opacity: 0.9, sans: true
    });
  }

  /* ---- date: top-right, mono ---- */
  if (d.date) {
    els.push({
      key: 'vc-date', type: 'text', role: 'date', text: d.date,
      x: pad, y: pad * 0.72, w: W - pad * 2, h: Math.round(34 * KS),
      size: Math.round(24 * KS), weight: 600, color: th.ink,
      tracking: 1, align: 'right', lineHeight: 1.2, rot: 0,
      opacity: 0.78, mono: true
    });
  }

  /* ---- headline: the whole point ---- */
  var lines = splitLines(d.headline);
  if (lines.length) {
    var maxLen = lines.reduce(function (m, s) { return Math.max(m, s.length); }, 1);
    /* Fit by both axes: a long line shrinks, and many lines shrink further. */
    /* Reserve the bottom band for the channel chip and the platform chrome
       (play count, duration) that every feed overlays. */
    var BOTTOM_RESERVE = Math.round(84 * KS);
    var TOP_RESERVE = Math.round(112 * KS);

    /* Two hero modes:
       - inline (default): the mark stacks above the headline and the headline
         starts below it.
       - free (d.hero.placed): the caller positioned it by hand, so the
         headline keeps the full canvas — it is expected not to overlap. */
    var heroBlock = 0;
    if (d.hero && d.hero.src && !d.hero.placed) {
      heroBlock = Math.round((d.hero.size || 260) * KS) + Math.round(24 * KS);
      TOP_RESERVE += heroBlock;
    }
    /* Portrait has no horizontal room for a side-by-side hero, so the free
       hero is pushed into the lower third and the headline is clamped to the
       space above it. */
    var portrait = H > W * 1.15;
    if (portrait && d.hero && d.hero.src) {
      var heroSize = Math.round((d.hero.size || 260) * KS);
      BOTTOM_RESERVE = Math.max(BOTTOM_RESERVE, Math.round(heroSize * 0.62));
    }
    var availH = H - TOP_RESERVE - BOTTOM_RESERVE;

    /* Width budget shrinks only when the hero sits beside the text; a
       full-width headline is the point of a thumbnail. */
    var heroW = (d.hero && d.hero.src && d.hero.beside)
      ? Math.round((d.hero.size || 260) * KS) + pad
      : 0;
    var byWidth = (W - pad * 2 - heroW) / (maxLen * 0.94);
    var byHeight = availH / (lines.length * 1.04);
    /* Portrait gets a taller ceiling: the same 148px that fills a 720-high
       landscape frame leaves a 1280-high frame looking empty. */
    var maxSize = portrait ? 200 * KS : 148 * KS;
    var size = Math.max(36 * KS, Math.min(byWidth, byHeight, maxSize));

    var lh = 1.04;
    var blockH = Math.round(size * lh * lines.length);
    /* Anchor the block in the band the eye lands on after the art. */
    /* Inline hero already sits at the top, so the headline follows it
       directly; a free/absent hero centres the block in the remaining band. */
    /* Portrait fills top-down after the mark (a big centred block leaves an
       awkward void at the bottom); landscape centres for optical balance. */
    var blockY = (d.hero && d.hero.src && !d.hero.placed)
      ? Math.round(TOP_RESERVE + Math.max(0, (availH - blockH) * (portrait ? 0.24 : 0.12)))
      : Math.round(TOP_RESERVE + Math.max(0, (availH - blockH) * (portrait ? 0.18 : 0.35)));

    lines.forEach(function (ln, i) {
      var accent = false;
      if (Array.isArray(d.accentWords)) {
        accent = d.accentWords.some(function (w) { return w && ln.indexOf(w) >= 0; });
      }
      els.push({
        key: 'vc-h' + i, type: 'text', role: 'headline', text: ln,
        x: pad, y: blockY + Math.round(i * size * lh),
        w: W - pad * 2, h: Math.round(size * lh),
        size: Math.round(size), weight: 900,
        color: accent ? th.accent2 : th.ink,
        tracking: -size * 0.02, align: 'left', lineHeight: lh, rot: 0,
        opacity: 1, sans: true, noWrap: true,
        /* Outline is what keeps 大字报 legible over photography. */
        stroke: d.stroke === false ? 0 : Math.max(2, size * 0.035),
        strokeColor: th.bg
      });
    });

    /* A slim accent bar under the headline ties the block together. It is
       clamped above the channel chip so the two can never collide. */
    var ruleY = Math.min(
      blockY + blockH + Math.round(18 * KS),
      H - Math.round(pad * 0.72) - Math.round(44 * KS)
    );
    els.push({
      key: 'vc-rule', type: 'shape', role: 'rule',
      x: pad, y: ruleY,
      w: Math.round(Math.min(W - pad * 2, 220 * KX)), h: Math.round(8 * KS),
      fill: th.accent, rot: 0, opacity: 1
    });
  }

  /* ---- corner badge ---- */
  if (d.badge) {
    var bw = Math.round(124 * KX), bh = Math.round(50 * KS);
    /* Top-right belongs to the date, so the badge sits just under it. */
    var badgeY = Math.round(pad * 0.72 + 44 * KS);
    els.push({
      key: 'vc-badge-bg', type: 'shape', role: 'badge-bg',
      x: Math.round(W - pad - bw), y: badgeY, w: bw, h: bh,
      fill: th.accent, radius: bh / 2, rot: 0, opacity: 1
    });
    els.push({
      key: 'vc-badge', type: 'text', role: 'badge', text: d.badge,
      x: Math.round(W - pad - bw), y: badgeY, w: bw, h: bh,
      size: Math.round(26 * KS), weight: 800, color: '#fff',
      tracking: 0.5, align: 'center', lineHeight: 1.2, rot: 0,
      opacity: 1, sans: true, noWrap: true
    });
  }

  /* ---- logo badges: the reason a model appears in the thumbnail ---- */
  if (Array.isArray(d.logos) && d.logos.length) {
    var count = Math.min(6, d.logos.length);
    /* Bigger rings read better in a feed, and the cluster is anchored in the
       right-middle band so it balances the left-aligned headline instead of
       fighting the platform chrome in the corner. */
    var base = Math.round(124 * KS);
    var gap = Math.round(14 * KS);
    var cols = count <= 3 ? count : (count === 4 ? 2 : 3);
    var rows = Math.ceil(count / cols);
    var clusterW = cols * base + (cols - 1) * gap;
    var clusterH = rows * base + (rows - 1) * gap;
    var startX = Math.round(W - pad - clusterW);
    /* With a free hero occupying the right band, the badge cluster drops to
       the bottom-right corner instead of colliding with it. */
    var startY = (d.hero && d.hero.src && d.hero.placed)
      ? Math.round(H - Math.round(pad * 0.72) - clusterH - 20 * KS)
      : Math.round((H - clusterH) / 2 + 30 * KS);

    d.logos.slice(0, count).forEach(function (lg, i) {
      var col = i % cols, row = Math.floor(i / cols);
      els.push({
        key: 'vc-logo' + i, type: 'logo', role: 'logo',
        src: lg.src, logo: lg.logo,
        x: startX + col * (base + gap),
        y: startY + row * (base + gap),
        w: base, h: base,
        ring: lg.ring === false ? 0 : Math.max(4, Math.round(6 * KS)),
        ringColor: th.accent,
        ringFill: '#fff',
        ringPad: Math.round(12 * KS),
        shadow: '0 6px 20px rgba(0,0,0,.35)',
        rot: 0
      });
    });
  }

  /* ---- hero mark: the one big logo a thumbnail is built around ---- */
  if (d.hero && d.hero.src) {
    var hs = Math.round((d.hero.size || 260) * KS);
    els.push({
      key: 'vc-hero', type: 'logo', role: 'hero',
      src: d.hero.src, logo: d.hero.logo,
      x: Math.round(d.hero.x !== undefined ? d.hero.x * KX : pad),
      y: Math.round(d.hero.placed
        ? (d.hero.y || 0) * KY
        : (d.hero.y !== undefined ? d.hero.y * KY : pad * 0.72 + 40 * KS)),
      /* Inline hero already reserved vertical space above the headline, so the
         headline block starts right under it — no extra gap. */
      w: hs, h: hs,
      /* No ring means the mark floats on the background — a white plate
         behind a coloured logo looks like a pasted sticker. */
      ring: d.hero.ring === false ? 0 : Math.max(6, Math.round(8 * KS)),
      ringColor: d.hero.ringColor || th.ink,
      ringFill: d.hero.ringFill || '#fff',
      ringPad: Math.round(16 * KS),
      /* No shadow: an <img> box-shadow follows the element box, not the
         glyph silhouette, so a transparent mark would cast a hard rectangle. */
      shadow: d.hero.ring === false ? undefined : '0 14px 44px rgba(0,0,0,.45)',
      rot: d.hero.rot || 0
    });
  }

  /* ---- optional underline art: a big ghost date, like the deck's mark ---- */
  if (d.ghost) {
    els.push({
      key: 'vc-ghost', type: 'text', role: 'ghost', text: d.ghost,
      x: Math.round(W * 0.32), y: Math.round(-H * 0.10),
      w: Math.round(W * 0.72), h: Math.round(H * 0.9),
      size: Math.round(H * 0.86), weight: 900, color: th.ink,
      tracking: -H * 0.04, align: 'right', lineHeight: 0.86, rot: 0,
      opacity: 0.055, sans: true, noWrap: true
    });
  }

  /* ---- channel chip, bottom-left ---- */
  if (d.channel) {
    var chH = Math.round(28 * KS);
    els.push({
      key: 'vc-channel', type: 'text', role: 'channel', text: d.channel,
      x: pad, y: H - Math.round(pad * 0.72) - chH,
      w: Math.round(460 * KX), h: chH,
      size: Math.round(22 * KS), weight: 700, color: th.ink,
      tracking: 0.5, align: 'left', lineHeight: 1.2, rot: 0,
      opacity: 0.8, sans: true, noWrap: true
    });
  }

  /* ---- bottom accent band: the colour bar that frames a thumbnail ---- */
  if (d.band) {
    /* Generous enough to survive the platform's own overlay in a feed. */
    var bh2 = Math.max(10, Math.round(16 * KS));
    els.push({
      key: 'vc-band', type: 'shape', role: 'band',
      x: 0, y: H - bh2, w: W, h: bh2,
      fill: th.accent, rot: 0, opacity: 1
    });
  }

  /* ---- diagonal accent wedge behind the headline, adds motion ---- */
  if (d.wedge) {
    els.push({
      key: 'vc-wedge', type: 'shape', role: 'wedge',
      x: 0, y: 0, w: Math.round(W * 0.06), h: H,
      fill: th.accent, rot: 0, opacity: 0.9
    });
  }

  return {
    ratio: ratio.id,
    video: true,
    theme: d.theme || 'coral',
    bg: th.bg,
    elements: els
  };
}

/**
 * Layout presets.
 *
 * Each one is a full recipe: where the headline sits, how big it gets, whether
 * the mark is a side-by-side hero or a corner badge. The GUI exposes them as
 * buttons, so a user never has to reason about coordinates.
 */
export const VIDEO_PRESETS = {
  /** Big stroked type over a flat field — the 大字报 look. */
  bigtype: {
    label: '大字报',
    hint: '暖色底 + 描边大字 + 右侧大图标',
    theme: 'coral',
    stroke: true,
    band: true,
    heroMode: 'placed',
    heroSize: 0.58,
    logoCorner: true
  },
  /** Quiet white field, huge type, a grid of logo badges. */
  minimal: {
    label: '极简',
    hint: '白底 + 粗黑大字 + 图标矩阵',
    theme: 'coral',
    stroke: false,
    band: false,
    heroMode: 'none',
    logoCorner: false
  },
  /** Dark field, high-contrast accent type. */
  dark: {
    label: '暗色',
    hint: '黑底 + 强调色大字',
    theme: 'midnight',
    stroke: true,
    band: true,
    heroMode: 'none',
    logoCorner: false
  },
  /** Portrait-first variant for vertical feeds. */
  portrait: {
    label: '竖屏',
    hint: '9:16 + 上方图标 + 下方标题',
    theme: 'midnight',
    stroke: true,
    band: true,
    heroMode: 'inline',
    heroSize: 0.34,
    logoCorner: true
  }
};

export function videoPresetOf(name) {
  return VIDEO_PRESETS[name] || VIDEO_PRESETS.bigtype;
}

/** Tone adapter so the shared renderer can paint a video scene. */
export function videoPreset(themeName) {
  var th = videoThemeOf(themeName);
  return {
    tone: themeName || 'coral',
    bg: th.bg, ink: th.ink, dim: th.dim,
    line: 'rgba(0,0,0,.14)',
    panelBg: th.panel, panelFg: th.panelFg, panelDim: th.dim,
    accent: th.accent, accentTxt: th.accent2
  };
}
