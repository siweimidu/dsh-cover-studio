/**
 * @local/dsh-cover-studio — Host half.
 *
 * Pure ESM sync module: no top-level await, so it loads under both an ESM
 * importer and a CJS interop loader.
 *
 * Compatibility policy: depends only on apply(ctx, config) plus an optional
 * ctx.reflect. Every other service is probed at runtime — a missing service
 * degrades one feature instead of aborting profile startup.
 *
 * Responsibilities:
 *   - template browsing (the original behaviour)
 *   - LLM generation through ctx.llm, so the studio uses the models already
 *     configured in Harness settings
 *   - Skill bridge: write deck-data.json and run the Skill build scripts
 *   - TTS: local (edge/omnivoice) and cloud (MiniMax) adapters
 */
import { readdir, readFile, stat, writeFile, mkdir, copyFile, unlink } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

import { RATIOS, ratioOf, boundsOf, alignBoxes, gridArrange, scatterArrange, rowArrange, applyPlacement } from './shared/layout.js';
import { deckToScene, buildPageElements, toneOf, TONES } from './shared/scene.js';
import { renderPage, renderDeck } from './shared/render.js';

const require_ = createRequire(import.meta.url);
const HERE = fileURLToPath(new URL('.', import.meta.url));
const PKG_ROOT = resolve(HERE, '..');

/** Exact Fetch route the browser posts to. */
const ROUTE = 'api/cover-studio';

let z = null;
try { z = require_('schemastery'); } catch { z = null; }

export const Config = z && typeof z.object === 'function'
  ? z.object({
      templateDir: z.string().default('templates'),
      exportScale: z.number().min(1).max(4).default(2),
      skillDir: z.string().default(''),
      projectDir: z.string().default(''),
      ttsDir: z.string().default(''),
    })
  : { templateDir: 'templates', exportScale: 2, skillDir: '', projectDir: '', ttsDir: '' };

/* ------------------------------------------------------------------ utils */

/** Cache of the icon library, read out of the browser bundle once. */
let ICON_LIB = null;

/**
 * Read the icon tables out of lib/client.js.
 *
 * The library is inlined in the browser bundle (so the editor works offline
 * with no fetch), which makes that file the single source of truth. Parsing it
 * here keeps the CLI and the host from drifting out of sync with the UI.
 */
async function loadIconLibrary() {
  if (ICON_LIB) return ICON_LIB;
  try {
    const src = await readFile(join(HERE, 'client.js'), 'utf8');
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
    ICON_LIB = { groups: grab('var ICON_GROUPS = '), icons: grab('var ICONS = ') };
    return ICON_LIB;
  } catch (err) {
    return null;
  }
}

function safeName(name) {
  return typeof name === 'string' && /^[A-Za-z0-9._-]+\.html$/.test(name);
}

function resolveDir(cfg) {
  const raw = (cfg && cfg.templateDir) || 'templates';
  return raw.match(/^([A-Za-z]:[\\/]|\/)/) ? raw : resolve(PKG_ROOT, raw);
}

/** True when a directory holds the Skill build scripts. */
function hasSkillScripts(dir) {
  try { return existsSync(join(dir, 'scripts', 'build_deck.cjs')); } catch { return false; }
}

/**
 * Expand a .skill archive into the cache directory.
 *
 * A .skill file is a renamed zip. The build scripts need real files, so the
 * archive is unpacked once into a stable cache path.
 */
async function expandSkill(archive, targetDir) {
  try {
    if (hasSkillScripts(targetDir)) return targetDir;
    await mkdir(targetDir, { recursive: true });
    /* PowerShell handles .skill because Expand-Archive refuses the extension,
       so copy to a .zip name first. */
    const zip = targetDir + '.zip';
    await copyFile(archive, zip);
    const cmd = process.platform === 'win32'
      ? ['powershell', ['-NoProfile', '-Command',
          'Expand-Archive -LiteralPath \'' + zip + '\' -DestinationPath \'' + targetDir + '\' -Force']]
      : ['unzip', ['-o', zip, '-d', targetDir]];
    const r = await runCmd(cmd[0], cmd[1]);
    try { await unlink(zip); } catch { /* best effort */ }
    return hasSkillScripts(targetDir) ? targetDir : null;
  } catch {
    return null;
  }
}

/**
 * Locate the AI daily Skill on disk, expanding a .skill archive when needed.
 *
 * Tries the configured path first, then the usual homes, then the known
 * archives in D:/Skills/AI日报.
 */
