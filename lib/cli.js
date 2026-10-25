#!/usr/bin/env node
/**
 * @local/dsh-cover-studio — Command line interface.
 *
 * Every editor capability is reachable from a shell, so the studio can be
 * driven by scripts, CI, or an agent that never opens a browser:
 *
 *   cover-studio list                        list built-in templates
 *   cover-studio icons [--vendor <name>]     list the icon library
 *   cover-studio build <deck.json>           deck → scene → HTML
 *   cover-studio render <deck.json> -o a.png deck → PNG (headless Chrome)
 *   cover-studio deck <deck.json>            deck → multi-page HTML
 *   cover-studio layout <scene.json> ...     scatter / grid / align
 *   cover-studio inspect <scene.json>        print element geometry
 *   cover-studio doctor                      report capability status
 *
 * Exit code is 0 on success, 1 on failure, so it composes in a pipeline.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { RATIOS, ratioOf, boundsOf, alignBoxes, gridArrange, scatterArrange } from './shared/layout.js';
import { deckToScene, buildPageElements, toneOf, TONES } from './shared/scene.js';
import { renderPage, renderDeck, esc } from './shared/render.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const PKG_ROOT = resolve(HERE, '..');

/* ------------------------------------------------------------------ utils */

function fail(msg) {
  process.stderr.write('error: ' + msg + '\n');
  process.exit(1);
}

async function readJson(p) {
  const raw = await readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function writeOut(p, data) {
  await mkdir(dirname(resolve(p)), { recursive: true });
  await writeFile(p, data);
}

function kb(n) { return (n / 1024).toFixed(1) + ' KB'; }

/** Parse `--flag value` and `--flag=value` into an object. */
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('--')) {
          out[a.slice(2)] = next;
          i++;
        } else {
          out[a.slice(2)] = true;
        }
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

/* -------------------------------------------------------------- the icons */

let ICON_CACHE = null;
async function loadIcons() {
  if (ICON_CACHE) return ICON_CACHE;
  /* The library lives in the browser bundle; read it out once. */
  const clientPath = join(PKG_ROOT, 'lib', 'client.js');
  const src = await readFile(clientPath, 'utf8');
  function grab(marker) {
    const s = src.indexOf(marker);
    if (s < 0) return null;
    const start = s + marker.length;
    let d = 0;
    for (let i = start; i < src.length; i++) {
      if (src[i] === '{') d++;
      else if (src[i] === '}') { d--; if (d === 0) return JSON.parse(src.slice(start, i + 1)); }
    }
    return null;
  }
  ICON_CACHE = {
    groups: grab('var ICON_GROUPS = '),
    icons: grab('var ICONS = ')
  };
  return ICON_CACHE;
}

/* ------------------------------------------------------------- the render */

/** Locate a Chrome/Edge binary for rasterisation. */
function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);
  for (const c of cands) { try { if (existsSync(c)) return c; } catch {} }
  return null;
}

/** Rasterise an HTML file to PNG with headless Chrome. */
function screenshot(chrome, htmlPath, pngPath, width, height, scale) {
  return new Promise(function (resolveP, rejectP) {
    const args = [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--virtual-time-budget=8000',
      '--force-device-scale-factor=' + (scale || 1),
      '--window-size=' + width + ',' + height,
      '--screenshot=' + pngPath,
      'file:///' + htmlPath.replace(/\\/g, '/')
    ];
    const p = spawn(chrome, args, { stdio: 'ignore' });
    p.on('error', rejectP);
    p.on('exit', function (code) {
      if (code === 0) resolveP();
      else rejectP(new Error('chrome exited ' + code));
    });
  });
}

/* ------------------------------------------------------------- the commands */

async function cmdList(args) {
  const dir = resolve(PKG_ROOT, args.dir || 'templates');
  if (!existsSync(dir)) {
    process.stdout.write('no templates directory at ' + dir + '\n');
    process.stdout.write('(templates are optional; build your own deck with "cover-studio build")\n');
    return;
  }
  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(dir)).filter(function (f) { return extname(f) === '.html'; });
  if (!files.length) { process.stdout.write('no .html templates in ' + dir + '\n'); return; }
  for (const f of files) {
    const st = await stat(join(dir, f));
    process.stdout.write(f.padEnd(40) + kb(st.size) + '\n');
  }
}

