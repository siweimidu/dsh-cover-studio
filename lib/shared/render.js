/**
 * @local/dsh-cover-studio — Static HTML renderer.
 *
 * Turns a scene (the element list produced by shared/scene.js) into one
 * self-contained HTML file: no scripts, no external assets, deterministic
 * layout. That file is what the CLI exports, what the headless screenshot
 * step rasterises, and what a user can open in any browser.
 *
 * The CSS values here are copied from the AI 日报 Skill's own stylesheet, so a
 * page rendered by this module is visually identical to the Skill's output.
 */

const SERIF = "'Noto Serif SC','Source Han Serif SC',Georgia,serif";
const DISPLAY = "'Playfair Display','Noto Serif SC',Georgia,serif";
const SANS = "'Noto Sans SC',system-ui,sans-serif";
const MONO = "'IBM Plex Mono','JetBrains Mono',Consolas,monospace";

/** Escape text for HTML text nodes and attribute values. */
export function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function px(n) { return Math.round(Number(n || 0) * 100) / 100; }

function fontOf(el) {
  if (el.serif) return SERIF;
  if (el.mono) return MONO;
  if (el.display) return DISPLAY;
  if (el.sans) return SANS;
  return SERIF;   /* the Skill's default for body copy is the serif stack */
}

/** Inline style for one text element. */
function textStyle(el) {
  const s = [
    'position:absolute',
    'left:' + px(el.x) + 'px',
    'top:' + px(el.y) + 'px',
    'width:' + px(el.w) + 'px',
    'height:' + px(el.h) + 'px'
  ];
  if (el.opacity !== undefined && el.opacity !== 1) s.push('opacity:' + el.opacity);
  if (el.rot) s.push('transform:rotate(' + el.rot + 'deg)');
  s.push('font-family:' + fontOf(el));
  s.push('font-size:' + px(el.size || 32) + 'px');
  s.push('font-weight:' + (el.weight || 400));
  s.push('line-height:' + (el.lineHeight || 1.2));
  if (el.tracking) s.push('letter-spacing:' + px(el.tracking) + 'px');
  s.push('color:' + (el.color || '#141413'));
  s.push('text-align:' + (el.align || 'left'));
  if (el.italic) s.push('font-style:italic');
  if (el.noWrap) s.push('white-space:nowrap');
  if (el.uppercase) s.push('text-transform:uppercase');
  return s.join(';');
}

/** A filled rectangle or hairline. */
function shapeHtml(el) {
  const s = [
    'position:absolute',
    'left:' + px(el.x) + 'px',
    'top:' + px(el.y) + 'px',
    'width:' + px(el.w) + 'px',
    'height:' + px(el.h) + 'px',
    'background:' + (el.fill || el.bgFill || el.color || '#141413')
  ];
  if (el.opacity !== undefined && el.opacity !== 1) s.push('opacity:' + el.opacity);
  if (el.rot) s.push('transform:rotate(' + el.rot + 'deg)');
  if (el.radius) s.push('border-radius:' + px(el.radius) + 'px');
  return '<div style="' + s.join(';') + '"></div>';
}

