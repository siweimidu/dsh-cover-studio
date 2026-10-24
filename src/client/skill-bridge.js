/**
 * Cover Studio — Skill bridge.
 *
 * Converts between the AI 日报 Skill's `deck-data.json` and the editor scene.
 *
 * Two directions:
 *   deckToScene  — build an editable cover from deck data (the Skill's output)
 *   sceneToDeck  — write the cover back into deck data before handing it to
 *                  scripts/build_deck.cjs
 *
 * The Skill owns the deck contract; this module only maps it. Cover fields the
 * editor cannot represent are preserved verbatim so a round-trip is lossless.
 */

/** Fixed category order — the Skill requires exactly this sequence. */
var CAT_ORDER = ['要闻', '模型发布', '开发动态', '产品应用', '技术与洞察', '行业动态'];

/** Chinese weekday names, Sunday first (matches Date.getDay()). */
var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/**
 * Parse YYYY-MM-DD without timezone drift.
 * @returns {{y:number,m:number,d:number,week:string}|null}
 */
function parseDate(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return null;
  var y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  var dt = new Date(y, mo - 1, d);
  if (isNaN(dt.getTime())) return null;
  return { y: y, m: mo, d: d, week: WEEK[dt.getDay()] };
}

/** The hard-coded page-1 subtitle required by the Skill. */
function greetingFor(iso) {
  var p = parseDate(iso);
  if (!p) return '今天是 X 月 X 日，星期 X，欢迎收看今天的 AI 快报';
  return '今天是 ' + p.m + ' 月 ' + p.d + ' 日，' + p.week + '，欢迎收看今天的 AI 快报';
}

/** Group news by the fixed category order; empty categories still get a slot. */
function groupNews(news) {
  var groups = {};
  for (var i = 0; i < CAT_ORDER.length; i++) groups[CAT_ORDER[i]] = [];
  for (var j = 0; j < (news || []).length; j++) {
    var n = news[j];
    var cat = n && n.category ? n.category : '要闻';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(n);
  }
  return groups;
}

/** Pick the cover headline: first 要闻 item, else the first item overall. */
function leadOf(news) {
  var list = news || [];
  for (var i = 0; i < list.length; i++) {
    if (list[i] && list[i].category === '要闻') return list[i];
  }
  return list[0] || null;
}

/**
 * Build an editor scene from deck data.
 * The scene is a faithful preview of page 1: date row, headline, rule, and the
 * six category cards, laid out at the Skill's real 1920×1080 metrics.
 */
function deckToScene(deck) {
  var d = deck || {};
  var elements = [];

  /* Date row */
  elements.push({
    key: 'date-row', type: 'text', role: 'date',
    text: (parseDate(d.date) ? parseDate(d.date).y + ' 年 ' + parseDate(d.date).m + ' 月 ' + parseDate(d.date).d + ' 日 · ' + parseDate(d.date).week + ' · ' : '') + (d.brandLatin || 'DAILY AI'),
    x: 116, y: 84, w: 900, h: 44,
    rot: 0, opacity: 1, size: 26, weight: 500, color: '#6b665c',
    tracking: 1, align: 'left', italic: false, locked: true
  });

  /* Headline */
  var lead = leadOf(d.news);
  var head = (d.cover && d.cover.headline) || (lead && lead.headline) || '';
  elements.push({
    key: 'headline', type: 'text', role: 'headline', text: head,
    x: 116, y: 150, w: 1400, h: 190,
    rot: 0, opacity: 1, size: 76, weight: 700, color: '#141413',
    tracking: 0, align: 'left', italic: false, locked: true
  });

  /* Category cards */
  var groups = groupNews(d.news);
  var cw = 540, ch = 190, gapX = 34, gapY = 22;
  var startX = 116, startY = 420;

  for (var i = 0; i < CAT_ORDER.length; i++) {
    var cat = CAT_ORDER[i];
    var list = groups[cat] || [];
    var col = i % 3, row = Math.floor(i / 3);
    elements.push({
      key: 'card-' + i, type: 'card', role: 'card', category: cat,
      items: list.map(function (n) {
        return { timecode: n.timecode || '', title: n.title || n.headline || '' };
      }),
      x: startX + col * (cw + gapX),
      y: startY + row * (ch + gapY),
      w: cw, h: ch,
      rot: 0, opacity: 1, locked: true
    });
  }

  /* Bottom caption — the hard rule */
  elements.push({
    key: 'caption', type: 'text', role: 'caption', text: greetingFor(d.date),
    x: 260, y: 962, w: 1400, h: 56,
    rot: 0, opacity: 1, size: 34, weight: 400, color: '#141413',
    tracking: 0, align: 'center', italic: false, locked: true
  });

  return {
    ratio: '16:9',
    preset: d.tone === 'ink' ? 'graphite' : 'ink',
    bg: d.tone === 'ink' ? '#141413' : '#f0eee6',
    deck: d,
    elements: elements
  };
}

/**
 * Write the editable cover fields back into deck data.
 * Only the fields the editor owns are touched; everything else is preserved.
 */
function sceneToDeck(scene) {
  var deck = JSON.parse(JSON.stringify(scene.deck || {}));
  var els = scene.elements || [];

  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.role === 'headline') {
      if (!deck.cover) deck.cover = {};
      deck.cover.headline = el.text || '';
    }
    if (el.role === 'date' && el.text) {
      /* The date row is derived; only the brand Latin part is authored. */
      var parts = String(el.text).split(' · ');
      if (parts.length >= 3) deck.brandLatin = parts[parts.length - 1];
    }
    if (el.role === 'card' && el.category) {
      /* Card item edits map back onto the news entries of that category. */
      var news = deck.news || [];
      var idx = 0;
      for (var j = 0; j < news.length; j++) {
        if (news[j] && news[j].category === el.category) {
          if (el.items && el.items[idx]) {
            news[j].timecode = el.items[idx].timecode;
            news[j].title = el.items[idx].title;
          }
          idx++;
        }
      }
      deck.news = news;
    }
  }

  return deck;
}

export {
  CAT_ORDER, WEEK,
  parseDate, greetingFor, groupNews, leadOf,
  deckToScene, sceneToDeck
};