async function cmdIcons(args) {
  const { groups, icons } = await loadIcons();
  if (!groups) fail('could not read the icon library from lib/client.js');

  const vendor = args.vendor || args.v;
  const search = args.search || args.q;
  const models = Object.keys(groups).filter(function (m) {
    if (vendor && !m.toLowerCase().includes(String(vendor).toLowerCase())) return false;
    if (search && !m.toLowerCase().includes(String(search).toLowerCase())) return false;
    return true;
  });

  if (args.json) {
    const out = {};
    for (const m of models) out[m] = groups[m].map(function (v) { return v.variant; });
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }

  let total = 0;
  for (const m of models) {
    const n = groups[m].length;
    total += n;
    process.stdout.write(m.padEnd(28) + String(n).padStart(3) + ' variants  ' +
      groups[m].map(function (v) { return v.variant; }).slice(0, 4).join(', ') +
      (n > 4 ? ' …' : '') + '\n');
  }
  process.stdout.write('\n' + models.length + ' models, ' + total + ' icons, ' +
    Object.keys(icons || {}).length + ' images total\n');
}

async function cmdBuild(args) {
  const input = args._[0];
  if (!input) fail('usage: cover-studio build <deck.json> [-o out.html]');
  const deck = await readJson(resolve(input));
  const scene = deckToScene(deck);
  const preset = toneOf(deck.tone || 'paper');
  const ratio = ratioOf(args.ratio || scene.ratio || '16:9');
  const html = renderPage(scene, preset, {
    width: ratio.w, height: ratio.h,
    title: (deck.brand || 'AI 日报') + ' ' + (deck.date || '')
  });

  const out = args.o || args.output || input.replace(/\.json$/i, '') + '.html';
  await writeOut(resolve(out), html);
  process.stdout.write('scene: ' + scene.elements.length + ' elements\n');
  process.stdout.write('html:  ' + resolve(out) + '  ' + kb(html.length) + '\n');

  if (args.png) {
    const chrome = findChrome();
    if (!chrome) fail('no Chrome/Edge found; set CHROME_PATH');
    const png = String(args.png === true ? resolve(out).replace(/\.html$/i, '.png') : args.png);
    const scale = Number(args.scale || 2);
    await screenshot(chrome, resolve(out), resolve(png), ratio.w, ratio.h, scale);
    const st = await stat(png);
    process.stdout.write('png:   ' + resolve(png) + '  ' + kb(st.size) + '\n');
  }
}

async function cmdRender(args) {
  const input = args._[0];
  if (!input) fail('usage: cover-studio render <deck.json> -o out.png');
  const deck = await readJson(resolve(input));
  const scene = deckToScene(deck);
  const preset = toneOf(deck.tone || 'paper');
  const ratio = ratioOf(args.ratio || scene.ratio || '16:9');
  const html = renderPage(scene, preset, { width: ratio.w, height: ratio.h });

  /* Intermediate HTML goes to the OS temp dir, never into the package. */
  const { tmpdir } = await import('node:os');
  const tmp = resolve(args.tmp || join(tmpdir(), 'cover-studio-' + Date.now() + '.html'));
  await writeOut(tmp, html);

  const chrome = findChrome();
  if (!chrome) fail('no Chrome/Edge found; set CHROME_PATH');

  const out = resolve(args.o || args.output || input.replace(/\.json$/i, '') + '.png');
  const scale = Number(args.scale || 2);
  await screenshot(chrome, tmp, out, ratio.w, ratio.h, scale);
  const st = await stat(out);
  process.stdout.write('png: ' + out + '  ' + kb(st.size) + '  (' + ratio.w * scale + '×' + ratio.h * scale + ')\n');
}

