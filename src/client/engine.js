/**
 * Cover Studio — editor engine.
 *
 * Pure, framework-free logic so it can be unit-tested outside the browser:
 * scene model, snapping, alignment, history, geometry. No React, no DOM.
 */

/** Guide / selection accent. */
var ACCENT = '#e0574a';

/** Snap threshold in stage pixels. */
var SNAP_PX = 8;

/** Export ratios. `safe` is the inner margin that content should respect. */
var RATIOS = [
  { id: '16:9', w: 1920, h: 1080, safe: 64, label: '横屏' },
  { id: '9:16', w: 1080, h: 1920, safe: 96, label: '竖屏' },
  { id: '3:4', w: 1080, h: 1440, safe: 72, label: '方形' }
];

/** Cover presets: background, ink, and the stage furniture each style needs. */
var PRESETS = [
  {
    id: 'ink',
    name: '电子墨水',
    bg: '#f0eee6',
    ink: '#141413',
    accent: '#c15f3c',
    grid: false
  },
  {
    id: 'heiya',
    name: '黑鸦冲击',
    bg: '#f4e4c2',
    ink: '#141413',
    accent: '#fe0000',
    grid: true
  },
  {
    id: 'baiya',
    name: '白鸦清爽',
    bg: '#eff6ff',
    ink: '#0b2545',
    accent: '#1a4fd6',
    grid: false
  },
  {
    id: 'graphite',
    name: '石墨深色',
    bg: '#1c1c1e',
    ink: '#f2f2f3',
    accent: '#ff6b4a',
    grid: false
  }
];

function ratioOf(id) {
  for (var i = 0; i < RATIOS.length; i++) if (RATIOS[i].id === id) return RATIOS[i];
  return RATIOS[0];
}

function presetOf(id) {
  for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i];
  return PRESETS[0];
}

/** Clamp a number into [lo, hi]. */
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Round to one decimal — keeps stored geometry tidy. */
function r1(v) {
  return Math.round(v * 10) / 10;
}

/**
 * Guide lines for a stage: centre, thirds, and the safe margin on both axes.
 * @returns {{v: Array<{at:number,kind:string}>, h: Array<{at:number,kind:string}>}}
 */
function stageGuides(stage, ratioId) {
  var r = ratioOf(ratioId);
  var w = stage.w, ht = stage.h, safe = r.safe;
  return {
    v: [
      { at: w / 2, kind: 'center' },
      { at: w / 3, kind: 'third' },
      { at: (w * 2) / 3, kind: 'third' },
      { at: safe, kind: 'safe' },
      { at: w - safe, kind: 'safe' }
    ],
    h: [
      { at: ht / 2, kind: 'center' },
      { at: ht / 3, kind: 'third' },
      { at: (ht * 2) / 3, kind: 'third' },
      { at: safe, kind: 'safe' },
      { at: ht - safe, kind: 'safe' }
    ]
  };
}

/**
 * Snap a moving box against stage guides plus the edges of sibling boxes.
 * @param box  {x,y,w,h} the moving box
 * @param others  sibling boxes (already excludes the moving one)
 * @param stage   {w,h}
 * @param ratioId ratio id
 * @param enabled false suspends snapping (Alt)
 * @returns {{x:number,y:number,v:Array,h:Array}}
 */
function snapBox(box, others, stage, ratioId, enabled) {
  if (!enabled) return { x: box.x, y: box.y, v: [], h: [] };

  var g = stageGuides(stage, ratioId);
  var vLines = g.v.slice();
  var hLines = g.h.slice();

  for (var i = 0; i < others.length; i++) {
    var o = others[i];
    vLines.push({ at: o.x, kind: 'edge' });
    vLines.push({ at: o.x + o.w / 2, kind: 'edge' });
    vLines.push({ at: o.x + o.w, kind: 'edge' });
    hLines.push({ at: o.y, kind: 'edge' });
    hLines.push({ at: o.y + o.h / 2, kind: 'edge' });
    hLines.push({ at: o.y + o.h, kind: 'edge' });
  }

  var movingV = [box.x, box.x + box.w / 2, box.x + box.w];
  var movingH = [box.y, box.y + box.h / 2, box.y + box.h];

  var bestDx = null, hitV = [];
  for (var a = 0; a < movingV.length; a++) {
    for (var b = 0; b < vLines.length; b++) {
      var d = vLines[b].at - movingV[a];
      if (Math.abs(d) <= SNAP_PX) {
        if (bestDx === null || Math.abs(d) < Math.abs(bestDx)) bestDx = d;
        hitV.push(vLines[b]);
      }
    }
  }

  var bestDy = null, hitH = [];
  for (var c = 0; c < movingH.length; c++) {
    for (var e = 0; e < hLines.length; e++) {
      var dy = hLines[e].at - movingH[c];
      if (Math.abs(dy) <= SNAP_PX) {
        if (bestDy === null || Math.abs(dy) < Math.abs(bestDy)) bestDy = dy;
        hitH.push(hLines[e]);
      }
    }
  }

  return {
    x: box.x + (bestDx || 0),
    y: box.y + (bestDy || 0),
    v: hitV,
    h: hitH
  };
}

/** Bounding box of several boxes. */
function boundsOf(list) {
  if (!list.length) return null;
  var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (var i = 0; i < list.length; i++) {
    var b = list[i];
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
    x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
  }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/**
 * Align boxes within the stage.
 * @param list selected boxes
 * @param mode left|centerX|right|top|centerY|bottom|distributeX|distributeY
 * @param stage {w,h}
 * @returns array of {key,x,y}
 */
function alignBoxes(list, mode, stage) {
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

/**
 * Append-only history with a bounded depth. Every commit stores a full scene
 * snapshot; scenes are small enough that diffs are not worth the complexity.
 */
function createHistory(limit) {
  var stack = [];
  var cursor = -1;
  var max = limit || 80;

  return {
    /** Record a new state, dropping any redo tail. */
    push: function (state) {
      if (cursor < stack.length - 1) stack = stack.slice(0, cursor + 1);
      stack.push(state);
      if (stack.length > max) stack.shift();
      cursor = stack.length - 1;
    },
    canUndo: function () { return cursor > 0; },
    canRedo: function () { return cursor < stack.length - 1; },
    undo: function () {
      if (cursor <= 0) return null;
      cursor -= 1;
      return stack[cursor];
    },
    redo: function () {
      if (cursor >= stack.length - 1) return null;
      cursor += 1;
      return stack[cursor];
    },
    current: function () { return cursor >= 0 ? stack[cursor] : null; },
    size: function () { return stack.length; },
    reset: function (state) { stack = [state]; cursor = 0; }
  };
}

/** Deep-clone a scene through JSON — scenes hold only plain data. */
function cloneScene(scene) {
  return JSON.parse(JSON.stringify(scene));
}

export {
  ACCENT, SNAP_PX, RATIOS, PRESETS,
  ratioOf, presetOf, clamp, r1,
  stageGuides, snapBox, boundsOf, alignBoxes,
  createHistory, cloneScene
};