async function resolveSkillDir(cfg) {
  const dirs = [];
  if (cfg && cfg.skillDir) dirs.push(cfg.skillDir);
  dirs.push(
    'D:\\Skills\\AI日报\\AI日报模板',
    'D:\\Skills\\AI日报',
    'D:\\Code\\PPT-HTML日报模板\\_skill_unzip',
    join(homedir(), '.dsh', 'skills', 'ai-daily'),
  );

  for (const c of dirs) {
    if (!c) continue;
    if (hasSkillScripts(c)) return c;
    try {
      const subs = readdirSync(c, { withFileTypes: true });
      for (const s of subs) {
        if (!s.isDirectory()) continue;
        const p = join(c, s.name);
        if (hasSkillScripts(p)) return p;
      }
    } catch { /* keep probing */ }
  }

  /* Nothing expanded yet: unpack the known .skill archives. */
  const archives = [
    'D:\\Skills\\AI日报\\AI日报模板.skill',
  ];
  for (const a of archives) {
    if (!existsSync(a)) continue;
    const target = join(homedir(), '.dsh', 'cover-studio', 'skill');
    const got = await expandSkill(a, target);
    if (got) return got;
  }
  return null;
}

/** Run a node script and capture its output. */
function runNode(script, args, cwd) {
  return new Promise(function (done) {
    let out = "", err = "";
    let child;
    try {
      child = spawn(process.execPath || 'node', [script].concat(args), { cwd: cwd });
    } catch (e) {
      return done({ ok: false, error: String((e && e.message) || e) });
    }
    child.stdout && child.stdout.on('data', function (d) { out += String(d); });
    child.stderr && child.stderr.on('data', function (d) { err += String(d); });
    child.on('error', function (e) { done({ ok: false, error: String((e && e.message) || e) }); });
    child.on('close', function (code) {
      done({ ok: code === 0, code: code, stdout: out, stderr: err });
    });
  });
}

/** Spawn a command and report only success/failure. */
function runCmd(cmd, args, cwd) {
  return new Promise(function (done) {
    let child;
    try {
      child = spawn(cmd, args, { cwd: cwd, windowsHide: true });
    } catch (e) {
      return done({ ok: false, error: String((e && e.message) || e) });
    }
    let err = "";
    child.stderr && child.stderr.on('data', function (d) { err += String(d); });
    child.on('error', function (e) { done({ ok: false, error: String((e && e.message) || e) }); });
    child.on('close', function (code) { done({ ok: code === 0, error: err }); });
  });
}

/* -------------------------------------------------------------- templates */

async function listTemplates(dir) {
  let names;
  try { names = await readdir(dir); } catch { return []; }
  const out = [];
  for (const file of names) {
    if (extname(file) !== '.html') continue;
    out.push({ name: file, title: basename(file, '.html') });
  }
  return out.sort(function (a, b) { return a.name.localeCompare(b.name); });
}

async function readTemplate(dir, file) {
  if (!safeName(file)) return null;
  try {
    const info = await stat(join(dir, file));
    if (!info.isFile()) return null;
    return await readFile(join(dir, file), 'utf8');
  } catch { return null; }
}

/* -------------------------------------------------------------------- LLM */

/**
 * Pick a usable model route.
 *
 * Prefers the caller explicit ref, then the first provider that actually
 * reports models, so a fresh profile still generates something.
 */
async function pickRoute(ctx, wanted) {
  const llm = ctx && ctx.llm;
  if (!llm || typeof llm.stream !== 'function') return null;

  if (wanted && wanted.provider && wanted.model) return wanted;

  let providers = [];
  try { providers = llm.listProviders() || []; } catch { providers = []; }

  for (const p of providers) {
    const id = typeof p === 'string' ? p : (p && (p.id || p.provider));
    if (!id) continue;
    let models = [];
    try { models = await llm.listModels(id); } catch { models = []; }
    const list = Array.isArray(models) ? models : [];
    if (!list.length) continue;
    const first = list[0];
    const modelId = typeof first === 'string' ? first : (first && (first.id || first.model || first.ref));
    if (!modelId) continue;
    /* A ref already has provider/model shape; split it back apart. */
    if (typeof modelId === 'string' && modelId.indexOf('/') > 0) {
      const cut = modelId.indexOf('/');
      return { provider: modelId.slice(0, cut), model: modelId.slice(cut + 1) };
    }
    return { provider: id, model: modelId };
  }
  return null;
}

/** Collect a streamed completion into plain text. */
async function complete(ctx, route, system, user, maxTokens) {
  const llm = ctx.llm;
  let text = "";
  const stream = llm.stream({
    provider: route.provider,
    model: route.model,
    messages: [
      { role: 'system', content: [{ type: 'text', text: system }] },
      { role: 'user', content: [{ type: 'text', text: user }] },
    ],
    maxTokens: maxTokens || 8192,
  });
  for await (const chunk of stream) {
    if (!chunk) continue;
    const pieces = Array.isArray(chunk) ? chunk : (chunk.blocks || [chunk]);
    for (const b of pieces) {
      if (typeof b === "string") { text += b; continue; }
      if (b && b.type === "text" && typeof b.text === "string") text += b.text;
      else if (b && typeof b.text === "string") text += b.text;
    }
  }
  return text;
}