async function cmdDeck(args) {
  const input = args._[0];
  if (!input) fail('usage: cover-studio deck <deck.json> [-o out.html]');
  const deck = await readJson(resolve(input));
  const preset = toneOf(deck.tone || 'paper');
  const ratio = ratioOf(args.ratio || '16:9');

  const cover = deckToScene(deck);
  const pages = [cover];
  const news = (deck.news || []);
  for (let i = 1; i <= news.length; i++) {
    pages.push({ elements: buildPageElements(i, deck, preset) });
  }

  const html = renderDeck(pages, preset, {
    width: ratio.w, height: ratio.h,
    title: (deck.brand || 'AI 日报') + ' ' + (deck.date || ''),
    gap: Number(args.gap || 24)
  });
  const out = resolve(args.o || args.output || input.replace(/\.json$/i, '') + '-deck.html');
  await writeOut(out, html);
  process.stdout.write('pages: ' + pages.length + '\n');
  process.stdout.write('html:  ' + out + '  ' + kb(html.length) + '\n');
}

async function cmdLayout(args) {
  const input = args._[0];
  if (!input) fail('usage: cover-studio layout <scene.json> --mode scatter|grid|row|align');
  const scene = await readJson(resolve(input));
  const list = (scene.elements || []).filter(function (e) { return !e.hidden; });
  if (!list.length) fail('scene has no elements');

  const mode = args.mode || 'scatter';
  const box = boundsOf(list);
  const area = {
    x: box.x, y: box.y,
    w: box.w || 1920, h: box.h || 1080
  };
  let placed;

  if (mode === 'scatter') {
    const shapes = args.shapes ? String(args.shapes).split(',') : undefined;
    placed = scatterArrange(list, {
      area: area,
      shapes: shapes,
      size: args.size ? Number(args.size) : undefined,
      jitter: args.jitter !== undefined ? Number(args.jitter) : undefined,
      rotate: args.rotate !== undefined ? Number(args.rotate) : undefined
    });
  } else if (mode === 'grid') {
    placed = gridArrange(list, Number(args.cols || 0) || undefined, Number(args.gap || 24),
      { w: 1920, h: 1080 }, { x: area.x, y: area.y });
  } else if (mode === 'row') {
    const gap = Number(args.gap || 24);
    let totalW = 0;
    for (const el of list) totalW += el.w;
    totalW += gap * (list.length - 1);
    let x = Math.round(box.x + (box.w - totalW) / 2);
    placed = list.map(function (el) {
      const p = { key: el.key, x: x, y: Math.round(box.y + (box.h - el.h) / 2), rot: 0 };
      x += el.w + gap;
      return p;
    });
  } else if (mode === 'align') {
    placed = alignBoxes(list, args.how || 'centerX', { w: 1920, h: 1080 });
  } else {
    fail('unknown mode: ' + mode);
  }

  const byKey = {};
  for (const p of placed) byKey[p.key] = p;
  for (const el of scene.elements) {
    const p = byKey[el.key];
    if (!p) continue;
    if (p.x !== undefined) el.x = p.x;
    if (p.y !== undefined) el.y = p.y;
    if (p.w !== undefined) el.w = p.w;
    if (p.h !== undefined) el.h = p.h;
    if (p.rot !== undefined) el.rot = p.rot;
  }

  const out = resolve(args.o || args.output || input.replace(/\.json$/i, '') + '-layout.json');
  await writeOut(out, JSON.stringify(scene, null, 2));
  process.stdout.write('mode:  ' + mode + '\n');
  process.stdout.write('items: ' + placed.length + '\n');
  process.stdout.write('out:   ' + out + '\n');
}