/** The Skill's category card: hairline border, 3px accent bar, serif heading. */
function cardHtml(el, preset) {
  const ink = preset.ink;
  const nameSize = el.nameSize || 34;
  const itemSize = el.itemSize || 24;
  const lh = el.itemLineHeight || 1.46;
  const gap = el.listGap === undefined ? 8 : el.listGap;
  const accent = el.accentBar || preset.accent || '#c15f3c';

  const items = (el.items || []).map(function (it) {
    return '<div class="li">'
      + '<span class="tc">' + esc(it.timecode || '') + '</span>'
      + '<span class="tx">' + esc(it.title || '') + '</span>'
      + '</div>';
  }).join('');

  const count = el.countText === undefined
    ? String((el.items || []).length).padStart(2, '0')
    : el.countText;

  const box = [
    'position:absolute',
    'left:' + px(el.x) + 'px',
    'top:' + px(el.y) + 'px',
    'width:' + px(el.w) + 'px',
    'height:' + px(el.h) + 'px',
    'border:1px solid rgba(20,20,19,.28)',
    'padding:16px 20px 18px',
    'box-sizing:border-box',
    'display:flex',
    'flex-direction:column',
    'min-width:0',
    'overflow:hidden',
    'background:color-mix(in srgb,' + preset.bg + ' 60%,transparent)'
  ];
  if (el.opacity !== undefined && el.opacity !== 1) box.push('opacity:' + el.opacity);

  return '<div style="' + box.join(';') + '">'
    + '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:' + accent + '"></div>'
    + '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;'
    + 'margin-bottom:9px;padding-bottom:8px;border-bottom:1px solid rgba(20,20,19,.14)">'
    + '<span style="font-family:' + SERIF + ';font-weight:700;font-size:' + nameSize + 'px;'
    + 'line-height:1.1;letter-spacing:.01em;color:' + ink + '">' + esc(el.category || '') + '</span>'
    + '<span style="font-family:' + DISPLAY + ';font-style:italic;font-size:17px;font-weight:700;'
    + 'color:' + accent + ';opacity:.9">' + esc(count) + '</span>'
    + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:' + gap + 'px;padding-top:2px;'
    + 'justify-content:flex-start;flex:1 1 auto;min-width:0">'
    + (el.items || []).map(function (it) {
        return '<div style="display:flex;gap:11px;align-items:baseline;font-size:' + itemSize + 'px;'
          + 'line-height:' + lh + ';opacity:.9;min-width:0">'
          + '<span style="flex:none;font-family:' + MONO + ';font-size:17px;letter-spacing:.02em;'
          + 'color:' + (preset.dim || '#6b665c') + ';opacity:.85">' + esc(it.timecode || '') + '</span>'
          + '<span style="flex:1;min-width:0">' + esc(it.title || '') + '</span>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>';
}

/** A caption plate: ink banner, serif text, centred. */
function captionHtml(el) {
  const box = [
    'position:absolute',
    'left:' + px(el.x) + 'px',
    'top:' + px(el.y) + 'px',
    'width:' + px(el.w) + 'px',
    'height:' + px(el.h) + 'px',
    'background:' + (el.bgFill || '#141413'),
    'color:' + (el.color || '#f0eee6'),
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'padding:0 44px',
    'box-sizing:border-box',
    'border-radius:2px',
    'overflow:hidden'
  ];
  if (el.opacity !== undefined && el.opacity !== 1) box.push('opacity:' + el.opacity);
  return '<div style="' + box.join(';') + '">'
    + '<span style="font-family:' + SERIF + ';font-weight:' + (el.weight || 600) + ';'
    + 'font-size:' + px(el.size || 30) + 'px;line-height:' + (el.lineHeight || 1.3) + ';'
    + 'letter-spacing:' + px((el.tracking || 0) * 0.01) + 'em;white-space:nowrap">'
    + esc(el.text || '') + '</span></div>';
}

/** A progress strip with its segments. */
function stripHtml(el, preset) {
  const news = (el.segments || []);
  const box = [
    'position:absolute',
    'left:' + px(el.x) + 'px',
    'top:' + px(el.y) + 'px',
    'width:' + px(el.w) + 'px',
    'height:' + px(el.h) + 'px',
    'display:flex',
    'border-top:1px solid rgba(20,20,19,.28)',
    'border-bottom:1px solid rgba(20,20,19,.28)',
    'box-sizing:border-box'
  ];
  const segs = news.map(function (s, i) {
    const on = i === (el.active || 0);
    const style = 'flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;'
      + 'padding:0 10px;font-family:' + SANS + ';font-size:16px;font-weight:600;letter-spacing:.02em;'
      + 'border-left:1px solid rgba(20,20,19,.14);white-space:nowrap;overflow:hidden'
      + (on ? ';background:' + (preset.accent || '#c15f3c') + ';color:#fdf6f0' : ';color:' + preset.ink);
    return '<div style="' + style + '">' + esc(s) + '</div>';
  }).join('');
  return '<div style="' + box.join(';') + '">' + segs + '</div>';
}

/** One element → one HTML node. */
export function elementHtml(el, preset) {
  if (!el) return '';
  if (el.type === 'shape') return shapeHtml(el);
  if (el.type === 'card') return cardHtml(el, preset);
  if (el.type === 'caption') return captionHtml(el);
  if (el.type === 'strip') return stripHtml(el, preset);
  if (el.type === 'image') {
    return '<img src="' + esc(el.src || '') + '" style="position:absolute;'
      + 'left:' + px(el.x) + 'px;top:' + px(el.y) + 'px;'
      + 'width:' + px(el.w) + 'px;height:' + px(el.h) + 'px;object-fit:cover">';
  }
  if (el.type === 'logo') {
    return '<img src="' + esc(el.src || '') + '" style="position:absolute;'
      + 'left:' + px(el.x) + 'px;top:' + px(el.y) + 'px;'
      + 'width:' + px(el.w) + 'px;height:' + px(el.h) + 'px;object-fit:contain">';
  }
  if (el.type === 'bullets') {
    const lines = String(el.text || '').split('\n').filter(function (t) { return t.trim(); });
    return '<div style="' + textStyle(el) + '">'
      + lines.map(function (t) {
          return '<div style="display:flex;gap:12px;align-items:baseline">'
            + '<span style="flex:none;width:5px;height:5px;border-radius:50%;background:'
            + (el.color || '#141413') + ';opacity:.55"></span>'
            + '<span style="flex:1;min-width:0">' + esc(t) + '</span></div>';
        }).join('')
      + '</div>';
  }
  if (el.type === 'metric') {
    const p = String(el.text || '').split('|');
    return '<div style="' + textStyle(el) + ';display:flex;flex-direction:column;'
      + 'justify-content:center">'
      + '<div style="display:flex;align-items:baseline;gap:4px;white-space:nowrap">'
      + '<span>' + esc(p[0] || '0') + '</span>'
      + (p[1] ? '<span style="font-size:26px;font-weight:500;opacity:.72">' + esc(p[1]) + '</span>' : '')
      + '</div>'
      + (p[2] ? '<div style="margin-top:10px;font-family:' + MONO + ';font-size:15px;'
          + 'letter-spacing:.26em;opacity:.62;white-space:nowrap">' + esc(p[2]) + '</div>' : '')
      + '</div>';
  }
  return '<div style="' + textStyle(el) + '">'
    + esc(el.text || '').replace(/\n/g, '<br>') + '</div>';
}

/**
 * Render one page.
 *
 * @param scene  { bg, ratio, elements }
 * @param preset tone preset from shared/scene.js
 * @param opts   { width, height, title }
 * @returns a complete HTML document as a string
 */
export function renderPage(scene, preset, opts) {
  const o = opts || {};
  const w = o.width || 1920;
  const h = o.height || 1080;
  const body = (scene.elements || []).map(function (el) {
    return elementHtml(el, preset);
  }).join('\n');

  return '<!DOCTYPE html>\n<html lang="zh-CN"><head><meta charset="utf-8">'
    + '<title>' + esc(o.title || 'AI 日报') + '</title>'
    + '<style>'
    + '*{margin:0;padding:0;box-sizing:border-box}'
    + 'html,body{background:' + (preset.bg || '#f0eee6') + '}'
    + '.stage{position:relative;width:' + w + 'px;height:' + h + 'px;overflow:hidden;'
    + 'background:' + (preset.bg || '#f0eee6') + ';color:' + (preset.ink || '#141413') + '}'
    + '</style></head><body>'
    + '<div class="stage">' + body + '</div>'
    + '</body></html>';
}

/** Render several pages into one scrolling document. */
export function renderDeck(pages, preset, opts) {
  const o = opts || {};
  const w = o.width || 1920;
  const h = o.height || 1080;
  const bodies = pages.map(function (pg, i) {
    const inner = (pg.elements || []).map(function (el) {
      return elementHtml(el, preset);
    }).join('\n');
    return '<section class="stage" id="p' + (i + 1) + '" style="margin:0 auto ' + (o.gap || 24) + 'px">'
      + inner + '</section>';
  }).join('\n');

  return '<!DOCTYPE html>\n<html lang="zh-CN"><head><meta charset="utf-8">'
    + '<title>' + esc(o.title || 'AI 日报') + '</title>'
    + '<style>'
    + '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{background:#1b1b1c;padding:' + (o.pad || 24) + 'px 0}'
    + '.stage{position:relative;width:' + w + 'px;height:' + h + 'px;overflow:hidden;'
    + 'background:' + (preset.bg || '#f0eee6') + ';color:' + (preset.ink || '#141413') + '}'
    + '</style></head><body>' + bodies + '</body></html>';
}
