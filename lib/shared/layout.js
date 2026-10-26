/**
 * @local/dsh-cover-studio — Shared layout engine.
 *
 * Pure functions only: no DOM, no React, no Node APIs. Both the browser
 * editor (lib/client.js) and the CLI (lib/cli.js) import the same maths from
 * here, so a layout produced on the command line is byte-identical to one
 * produced by dragging.
 *
 * All coordinates are stage pixels (1920x1080 by default).
 */

/** Stage presets. `safe` is the inner margin content should respect. */
export const RATIOS = [
  { id: '16:9', w: 1920, h: 1080, safe: 64, label: '横屏' },
  { id: '4:3', w: 1440, h: 1080, safe: 72, label: '横屏 4:3' },
  { id: '1:1', w: 1080, h: 1080, safe: 80, label: '正方形' },
  { id: '9:16', w: 1080, h: 1920, safe: 96, label: '竖屏' },
  { id: '3:4', w: 1080, h: 1440, safe: 72, label: '竖屏 3:4' }
];

export function ratioOf(id) {
  for (var i = 0; i < RATIOS.length; i++) if (RATIOS[i].id === id) return RATIOS[i];
  return RATIOS[0];
}

/** Round to one decimal, the precision the editor stores. */
function r1(n) { return Math.round(n * 10) / 10; }


/** ---- boundsOf ---- */
export function boundsOf(list) {
          if (!list.length) return null;
          var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
          for (var i = 0; i < list.length; i++) {
            var b = list[i];
            x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
            x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
          }
          return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        }

/** ---- alignBoxes ---- */
export function alignBoxes(list, mode, stage) {
          if (!list.length) return [];
          var out = [];
          var i, b;

          if (mode === 'distributeX' || mode === 'distributeY') {
            if (list.length < 3) return [];
            var horiz = mode === 'distributeX';
            var sorted = list.slice().sort(function (p, q) {
              return horiz ? p.x - q.x : p.y - q.y;
            });
            var first = sorted[0], last = sorted[sorted.length - 1];
            var totalSpan = horiz
              ? (last.x + last.w) - first.x
              : (last.y + last.h) - first.y;
            var used = 0;
            for (i = 0; i < sorted.length; i++) used += horiz ? sorted[i].w : sorted[i].h;
            var gap = (totalSpan - used) / (sorted.length - 1);
            var cursor = horiz ? first.x : first.y;
            for (i = 0; i < sorted.length; i++) {
              var s = sorted[i];
              out.push({
                key: s.key,
                x: horiz ? r1(cursor) : s.x,
                y: horiz ? s.y : r1(cursor)
              });
              cursor += (horiz ? s.w : s.h) + gap;
            }
            return out;
          }

          var group = boundsOf(list);
          for (i = 0; i < list.length; i++) {
            b = list[i];
            var nx = b.x, ny = b.y;
            if (mode === 'left') nx = 0;
            else if (mode === 'centerX') nx = (stage.w - b.w) / 2;
            else if (mode === 'right') nx = stage.w - b.w;
            else if (mode === 'top') ny = 0;
            else if (mode === 'centerY') ny = (stage.h - b.h) / 2;
            else if (mode === 'bottom') ny = stage.h - b.h;
            out.push({ key: b.key, x: r1(nx), y: r1(ny) });
          }
          return out;
        }