async function cmdInspect(args) {
  const input = args._[0];
  if (!input) fail('usage: cover-studio inspect <scene.json>');
  const scene = await readJson(resolve(input));
  const els = scene.elements || [];
  process.stdout.write('scene: ' + (scene.ratio || '16:9') + '  ' + els.length + ' elements\n\n');
  process.stdout.write('key'.padEnd(20) + 'type'.padEnd(10) + 'x'.padStart(6) +
    'y'.padStart(6) + 'w'.padStart(6) + 'h'.padStart(6) + '  text\n');
  process.stdout.write('-'.repeat(78) + '\n');
  for (const el of els) {
    process.stdout.write(
      String(el.key || '').slice(0, 19).padEnd(20) +
      String(el.type || '').padEnd(10) +
      String(Math.round(el.x || 0)).padStart(6) +
      String(Math.round(el.y || 0)).padStart(6) +
      String(Math.round(el.w || 0)).padStart(6) +
      String(Math.round(el.h || 0)).padStart(6) + '  ' +
      String(el.text || el.category || '').slice(0, 30) + '\n'
    );
  }
  const box = boundsOf(els);
  if (box) process.stdout.write('\nbounds: x=' + box.x + ' y=' + box.y + ' w=' + box.w + ' h=' + box.h + '\n');
}

async function cmdDoctor() {
  const chrome = findChrome();
  const clientPath = join(PKG_ROOT, 'lib', 'client.js');
  const { groups, icons } = await loadIcons().catch(function () { return {}; });

  const rows = [
    ['node', process.version, 'ok'],
    ['package', PKG_ROOT, existsSync(join(PKG_ROOT, 'package.json')) ? 'ok' : 'missing'],
    ['client bundle', clientPath, existsSync(clientPath) ? 'ok' : 'missing'],
    ['chrome', chrome || '(not found)', chrome ? 'ok' : 'set CHROME_PATH to render PNG'],
    ['icon models', groups ? Object.keys(groups).length : 0, groups ? 'ok' : 'unavailable'],
    ['icon images', icons ? Object.keys(icons).length : 0, icons ? 'ok' : 'unavailable'],
    ['shared engine', 'lib/shared/*.js', existsSync(join(PKG_ROOT, 'lib', 'shared', 'layout.js')) ? 'ok' : 'missing']
  ];
  for (const r of rows) {
    process.stdout.write(String(r[0]).padEnd(16) + String(r[1]).padEnd(52) + r[2] + '\n');
  }
}

function usage() {
  process.stdout.write([
    'dsh-cover-studio — command line',
    '',
    'USAGE',
    '  cover-studio <command> [options]',
    '',
    'COMMANDS',
    '  list [--dir templates]              list built-in HTML templates',
    '  icons [--vendor <name>] [--json]    list the AI model icon library',
    '  build <deck.json> [-o out.html]     deck → scene → single-page HTML',
    '        [--png out.png] [--scale 2]   …and rasterise with headless Chrome',
    '  render <deck.json> -o out.png       deck → PNG',
    '  deck <deck.json> [-o out.html]      deck → multi-page scrolling HTML',
    '  layout <scene.json> --mode <m>      re-layout a scene',
    '        mode: scatter | grid | row | align',
    '        scatter: --shapes square,rect,circle,diamond --jitter .3 --rotate 12',
    '        grid:    --cols 3 --gap 24',
    '        row:     --gap 24',
    '        align:   --how left|centerX|right|top|centerY|bottom',
    '  inspect <scene.json>                print element geometry',
    '  doctor                              report capability status',
    '',
    'EXAMPLES',
    '  cover-studio build deck.json --png cover.png --scale 2',
    '  cover-studio icons --vendor deepseek',
    '  cover-studio layout scene.json --mode scatter --jitter 0.5',
    ''
  ].join('\n'));
}

/* ------------------------------------------------------------------ entry */

const COMMANDS = {
  list: cmdList,
  icons: cmdIcons,
  build: cmdBuild,
  render: cmdRender,
  deck: cmdDeck,
  layout: cmdLayout,
  inspect: cmdInspect,
  doctor: cmdDoctor
};

async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const cmd = args._.shift();

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') { usage(); return; }
  if (cmd === 'version' || cmd === '--version' || cmd === '-v') {
    const pkg = await readJson(join(PKG_ROOT, 'package.json'));
    process.stdout.write(pkg.version + '\n');
    return;
  }

  const fn = COMMANDS[cmd];
  if (!fn) { usage(); fail('unknown command: ' + cmd); }
  await fn(args);
}

main().catch(function (err) {
  process.stderr.write('error: ' + (err && err.message ? err.message : String(err)) + '\n');
  process.exit(1);
});
