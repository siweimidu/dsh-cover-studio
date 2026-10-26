/**
 * @local/dsh-cover-studio — Scene builders.
 *
 * Turn a deck (the Skill's deck-data shape) into a flat element list the
 * renderer can paint. Pure: every input is a parameter, nothing is read from
 * the DOM or from module state, so the CLI and the editor produce the same
 * geometry for the same deck.
 */

/** Tone presets the Skill defines. */
export const TONES = {
  paper: {
    tone: 'paper', bg: '#f0eee6', ink: '#141413', dim: '#6b665c',
    line: 'rgba(20,20,19,.14)', panelBg: '#141413', panelFg: '#f0eee6',
    panelDim: 'rgba(240,238,230,.58)', accent: '#c15f3c', accentTxt: '#c15f3c'
  },
  ink: {
    tone: 'ink', bg: '#141413', ink: '#f0eee6', dim: '#8f8b82',
    line: 'rgba(240,238,230,.16)', panelBg: '#f0eee6', panelFg: '#141413',
    panelDim: 'rgba(20,20,19,.58)', accent: '#c15f3c', accentTxt: '#e0895f'
  }
};

export function toneOf(name) {
  return TONES[name] || TONES.paper;
}

export function deckToScene(deck, stage) {
  /* The layout was authored for 1920x1080. Every other ratio reuses the same
     geometry, scaled by the width and anchored to the same bottom margins, so
     a 1:1 or 4:3 board keeps the Skill's proportions instead of overflowing. */
  var STAGE_W = (stage && stage.w) || 1920;
  var STAGE_H = (stage && stage.h) || 1080;
  var KX = STAGE_W / 1920;
  var KY = STAGE_H / 1080;
  /* Type scales with the shorter edge, not the height: a 9:16 board is
     narrower than 16:9, so scaling glyphs by KY made the headline huge and
     forced the cards to wrap into unreadable columns. */
  var KS = Math.min(KX, KY);

          var d = deck || {};
          var els = [];
          var PADX = 116 * KX;
          /* .cover .slide__inner overrides the global --pad-t with 72px. */
          var PADT = 72 * KY;
          var INK = d.tone === 'ink' ? '#f0eee6' : '#141413';
          var DIM = d.tone === 'ink' ? '#8f8b82' : '#6b665c';
          var PANEL_BG = d.tone === 'ink' ? '#f0eee6' : '#141413';
          var PANEL_FG = d.tone === 'ink' ? '#141413' : '#f0eee6';
          var PANEL_DIM = d.tone === 'ink' ? 'rgba(20,20,19,.58)' : 'rgba(240,238,230,.58)';
          var ACCENT = '#c15f3c';
          var ACCENT_TXT = d.tone === 'ink' ? '#e0895f' : '#c15f3c';

          var dotDate = String(d.date || '').replace(/-/g, '.');
          var brand = d.brand || 'AI 日报';
          var brandLatin = d.brandLatin || 'DAILY AI';
          var c = d.cover || {};

          /* .cover__hello shows the lead 要闻 headline, as the Skill does. */
          var lead = null;
          for (var li = 0; li < (d.news || []).length; li++) {
            if (d.news[li] && d.news[li].category === '要闻') { lead = d.news[li]; break; }
          }
          if (!lead && (d.news || []).length) lead = d.news[0];
          var title = c.headline || c.title || (lead ? (lead.headline || lead.title) : '') || '';

          /* .cover__meta-row date parts: 10 月 23 日 / 星期五 */
          var cd = (function () {
            var raw = String(d.date || '');
            var mm = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            var wk = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
            if (!mm) return { cn: raw, week: '' };
            var dt = new Date(+mm[1], +mm[2] - 1, +mm[3]);
            return { cn: (+mm[2]) + ' 月 ' + (+mm[3]) + ' 日', week: wk[dt.getDay()] || '' };
          })();

          /* .cover__mark — right:24 top:44, display 900, 300px/.86, opacity .038 */
          els.push({
            key: 'cover-mark', type: 'text', role: 'mark',
            text: dotDate.slice(5),
            /* Measured: the reference glyph tops land at y=0 (the 300px
               Playfair ascender overflows its 44px box). Shift up so the
               rendered pixels start where the reference does. */
            x: STAGE_W - (24 + 680) * KX, y: -29 * KY, w: 680 * KX, h: 260 * KY,
            size: 300 * KS, weight: 900, color: INK,
            tracking: -12, align: 'right', lineHeight: 0.86, rot: 0, opacity: 0.038,
            display: true, noWrap: true
          });

          /* .chrome__l — mono 18px, ls .18em, dim */
          els.push({
            key: 'cover-chrome', type: 'text', role: 'chrome',
            text: brand + ' · ' + brandLatin + '  ——  ' + dotDate,
            x: PADX, y: PADT, w: 1688 * KX, h: 26 * KY,
            size: 18 * KS, weight: 700, color: DIM,
            tracking: 3.24, align: 'left', lineHeight: 1, rot: 0, opacity: 1,
            mono: true
          });

          /* .cover__meta-row — mono 17px, ls .2em; square + date + weekday + latin */
          /* Measured from the reference: .slide__inner padding-top 64 +
             .chrome height 26 + .body padding-top 38 puts the meta row at
             y=128; its 18px margin-top is already inside that padding. */
          /* Measured from the reference render: meta row box starts at 128. */
          var metaY = 128 * KY;
          els.push({
            key: 'cover-sq', type: 'shape', role: 'sq',
            x: PADX, y: metaY + 5, w: 9, h: 9,
            fill: INK, rot: 0, opacity: 1
          });
          els.push({
            key: 'cover-eyebrow', type: 'text', role: 'metarow',
            text: cd.cn + ' · ' + cd.week + ' · ' + brandLatin,
            x: PADX + 9 + 22, y: metaY, w: 1200 * KX, h: 24 * KY,
            size: 17 * KS, weight: 400, color: DIM,
            tracking: 3.4, align: 'left', lineHeight: 1, rot: 0, opacity: 1,
            mono: true
          });

          /* .cover__hello — serif 700, 76px/1.2, ls -.018em; dense (>12) → 60px */
          var dense = (d.news || []).length > 12;
          var helloSize = (dense ? 60 : 76) * KS;
          /* .cover__hello margin-top 24 from the meta row (17px line). */
          var helloY = 172 * KY;
          /* The title wraps differently at each ratio, so its box height is
             derived from the glyph count and the available width. A fixed 96px
             made the rule — and every card below it — overlap the second line
             at 4:3 and 1:1. */
          var titleW = 1620 * KX;
          /* CJK glyphs are ~1em wide, Latin/digits ~0.55em. The reference
             render puts the rule at y=268 with a 76px title on one line, so the
             baseline is that measured value and only *extra* lines push it
             further down — this keeps 16:9 pixel-identical while 4:3 and 1:1
             grow correctly when the title wraps. */
          var emWidth = 0;
          for (var ti2 = 0; ti2 < String(title || '').length; ti2++) {
            var code = String(title).charCodeAt(ti2);
            emWidth += (code > 0x2e80) ? 1 : 0.55;
          }
          var linesUsed = Math.max(1, Math.ceil(emWidth * helloSize / titleW));
          var extraLines = Math.max(0, linesUsed - 1);
          var titleH = Math.round(helloSize * 1.2 * linesUsed + 8);
          var ruleY = 268 * KY + extraLines * helloSize * 1.2;
          els.push({
            key: 'cover-title', type: 'text', role: 'title', text: title,
            x: PADX, y: helloY, w: titleW, h: titleH,
            size: helloSize, weight: 700, color: INK,
            tracking: -(helloSize * 0.018), align: 'left',
            lineHeight: 1.2, rot: 0, opacity: 1, serif: true
          });

          /* .cover__rule — 1px, opacity .24 */
          els.push({
            key: 'cover-rule', type: 'shape', role: 'rule',
            x: PADX, y: ruleY, w: 1688 * KX, h: 1,
            fill: INK, opacity: 0.24, rot: 0
          });

          /* .cover__cards — 3-col grid, gap 16, clipped above the footer */
          var CAT_ORDER = ['要闻', '模型发布', '开发动态', '产品应用', '技术与洞察', '行业动态'];
          var catGroups = {};
          (d.news || []).forEach(function (n) {
            var cat = (n && n.category) || '未分类';
            if (!catGroups[cat]) catGroups[cat] = [];
            catGroups[cat].push(n);
            if (CAT_ORDER.indexOf(cat) < 0) CAT_ORDER.push(cat);
          });
          /* Measured: the first card border is at y=439; the gap from the rule
             is produced by .cover__viewport's flex sizing, not a margin. */
          /* Measured from the reference: rows are 370px tall with a 13px gap. */
          /* .cover__viewport margin-top 14 puts the first card border at
             ruleY + 14. Row heights come from the measured reference. */
          /* The card grid starts just under the rule, wherever that landed. */
          var gridTop = ruleY + 14 * KY;
          var gridBottom = STAGE_H - (204 + 20) * KY;
          var gapX = 16;
          var gapY = (dense ? 12 : 16) * KY;
          var cardW = Math.floor((1688 * KX - gapX * 2) / 3);
          var rows = Math.ceil(Math.max(1, CAT_ORDER.length) / 3);

          /* Row heights are derived from the space that is actually left
             between the rule and the caption band, not fixed at the 1080p
             reference values — those overflowed the caption at 4:3 and 1:1.
             At 16:9 the arithmetic lands back on the measured 157 / 370. */
          var avail = Math.max(120, gridBottom - gridTop - gapY * (rows - 1));
          var firstRowShare = 0.30;              /* row 1 is clipped by design */
          var cardH = Math.round(
            rows === 1 ? avail : (avail - Math.round(avail * firstRowShare)) / (rows - 1)
          );
          var rowVisible = [Math.round(avail * firstRowShare), cardH, cardH];
          CAT_ORDER.forEach(function (cat, ci2) {
            var list = catGroups[cat] || [];
            if (!list.length && !(d.news || []).length) return;
            var col = ci2 % 3, row = Math.floor(ci2 / 3);
            els.push({
              key: 'cover-card-' + ci2, type: 'card', role: 'card',
              category: cat,
              items: list.map(function (n) {
                return { timecode: n.timecode || '', title: n.headline || n.title || '' };
              }),
              x: PADX + col * (cardW + gapX),
              y: gridTop + (row === 0 ? 0 : (rowVisible[0] + gapY) + (row - 1) * (cardH + gapY)),
              w: cardW, h: (row === 0 ? rowVisible[0] : cardH),
              rot: 0, opacity: 1,
              nameSize: (dense ? 30 : 34) * KS,
              countSize: 17 * KS, itemSize: 24 * KS,
              itemLineHeight: dense ? 1.4 : 1.46,
              listGap: dense ? 6 : 8,
              borderColor: 'rgba(20,20,19,.28)',
              accentBar: ACCENT,
              accentW: 3,
              padTop: 16, padX: 20, padBottom: 18,
              headerGap: 9, headerPadB: 8
            });
          });

          /* .caption — bottom var(--cap-b)=116, height 62, radius 2, padding 0 44 */
          var capText = c.caption
            ? String(c.caption).replace(/[。．.]$/, '')
            : (cd.cn ? ('今天是 ' + cd.cn + '，' + cd.week + '，欢迎收看今天的 AI 快报') : '');
          if (capText) {
            /* Measured at 1920: 817px for the 31-character greeting at 30px
               serif. Both the per-glyph width and the 1640px cap scale with the
               board, otherwise a 1080-wide portrait page gets a plate that is
               wider than the page itself. */
            /* Width from the glyphs themselves: CJK ~1em, Latin ~0.55em, at
               the caption's own font size. */
            var capSize = 30 * KS;
            var capEm = 0;
            for (var ci3 = 0; ci3 < capText.length; ci3++) {
              capEm += (capText.charCodeAt(ci3) > 0x2e80) ? 1 : 0.55;
            }
            var capMax = 1640 * KX;
            var capW = Math.min(capMax, Math.round(capEm * capSize + 88 * KX));
            var capY = 902 * KY;
            var capX = Math.round((STAGE_W - capW) / 2);
            els.push({
              key: 'cover-cap-bg', type: 'shape', role: 'caption-bg',
              x: capX, y: capY, w: capW, h: 62 * KS,
              fill: PANEL_BG, rot: 0, opacity: 1
            });
            els.push({
              key: 'cover-cap', type: 'text', role: 'caption', text: capText,
              x: capX + 44, y: capY, w: capW - 88 * KX, h: 62 * KY,
              size: capSize, weight: 600, color: PANEL_FG,
              tracking: 0.3, align: 'center', lineHeight: 1.3, rot: 0, opacity: 1,
              serif: true
            });
          }

          return {
            ratio: '16:9',
            preset: d.tone === 'ink' ? 'graphite-ink' : 'claude-paper',
            bg: d.tone === 'ink' ? '#141413' : '#f0eee6',
            deck: d,
            elements: els
          };
        }