/** ---- gridArrange ---- */
export function gridArrange(list, cols, gap, stage, origin) {
          if (!list.length) return [];

          /* Reading order: top-to-bottom, then left-to-right. */
          var sorted = list.slice().sort(function (a, b) {
            var rowA = Math.round(a.y / 40), rowB = Math.round(b.y / 40);
            if (rowA !== rowB) return rowA - rowB;
            return a.x - b.x;
          });

          var n = sorted.length;
          var c = cols && cols > 0 ? Math.min(cols, n) : Math.ceil(Math.sqrt(n));
          var rows = Math.ceil(n / c);

          var cellW = 0, cellH = 0;
          for (var i = 0; i < n; i++) {
            cellW = Math.max(cellW, sorted[i].w);
            cellH = Math.max(cellH, sorted[i].h);
          }

          var totalW = c * cellW + (c - 1) * gap;
          var totalH = rows * cellH + (rows - 1) * gap;

          var startX = origin ? origin.x : Math.round((stage.w - totalW) / 2);
          var startY = origin ? origin.y : Math.round((stage.h - totalH) / 2);

          var out = [];
          for (var k = 0; k < n; k++) {
            var col = k % c;
            var row = Math.floor(k / c);
            var box = sorted[k];
            /* Centre each element inside its cell so mixed sizes stay balanced. */
            out.push({
              key: box.key,
              x: r1(startX + col * (cellW + gap) + (cellW - box.w) / 2),
              y: r1(startY + row * (cellH + gap) + (cellH - box.h) / 2)
            });
          }
          return out;
        }

/** ---- scatterArrange ---- */
export function scatterArrange(list, opts) {
          if (!list || !list.length) return [];
          var o = opts || {};
          var area = o.area || { x: 0, y: 0, w: 1920, h: 1080 };
          var shapes = (o.shapes && o.shapes.length)
            ? o.shapes
            : ['square', 'rect', 'circle', 'diamond'];
          var n = list.length;
          var jitter = o.jitter === undefined ? 0.3 : o.jitter;
          var rotateMax = o.rotate === undefined ? 12 : o.rotate;

          var cols = Math.max(1, Math.ceil(Math.sqrt(n * (area.w / Math.max(1, area.h)))));
          var rows = Math.max(1, Math.ceil(n / cols));
          var cellW = area.w / cols;
          var cellH = area.h / rows;
          var base = o.size && o.size > 0
            ? o.size
            : Math.min(cellW, cellH) * 0.7;

          var seed = 2166136261;
          for (var si = 0; si < n; si++) {
            var k = String(list[si].key || si);
            for (var ci = 0; ci < k.length; ci++) {
              seed ^= k.charCodeAt(ci);
              seed = (seed * 16777619) >>> 0;
            }
          }
          function rnd() {
            seed ^= seed << 13; seed >>>= 0;
            seed ^= seed >> 17;
            seed ^= seed << 5; seed >>>= 0;
            return seed / 4294967296;
          }

          var order = list.slice();
          for (var oi = order.length - 1; oi > 0; oi--) {
            var oj = Math.floor(rnd() * (oi + 1));
            var ot = order[oi]; order[oi] = order[oj]; order[oj] = ot;
          }

          var out = [];
          for (var idx = 0; idx < order.length; idx++) {
            var item = order[idx];
            var shape = shapes[idx % shapes.length];

            var w = base, h = base;
            if (shape === 'rect') { w = base * 1.5; h = base * 0.72; }
            else if (shape === 'circle') { w = base * 0.92; h = base * 0.92; }
            else if (shape === 'diamond') { w = base * 1.02; h = base * 1.02; }

            var col = idx % cols;
            var row = Math.floor(idx / cols);
            var cx = area.x + (col + 0.5) * cellW;
            var cy = area.y + (row + 0.5) * cellH;

            var roomX = Math.max(0, (cellW - w) / 2) * jitter;
            var roomY = Math.max(0, (cellH - h) / 2) * jitter;
            cx += (rnd() * 2 - 1) * roomX;
            cy += (rnd() * 2 - 1) * roomY;

            var rot = 0;
            if (shape === 'diamond') rot = 45;
            else if (rotateMax > 0) rot = Math.round((rnd() * 2 - 1) * rotateMax);

            out.push({
              key: item.key,
              x: Math.round(cx - w / 2),
              y: Math.round(cy - h / 2),
              w: Math.round(w),
              h: Math.round(h),
              rot: rot,
              shape: shape
            });
          }
          return out;
        }