/** Pull the first JSON object out of a model reply. */
function extractJson(raw) {
  const s = String(raw || "");
  const fence = s.indexOf("```");
  let body = s;
  if (fence >= 0) {
    const after = s.slice(fence + 3);
    const end = after.indexOf("```");
    if (end >= 0) body = after.slice(0, end);
    body = body.replace(/^json\s*/i, '');
  }
  const start = body.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < body.length; i++) {
    const c = body[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(body.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

/* -------------------------------------------------------------------- TTS */

/**
 * Optional EdgeTTS bundle location.
 *
 * Empty by default: the plugin probes the system `python` first, which is
 * what a user normally has. Someone running the portable bundle sets
 * `ttsDir` in plugin config (or the 配音 panel) to point at it.
 */
const DEFAULT_TTS_DIR = '';

/**
 * Resolve the Python interpreter that owns the edge_tts package.
 *
 * The bundle ships a relocatable venv whose python.exe is the only reliable
 * entry point — edge-tts.exe inside Scripts is a shim that exits silently when
 * spawned without a console.
 */
/**
 * Candidate interpreters, most capable first.
 *
 * The bundled EdgeTTS venv pins edge-tts 7.2.x, which Microsoft now rejects
 * with 403, so a system interpreter is preferred when one is present.
 */
function edgePythonCandidates(ttsDir) {
  /* System interpreters first: they are usually newer than a pinned bundle,
     and Microsoft rejects the older edge-tts with 403. */
  var out = ['python', 'python3'];
  var roots = [ttsDir, DEFAULT_TTS_DIR].filter(Boolean);
  for (var i = 0; i < roots.length; i++) {
    var r = roots[i];
    var bundled = [
      join(r, 'python', 'build_venv', 'python.exe'),
      join(r, 'python', 'build_venv', 'Scripts', 'python.exe'),
      join(r, 'python.exe'),
    ];
    for (var j = 0; j < bundled.length; j++) {
      try { if (existsSync(bundled[j])) out.push(bundled[j]); } catch (e) { /* keep probing */ }
    }
  }
  return out;
}

/** First interpreter that actually has edge_tts importable. */
async function resolveEdgePython(ttsDir) {
  var list = edgePythonCandidates(ttsDir);
  for (var i = 0; i < list.length; i++) {
    var r = await runCmd(list[i], ['-c', 'import edge_tts']);
    if (r.ok) return list[i];
  }
  return null;
}

/** Voice names to show when a provider cannot list them. */
const FALLBACK_VOICES = {
  openai: [
    { id: 'alloy', name: 'Alloy' },
    { id: 'echo', name: 'Echo' },
    { id: 'fable', name: 'Fable' },
    { id: 'onyx', name: 'Onyx' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' }
  ],
  minimax: [
    { id: 'male-qn-qingse', name: '青涩青年' },
    { id: 'female-shaonv', name: '少女' },
    { id: 'presenter_male', name: '播报男声' },
    { id: 'presenter_female', name: '播报女声' }
  ],
  azure: [{ id: 'alloy', name: 'Alloy' }],
  volc: [{ id: 'BV700_streaming', name: '通用女声' }],
  custom: [{ id: 'alloy', name: 'Alloy' }]
};

const TTS_PRESETS = [
  { id: 'edge-zh-Xiaoxiao', name: '晓晓（女声·温柔）', kind: 'local', engine: 'edge-tts', voice: 'zh-CN-XiaoxiaoNeural' },
  { id: 'edge-zh-Yunxi', name: '云希（男声·沉稳）', kind: 'local', engine: 'edge-tts', voice: 'zh-CN-YunxiNeural' },
  { id: 'edge-zh-Yunyang', name: '云扬（男声·播报）', kind: 'local', engine: 'edge-tts', voice: 'zh-CN-YunyangNeural' },
  { id: 'edge-zh-Xiaoyi', name: '晓伊（女声·亲切）', kind: 'local', engine: 'edge-tts', voice: 'zh-CN-XiaoyiNeural' },
  { id: 'omnivoice-default', name: 'OmniVoice 本地', kind: 'local', engine: 'omnivoice', voice: 'default' },
  { id: 'minimax-male-qingse', name: 'MiniMax 青涩青年', kind: 'cloud', engine: 'minimax', voice: 'male-qn-qingse' },
  { id: 'minimax-female-shaonv', name: 'MiniMax 少女', kind: 'cloud', engine: 'minimax', voice: 'female-shaonv' },
  { id: 'minimax-presenter', name: 'MiniMax 播报男声', kind: 'cloud', engine: 'minimax', voice: 'presenter_male' },
];

/** Detect which local TTS binaries are on PATH. */
async function detectTts(ttsDir) {
  var probes = ['edge-tts', 'omnivoice', 'espeak', 'say'];
  var found = {};
  for (var i = 0; i < probes.length; i++) {
    var p = probes[i];
    var r = await runCmd(process.platform === 'win32' ? 'where' : 'which', [p]);
    found[p] = r.ok === true;
  }
  /* The bundled venv counts as available even when nothing is on PATH. */
  var py = await resolveEdgePython(ttsDir);
  found['edge-tts-bundled'] = py !== null;
  found.pythonPath = py || '';
  return found;
}
/* -------------------------------------------------------------------- Skill */

/** The six categories the Skill hard-codes. */
var CATEGORIES = ['要闻', '模型发布', '开发动态', '产品应用', '技术与洞察', '行业动态'];

/**
 * Build the generation prompt.
 *
 * Every rule here is copied from SKILL.md — the model has no other way to learn
 * that categories are fixed, or that captions may not end in a period.
 */
function buildPrompt(date, feeds) {
  var sys = [
    '你是一名中文科技媒体的资深编排编辑，为《AI 日报》整理每日资讯。',
    '只输出 JSON，不要解释、不要 markdown 代码围栏。',
    '',
    '输出结构：',
    '{',
    '  "brand":"AI 日报","brandLatin":"DAILY AI","date":"YYYY-MM-DD",',
    '  "topic":"模型 · 产品 · 安全 · 政策","tone":"paper",',
    '  "cover":{"headline":"","lede":"","stats":[]},',
    '  "news":[{"timecode":"00:08","entity":"具体对象","category":"六类之一",',
    '    "headline":"首页短标题","title":"完整标题","summary":"摘要",',
    '    "caption":"底部字幕","bullets":["要点1","要点2"],',
    '    "metrics":[{"value":"816","unit":"B","label":"总参数"}],',
    '    "layout":"auto","duration":13}],',
    '  "end":{"big":"今天的资讯播送完了，我们明天见！",',
    '    "leaderboard":{"title":"AIHOT 大模型综合榜","date":"YYYY-MM-DD","items":[]}}',
    '}',
    '',
    '硬性规则：',
    '1. category 只能是：要闻 / 模型发布 / 开发动态 / 产品应用 / 技术与洞察 / 行业动态。',
    '2. caption 依据该条 title 写成完整句子，不得以句号结尾，15–28 字。',
    '3. 有 metrics 就给，无论 layout 为何，1–3 块最佳。',
    '4. metrics 的 value 用「万/亿」短格式，unit 与 label 不得重复。',
    '5. title 不得重复，entity 尽量每条不同。',
    '6. summary 不得用省略号截断。',
    '7. timecode 从 00:08 起，每条递增 13 秒。',
    '8. news 数量按素材多少决定，8–16 条为宜。'
  ].join('\n');

  var user = [
    '今天是 ' + date + '。',
    '',
    '以下是从我订阅的信息源抓取的内容，请整理成《AI 日报》：',
    '',
    String(feeds || '').slice(0, 48000)
  ].join('\n');

  return { sys: sys, user: user };
}

/* ------------------------------------------------------------------ apply */

export function apply(ctx, config) {
  try {
    var cfg = config || {};
    var dir = resolveDir(cfg);
    var scale = cfg.exportScale || 2;
    var log = ctx && ctx.logger;
    var skillDir = null;
    var skillReady = resolveSkillDir(cfg).then(function (d) { skillDir = d; return d; });

    function workDir() {
      return cfg.projectDir || join(homedir(), '.dsh', 'cover-studio');
    }

    var api = {
      dir: dir,
      scale: scale,
      get skillDir() { return skillDir; },
      categories: CATEGORIES,

      listTemplates: function () { return listTemplates(dir); },
      readTemplate: function (file) { return readTemplate(dir, file); },

      listModels: async function () {
        var llm = ctx && ctx.llm;
        if (!llm || typeof llm.listProviders !== 'function') return [];
        var out = [];
        var providers = [];
        try { providers = llm.listProviders() || []; } catch (e) { providers = []; }
        for (var i = 0; i < providers.length; i++) {
          var p = providers[i];
          var id = typeof p === 'string' ? p : (p && (p.id || p.provider));
          if (!id) continue;
          var models = [];
          try { models = await llm.listModels(id); } catch (e) { models = []; }
          var list = Array.isArray(models) ? models : [];
          for (var j = 0; j < list.length; j++) {
            var m = list[j];
            var mid = typeof m === 'string' ? m : (m && (m.id || m.model));
            if (!mid) continue;
            out.push({ ref: id + '/' + mid, provider: id, model: mid, name: (m && m.name) || mid });
          }
        }
        return out;
      },

      generate: async function (params) {
        var route = await pickRoute(ctx, params && params.route);
        if (!route) return { ok: false, error: '没有可用的模型，请先在 Harness 设置里添加提供商' };
        var date = (params && params.date) || new Date().toISOString().slice(0, 10);
        var prompt = buildPrompt(date, (params && params.feeds) || '');
        try {
          var raw = await complete(ctx, route, prompt.sys, prompt.user, 8192);
          var json = extractJson(raw);
          if (!json) return { ok: false, error: '模型没有返回可解析的 JSON', raw: String(raw).slice(0, 800) };
          return { ok: true, data: json, model: route.provider + '/' + route.model };
        } catch (e) {
          return { ok: false, error: String((e && e.message) || e) };
        }
      },

      buildDeck: async function (data, appConfig) {
        if (!skillDir) return { ok: false, error: '找不到 AI 日报 Skill，请在插件设置里指定 skillDir' };
        try {
          var wd = workDir();
          await mkdir(wd, { recursive: true });
          var dataPath = join(wd, 'deck-data.json');
          var cfgPath = join(wd, 'deck-config.json');
          var outPath = join(wd, 'deck.html');
          await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
          if (appConfig) await writeFile(cfgPath, JSON.stringify(appConfig, null, 2), 'utf8');
          var args = ['--data', dataPath, '--out', outPath, '--skill-dir', skillDir];
          if (appConfig) args.push('--config', cfgPath);
          var r = await runNode(join(skillDir, 'scripts', 'build_deck.cjs'), args, wd);
          if (!r.ok) return { ok: false, error: r.stderr || r.error || 'build_deck 失败' };
          return { ok: true, outPath: outPath, dataPath: dataPath, stdout: r.stdout };
        } catch (e) {
          return { ok: false, error: String((e && e.message) || e) };
        }
      },

      buildHyperframes: async function (data, appConfig) {
        if (!skillDir) return { ok: false, error: '找不到 AI 日报 Skill，请在插件设置里指定 skillDir' };
        try {
          /* HyperFrames treats a directory as the project and expects
             index.html inside it, so build into its own folder. */
          var projectRoot = join(workDir(), 'hf-project');
          await mkdir(projectRoot, { recursive: true });
          var dataPath = join(projectRoot, 'deck-data.json');
          var cfgPath = join(projectRoot, 'deck-config.json');
          var outPath = join(projectRoot, 'index.html');
          await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
          if (appConfig) await writeFile(cfgPath, JSON.stringify(appConfig, null, 2), 'utf8');
          var args = ['--data', dataPath, '--out', outPath, '--skill-dir', skillDir];
          if (appConfig) args.push('--config', cfgPath);
          var r = await runNode(join(skillDir, 'scripts', 'build_hyperframes.cjs'), args, projectRoot);
          if (!r.ok) return { ok: false, error: r.stderr || r.error || 'build_hyperframes 失败' };
          return { ok: true, outPath: outPath, projectDir: projectRoot, dataPath: dataPath, stdout: r.stdout };
        } catch (e) {
          return { ok: false, error: String((e && e.message) || e) };
        }
      },

      /** Render the composition to MP4 through the HyperFrames CLI. */
      renderVideo: async function () {
        var projectRoot = join(workDir(), 'hf-project');
        /* Windows blocks npx.ps1 under the default execution policy, so the
           .cmd shim is the only reliable entry point. */
        var npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        var r = await runCmd(npx, ['hyperframes', 'render'], projectRoot);
        if (!r.ok) return { ok: false, error: r.error || 'hyperframes render 失败' };
        /* HyperFrames writes into renders/ with a timestamped name, so take
           the newest mp4 rather than a fixed path. */
        var dirs = [join(projectRoot, 'renders'), join(projectRoot, 'out'), projectRoot];
        var best = null;
        var bestTime = 0;
        for (var d = 0; d < dirs.length; d++) {
          var names;
          try { names = await readdir(dirs[d]); } catch (e) { continue; }
          for (var n = 0; n < names.length; n++) {
            if (!/\.mp4$/i.test(names[n])) continue;
            var full = join(dirs[d], names[n]);
            try {
              var info = await stat(full);
              if (info.mtimeMs > bestTime) { bestTime = info.mtimeMs; best = full; }
            } catch (e) { /* skip unreadable */ }
          }
        }
        if (best) return { ok: true, path: best };
        return { ok: true, path: '', note: 'render 完成，但未找到 mp4' };
      },

      /**
       * Fetch the voice catalogue from a cloud TTS provider.
       *
       * OpenAI-compatible endpoints expose /audio/voices; providers that do not
       * still synthesise fine, so a failed listing falls back to a builtin set
       * rather than blocking the user.
       */
      listVoices: async function (params) {
        var provider = (params && params.provider) || 'openai';
        var baseUrl = String((params && params.baseUrl) || '').replace(/\/+$/, '');
        var key = (params && params.apiKey) || '';
        if (!baseUrl) return { ok: false, error: '缺少 Base URL' };
        if (!key) return { ok: false, error: '缺少 API 密钥' };

        try {
          var res = await fetch(baseUrl + '/audio/voices', {
            headers: { Authorization: 'Bearer ' + key }
          });
          if (res.ok) {
            var body = await res.json().catch(function () { return null; });
            var raw = (body && (body.data || body.voices)) || [];
            var voices = [];
            for (var i = 0; i < raw.length; i++) {
              var v = raw[i];
              voices.push({
                id: String(v.id || v.voice_id || v.name || i),
                name: String(v.name || v.display_name || v.id || i)
              });
            }
            if (voices.length) return { ok: true, voices: voices, source: 'api' };
          }
        } catch (e) {
          /* fall through to the builtin list */
        }

        var fallback = FALLBACK_VOICES[provider] || FALLBACK_VOICES.openai;
        return { ok: true, voices: fallback, source: 'builtin' };
      },

      listTtsPresets: async function (params) {
        var found = await detectTts((params && params.ttsDir) || cfg.ttsDir);
        return { presets: TTS_PRESETS, available: found };
      },

      speak: async function (params) {
        var text = String((params && params.text) || '').trim();
        if (!text) return { ok: false, error: '文本为空' };

        var provider = (params && params.provider) || 'local';
        var voice = (params && params.voice) || 'zh-CN-XiaoxiaoNeural';
        var outDir = join(workDir(), 'audio');

        try {
          await mkdir(outDir, { recursive: true });
          var outPath = join(outDir, 'tts-' + Date.now() + '.mp3');

          if (provider === 'local') {
            /* Prefer the bundled venv: edge-tts.exe exits silently when it has
               no console, so python -m edge_tts is the dependable route. */
            var py = await resolveEdgePython((params && params.ttsDir) || cfg.ttsDir);
            var cmd = py || 'edge-tts';
            var args = py
              ? ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', outPath]
              : ['--voice', voice, '--text', text, '--write-media', outPath];
            var r = await runCmd(cmd, args);
            if (!r.ok) {
              var hint = /403|WSServerHandshake/i.test(String(r.error))
                ? 'edge-tts 被微软拒绝（403）。旧版库的签名已失效，请升级 python -m pip install -U edge-tts，或改用云端 TTS。'
                : 'edge-tts 不可用: ' + (r.error || '未安装');
              return { ok: false, error: hint };
            }
            try {
              if ((await stat(outPath)).size < 512) {
                return { ok: false, error: 'edge-tts 没有产出音频（可能 403），请改用云端 TTS。' };
              }
            } catch (e) {
              return { ok: false, error: 'edge-tts 没有写出文件' };
            }
            return { ok: true, path: outPath };
          }

          /* Every cloud provider below speaks the OpenAI speech contract; the
             base URL is what changes, not the code path. */
          var baseUrl = String((params && params.baseUrl) || '').replace(/\/+$/, '');
          var key = (params && params.apiKey) || '';
          var model = (params && params.model) || 'tts-1';
          if (!baseUrl) return { ok: false, error: '缺少 Base URL' };
          if (!key) return { ok: false, error: '缺少 API 密钥' };

          var res = await fetch(baseUrl + '/audio/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
            body: JSON.stringify({ model: model, input: text, voice: voice, response_format: 'mp3' })
          });

          if (!res.ok) {
            var detail = '';
            try { detail = (await res.text()).slice(0, 300); } catch (e) { /* ignore */ }
            return { ok: false, error: 'HTTP ' + res.status + ' ' + detail };
          }

          var buf = Buffer.from(await res.arrayBuffer());
          if (!buf.length) return { ok: false, error: '服务返回空音频' };
          await writeFile(outPath, buf);
          return { ok: true, path: outPath };
        } catch (e) {
          return { ok: false, error: String((e && e.message) || e) };
        }
      }
    };

    /* Browser channel: one POST route, endpoints dispatched by name. Without
       it the UI can render but cannot reach the host. */
    if (ctx && ctx.connection && ctx.connection.fetch &&
        typeof ctx.connection.fetch.register === 'function') {
      try {
        var handle = async function (endpoint, payload) {
          try {
            if (endpoint === 'models') return { ok: true, value: await api.listModels() };
            if (endpoint === 'generate') return { ok: true, value: await api.generate(payload) };
            if (endpoint === 'build-deck') return { ok: true, value: await api.buildDeck(payload && payload.data, payload && payload.config) };
            if (endpoint === 'build-hyperframes') return { ok: true, value: await api.buildHyperframes(payload && payload.data, payload && payload.config) };
            if (endpoint === 'render-video') return { ok: true, value: await api.renderVideo(payload && payload.path) };
            if (endpoint === 'tts-presets') return { ok: true, value: await api.listTtsPresets(payload) };
            if (endpoint === 'speak') return { ok: true, value: await api.speak(payload) };
            if (endpoint === 'tts-voices') return { ok: true, value: await api.listVoices(payload) };
            if (endpoint === 'status') {
              await skillReady;
              return { ok: true, value: { skillDir: api.skillDir, categories: api.categories } };
            }
            return { ok: false, error: { code: 'cover/not-found', message: 'Unknown endpoint ' + endpoint } };
          } catch (e) {
            return { ok: false, error: { code: 'cover/error', message: String((e && e.message) || e) } };
          }
        };

        ctx.effect(function () {
          return ctx.connection.fetch.register({
            path: ROUTE,
            methods: ['POST'],
            requestBody: 'buffered',
            fetch: async function (request) {
              var body;
              try { body = await request.json(); } catch (e) { body = {}; }
              var result = await handle(String((body && body.endpoint) || ''), body && body.payload);
              return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 'content-type': 'application/json' }
              });
            }
          });
        }, 'cover-studio: api route');
      } catch (err) {
        log && log.warn && log.warn('[dsh-cover-studio] route registration failed: ' + (err && err.message));
      }
    }

    /* ---- DSH tool surface ------------------------------------------------
     * Every editor capability the CLI exposes is also registered as a tool, so
     * an agent can drive the studio without a shell and without a browser.
     * The handlers call the same shared modules the CLI uses, so both paths
     * produce identical geometry and identical HTML.
     * ------------------------------------------------------------------- */
    if (ctx && ctx.tools && typeof ctx.tools.register === 'function') {
      try {
        var toolDir = cfg.projectDir || join(homedir(), '.dsh', 'cover-studio');

        function outPath(name) {
          return join(toolDir, name);
        }

        ctx.tools.register({
          name: 'cover_studio_build',
          description: 'Build a cover page from an AI 日报 deck: deck object → scene → HTML file. Returns the element count and the written path.',
          parameters: {
            type: 'object',
            properties: {
              deck: { type: 'object', description: 'The deck object (brand, date, tone, cover, news[])' },
              out: { type: 'string', description: 'Output HTML path; defaults to <workdir>/cover.html' },
              ratio: { type: 'string', enum: ['16:9', '9:16', '3:4'], description: 'Stage ratio' }
            },
            required: ['deck']
          },
          handler: async function (args) {
            var deck = args && args.deck;
            if (!deck || typeof deck !== 'object') throw new Error('deck is required');
            var ratio = ratioOf((args && args.ratio) || '16:9');
            var scene = deckToScene(deck, ratio);
            var preset = toneOf(deck.tone || 'paper');
            var html = renderPage(scene, preset, {
              width: ratio.w, height: ratio.h,
              title: (deck.brand || 'AI 日报') + ' ' + (deck.date || '')
            });
            var target = (args && args.out) || outPath('cover.html');
            await mkdir(join(target, '..'), { recursive: true }).catch(function () {});
            await writeFile(target, html);
            return {
              ok: true,
              elements: scene.elements.length,
              path: target,
              bytes: html.length,
              ratio: ratio.id
            };
          }
        });

        ctx.tools.register({
          name: 'cover_studio_deck',
          description: 'Render a whole AI 日报 deck to one multi-page HTML file: cover + one page per news item + end card.',
          parameters: {
            type: 'object',
            properties: {
              deck: { type: 'object' },
              out: { type: 'string' },
              gap: { type: 'number', description: 'Vertical gap between pages, default 24' }
            },
            required: ['deck']
          },
          handler: async function (args) {
            var deck = args && args.deck;
            if (!deck || typeof deck !== 'object') throw new Error('deck is required');
            var preset = toneOf(deck.tone || 'paper');
            var ratio = ratioOf((args && args.ratio) || '16:9');
            var pages = [deckToScene(deck, ratio)];
            var news = deck.news || [];
            for (var i = 1; i <= news.length; i++) {
              pages.push({ elements: buildPageElements(i, deck, preset, ratio) });
            }
            var html = renderDeck(pages, preset, {
              width: 1920, height: 1080,
              title: (deck.brand || 'AI 日报') + ' ' + (deck.date || ''),
              gap: (args && args.gap) || 24
            });
            var target = (args && args.out) || outPath('deck.html');
            await mkdir(join(target, '..'), { recursive: true }).catch(function () {});
            await writeFile(target, html);
            return { ok: true, pages: pages.length, path: target, bytes: html.length };
          }
        });

        ctx.tools.register({
          name: 'cover_studio_layout',
          description: 'Re-layout the elements of a scene. mode=scatter mixes square/rectangle/circle/diamond shapes with jitter and rotation; mode=grid/row/align are the tidy variants.',
          parameters: {
            type: 'object',
            properties: {
              scene: { type: 'object', description: 'A scene object with an elements array' },
              mode: { type: 'string', enum: ['scatter', 'grid', 'row', 'align'] },
              shapes: { type: 'array', items: { type: 'string' }, description: 'scatter only: any of square, rect, circle, diamond' },
              jitter: { type: 'number', description: 'scatter only: 0 tidy … 0.5 chaotic' },
              rotate: { type: 'number', description: 'scatter only: max rotation in degrees' },
              cols: { type: 'number', description: 'grid only' },
              gap: { type: 'number' },
              how: { type: 'string', description: 'align only: left|centerX|right|top|centerY|bottom' }
            },
            required: ['scene']
          },
          handler: async function (args) {
            var scene = args && args.scene;
            if (!scene || !Array.isArray(scene.elements)) throw new Error('scene.elements is required');
            var list = scene.elements.filter(function (e) { return !e.hidden; });
            if (!list.length) throw new Error('scene has no elements');

            var mode = (args && args.mode) || 'scatter';
            var box = boundsOf(list);
            var area = { x: box.x, y: box.y, w: box.w || 1920, h: box.h || 1080 };
            var placed;

            if (mode === 'scatter') {
              placed = scatterArrange(list, {
                area: area,
                shapes: (args && args.shapes) || undefined,
                jitter: args && args.jitter,
                rotate: args && args.rotate
              });
            } else if (mode === 'grid') {
              placed = gridArrange(list, (args && args.cols) || undefined, (args && args.gap) || 24,
                { w: 1920, h: 1080 }, { x: area.x, y: area.y });
            } else if (mode === 'row') {
              placed = rowArrange(list, (args && args.gap) || 24, { x: area.x, y: area.y }, box);
            } else {
              placed = alignBoxes(list, (args && args.how) || 'centerX', { w: 1920, h: 1080 });
            }

            applyPlacement(scene, placed);
            return { ok: true, mode: mode, moved: placed.length, scene: scene };
          }
        });

        ctx.tools.register({
          name: 'cover_studio_inspect',
          description: 'Summarise a scene: element count, geometry table, and the union bounding box.',
          parameters: {
            type: 'object',
            properties: { scene: { type: 'object' } },
            required: ['scene']
          },
          handler: async function (args) {
            var scene = args && args.scene;
            if (!scene || !Array.isArray(scene.elements)) throw new Error('scene.elements is required');
            var box = boundsOf(scene.elements);
            return {
              ok: true,
              count: scene.elements.length,
              bounds: box,
              elements: scene.elements.map(function (el) {
                return {
                  key: el.key, type: el.type,
                  x: Math.round(el.x || 0), y: Math.round(el.y || 0),
                  w: Math.round(el.w || 0), h: Math.round(el.h || 0),
                  text: String(el.text || el.category || '').slice(0, 60)
                };
              })
            };
          }
        });

        ctx.tools.register({
          name: 'cover_studio_icons',
          description: 'List the bundled AI model icon library, optionally filtered by vendor or model name.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Case-insensitive match on the model name' }
            }
          },
          handler: async function (args) {
            var q = String((args && args.query) || '').toLowerCase();
            var lib = await loadIconLibrary();
            if (!lib) throw new Error('icon library unavailable');
            var out = {};
            Object.keys(lib.groups).forEach(function (m) {
              if (q && m.toLowerCase().indexOf(q) < 0) return;
              out[m] = lib.groups[m].map(function (v) { return v.variant; });
            });
            return { ok: true, models: Object.keys(out).length, icons: out };
          }
        });
      } catch (err) {
        log && log.warn && log.warn('[dsh-cover-studio] tool registration failed: ' + (err && err.message));
      }
    }

    if (ctx && ctx.reflect && typeof ctx.reflect.provide === 'function') {
      try {
        var dispose = ctx.reflect.provide('coverStudio', api);
        if (typeof ctx.effect === 'function' && typeof dispose === 'function') {
          ctx.effect(function () { return dispose; });
        }
      } catch (err) {
        log && log.warn && log.warn('[dsh-cover-studio] reflect.provide failed: ' + (err && err.message));
      }
    }
  } catch (err) {
    ctx && ctx.logger && ctx.logger.warn &&
      ctx.logger.warn('[dsh-cover-studio] host apply failed: ' + (err && err.message));
  }
}

export const name = 'dsh-cover-studio';