export function buildPageElements(pageIndex, deck, preset) {
        var news = (deck && deck.news) ? deck.news : [];
        var PADX = 116 * KX;
        var PADT = 64;
        var BODY_W = 1920 - PADX * 2;

        if (pageIndex > 0 && pageIndex <= news.length) {
          var n = news[pageIndex - 1];
          var els = [];

          /* Eyebrow: index · timecode · category, one mono line. */
          els.push({
            key: 'pg-eyebrow', type: 'text', role: 'category',
            text: [String(pageIndex).padStart(2, '0'), n.timecode || '', n.category || '']
              .filter(Boolean).join('   '),
            x: PADX, y: PADT + 38, w: BODY_W, h: 30,
            size: 19, weight: 500, color: preset.accent || '#c15f3c',
            tracking: 5, align: 'left', lineHeight: 1.2, rot: 0, opacity: 1, mono: true
          });

          /* Accent bar: 88 x 5, sits between eyebrow and title. */
          els.push({
            key: 'pg-bar', type: 'shape', role: 'bar',
            x: PADX, y: PADT + 38 + 44, w: 88, h: 5,
            fill: preset.accent || '#c15f3c',
            rot: 0, opacity: 1
          });

          var titleY = PADT + 38 + 44 + 33;
          var title = n.headline || n.title || '';
          var hasMetrics = !!(n.metrics && n.metrics.length);
          var hasBullets = !!(n.bullets && n.bullets.length);
          var summaryText = String(n.summary || '').trim();

          /* n5 body is a 2-col grid: text column then the metrics block,
             separated by 48px. Real width = body - metrics - gap. */
          var METRICS_W = 820;
          var titleW = hasMetrics ? (BODY_W - METRICS_W - 48) : BODY_W;

          /* Title size shrinks with the available column so a long headline
             does not wrap to four lines and crash into the metrics. */
          var baseSize = hasMetrics ? 80 : (hasBullets ? 88 : 104);
          if (hasMetrics && title.length > 12) {
            baseSize = Math.max(52, Math.round(baseSize * Math.min(1, 12 / title.length + 0.35)));
          }

          els.push({
            key: 'pg-hd', type: 'text', role: 'headline', text: title,
            x: PADX, y: titleY, w: titleW, h: hasMetrics ? 24 : 0,
            size: baseSize,
            weight: 700, color: preset.ink, tracking: 0, align: 'left',
            lineHeight: 1.16, rot: 0, opacity: 1, serif: true
          });
          /* Height is content-driven; give it a sane box for dragging. */
          els[els.length - 1].h = hasMetrics ? 240 : 260;

          /* Hairline rule under the title. */
          els.push({
            key: 'pg-rule', type: 'shape', role: 'rule',
            x: PADX, y: titleY + (hasMetrics ? 260 : 290), w: titleW, h: 1,
            fill: preset.ink, opacity: 0.22,
            rot: 0
          });

          var curY = titleY + (hasMetrics ? 300 : 330);

          if (summaryText) {
            var sumSize = hasBullets ? 23 : 31;
            var sumLH = hasBullets ? 1.5 : 1.74;
            var sumW = Math.min(1180, BODY_W);
            /* Estimate the wrapped line count so the box hugs its text: a
               fixed 150px box swallowed the bullets below it when the summary
               was only one line. */
            var perLine = Math.max(1, Math.floor(sumW / (sumSize * 1.02)));
            var lines = Math.ceil(summaryText.length / perLine);
            var sumH = Math.ceil(lines * sumSize * sumLH) + 8;

            els.push({
              key: 'pg-sum', type: 'text', role: 'summary', text: summaryText,
              x: PADX, y: curY, w: sumW, h: sumH,
              size: sumSize, weight: 300,
              color: preset.ink, tracking: 0, align: 'left',
              lineHeight: sumLH, rot: 0,
              opacity: hasBullets ? 0.62 : 0.76
            });
            curY += sumH + (hasBullets ? 30 : 44);
          }

          if (hasBullets) {
            els.push({
              key: 'pg-bul', type: 'text', role: 'bullets',
              text: n.bullets.map(function (b, bi) {
                return String(bi + 1).padStart(2, '0') + '  —  ' + b;
              }).join('\n'),
              x: PADX, y: curY, w: Math.min(1180, BODY_W), h: 320,
              size: 28, weight: 400, color: preset.ink,
              tracking: 0, align: 'left', lineHeight: 1.9, rot: 0, opacity: 0.88
            });
          }

          if (hasMetrics) {
            /* Right column: one dark block per metric, 3px gap. */
            var ms = n.metrics.slice(0, 4);
            var MX = 1920 - PADX - METRICS_W;
            var MB = PADT + 38 + 44 + 33;
            var colW = Math.min(330, Math.floor(820 / ms.length) - 6);
            ms.forEach(function (m, mi) {
              var bx = MX + mi * (colW + 3);
              els.push({
                key: 'pg-metric-' + mi, type: 'shape', role: 'metric',
                x: bx, y: MB, w: colW, h: 262,
                fill: preset.tone === 'ink' ? '#f0eee6' : '#141413',
                rot: 0, opacity: 1
              });
              /* Value and unit share one line: the real CSS makes .m__v a
                 flexbox with baseline alignment, so "816 B" never wraps. */
              els.push({
                key: 'pg-mval-' + mi, type: 'text', role: 'metric-value',
                text: String(m.value || '') + (m.unit ? ' ' + m.unit : ''),
                x: bx + 30, y: MB + 40, w: colW - 60, h: 110,
                size: 100, weight: 800,
                color: preset.tone === 'ink' ? '#141413' : '#f0eee6',
                tracking: -3, align: 'left', lineHeight: 1.0, rot: 0, opacity: 1
              });
              els.push({
                key: 'pg-mlab-' + mi, type: 'text', role: 'metric-label',
                text: m.label || '',
                x: bx + 30, y: MB + 180, w: colW - 60, h: 50,
                size: 18, weight: 400,
                color: preset.tone === 'ink' ? '#6b665c' : '#8f8b82',
                tracking: 1, align: 'left', lineHeight: 1.5, rot: 0, opacity: 1
              });
            });
          }

          /* ---- bottom furniture: caption banner / strip / foot ----
             Offsets come straight from the deck CSS:
               --strip-b 44  --strip-h 52  --cap-h 62
               --cap-b = strip-b + strip-h + 20 = 116
               --foot-b = cap-b + cap-h + 26 = 204                        */

          var capText = String(n.caption || n.summary || '').trim();
          if (capText) {
            /* The real .caption is centred with translateX(-50%) and capped at
               1600px, so the plate hugs its text instead of spanning the stage.
               Approximate the text width (30px serif ≈ 0.95em per CJK glyph). */
            var capW = Math.min(1600, Math.round(capText.length * 30 * 0.95) + 60);
            var capX = Math.round((1920 - capW) / 2);
            els.push({
              key: 'pg-cap-bg', type: 'shape', role: 'caption-bg',
              x: capX, y: 1080 - 116 - 62, w: capW, h: 62 * KY,
              fill: preset.ink, rot: 0, opacity: 1
            });
            els.push({
              key: 'pg-cap', type: 'text', role: 'caption', text: capText,
              x: capX, y: 1080 - 116 - 62 + 14, w: capW, h: 34,
              size: 30 * KS, weight: 600, color: preset.panelFg || '#f0eee6',
              tracking: 0, align: 'center', lineHeight: 1.2, rot: 0, opacity: 1
            });
          }

          /* Progress strip: one segment per news item, current one accented. */
          els.push({
            key: 'pg-strip-line', type: 'shape', role: 'strip-rule',
            x: PADX, y: 1080 - 44 - 52, w: BODY_W, h: 1,
            fill: preset.ink, opacity: 0.28, rot: 0
          });
          els.push({
            key: 'pg-strip-line2', type: 'shape', role: 'strip-rule',
            x: PADX, y: 1080 - 44, w: BODY_W, h: 1,
            fill: preset.ink, opacity: 0.28, rot: 0
          });

          /* .strip__seg is flex:1 1 0, but the active one switches to
             flex:0 0 auto with 16px side padding — it hugs "entity timecode"
             and steals width from its neighbours. */
          var segW = BODY_W / Math.max(1, news.length);
          var curIdx = pageIndex - 1;
          var curSegW = 0;
          if (news[curIdx]) {
            var curLabel = String(news[curIdx].entity || '') + ' ' + String(news[curIdx].timecode || '');
            curSegW = Math.round(curLabel.length * 16 * 0.62) + 32;
            curSegW = Math.max(90, Math.min(240, curSegW));
          }
          var restW = Math.max(1, (BODY_W - curSegW) / Math.max(1, news.length - 1));

          var cursorX = PADX;
          news.forEach(function (s, si) {
            var on = si === curIdx;
            var wSeg = on ? curSegW : restW;
            if (on) {
              els.push({
                key: 'pg-seg-bg-' + si, type: 'shape', role: 'strip-on',
                x: cursorX, y: 1080 - 44 - 52, w: wSeg, h: 52,
                fill: preset.accent || '#c15f3c', rot: 0, opacity: 1
              });
            }
            els.push({
              key: 'pg-seg-' + si, type: 'text', role: 'strip-seg',
              text: s.entity || '',
              x: cursorX, y: 1080 - 44 - 52 + 17, w: wSeg, h: 22,
              size: 16, weight: on ? 700 : 600,
              color: on ? '#fdf6f0' : (si < curIdx ? 'rgba(20,20,19,.4)' : preset.ink),
              tracking: 0.3, align: 'center', lineHeight: 1.2, rot: 0,
              opacity: si < curIdx ? 0.6 : 1
            });
            cursorX += wSeg;
          });

          els.push({
            key: 'pg-foot-l', type: 'text', role: 'foot-left', text: n.entity || '',
            x: PADX, y: 1080 - 204, w: 600, h: 30,
            size: 22, weight: 600, color: preset.ink,
            tracking: 0.4, align: 'left', lineHeight: 1.2, rot: 0, opacity: 0.9
          });
          els.push({
            key: 'pg-foot-r', type: 'text', role: 'foot-right',
            text: 'NEWS ' + String(pageIndex).padStart(2, '0') + ' · ' + (n.category || ''),
            x: 1920 - PADX - 600, y: 1080 - 204, w: 600, h: 30,
            size: 16, weight: 400, color: '#6b665c',
            tracking: 4, align: 'right', lineHeight: 1.2, rot: 0, opacity: 1
          });

          return els;
        }

        /* End page */
        return [{
          key: 'pg-end', type: 'text', role: 'end',
          text: (deck && deck.end && deck.end.big) || '今天的资讯播送完了，我们明天见！',
          x: 160, y: 440, w: 1600, h: 200, size: 88, weight: 700,
          color: preset.ink, tracking: 0, align: 'center',
          lineHeight: 1.2, rot: 0, opacity: 1
        }];
      }
