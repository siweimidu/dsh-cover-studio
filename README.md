# AI 日报封面工作台 · dsh-cover-studio

> DeepSeek Harness 全页插件 — 无限画布拖拽编辑 AI 日报封面，一键渲染成视频。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-plugin-blue)](https://github.com/deepseek-ai)

---

## 这是什么

**AI 日报封面工作台** 是 [AI 日报 Skill](https://github.com/) 的前端编辑器：

- 导入 Skill 生成的 `deck.html` → 在画布上拖拽调整
- 导出 `deck-data.json` → `build_deck.cjs` 渲染成最终 HTML
- 或直接生成 HyperFrames composition → 渲染成 MP4

同时它也是一个**独立的封面设计工具**：169 个 AI 模型图标、16 个纸墨预设、多画板无限画布。

---

## 功能

### 画布

| 功能 | 说明 |
|---|---|
| 无限画布 | 1920×1080 舞台，Ctrl+滚轮以光标为锚点缩放 |
| 多画板 | 最多 20 个画板，自动框选全部可见，持久化到 localStorage |
| 框选 | 拖拽框选批量选中，支持反向拖动、Shift 追加、Alt 强制框选 |
| 吸附 | 画布中线/三分线、元素边缘、等距对齐，Alt 临时关闭 |
| 网格排布 | 2–6 列或自动，间距 0–240px 实时重排 |
| 整体缩放 | 以选区中心为锚点，×0.5 到 ×2，支持文字字号同步 |
| 整体旋转 | −90° 到 +90°，整组像刚体一样转动 |
| 对齐分布 | 左中右/上中下、水平垂直居中、横向纵向分布 |

### 图标库

**169 个 AI 产品 / 1403 个图标 / 109 个厂商卡片**

- 按厂商分组：智谱 AI (11)、字节跳动 (8)、Google (8)、腾讯 (7)…
- 4 列平铺，角标显示图标总数
- **左键拖拽** 拖到画布，**右键** 展开该厂商全部图标
- 右键图标可 **设为卡片封面** / **删除** / **一键恢复全部**
- 128px PNG，139 个有文字标识变体

### 纸墨

| 项 | 说明 |
|---|---|
| 16 个预设 | 8 accent × 2 tone（朱砂 / Claude / 赭石 / 靛青 / 苔绿 / 紫檀 / 绛红 / 石墨） |
| 纸纹 | 160px 瓦片，1px 噪点，7.5% 不透明度，参数与 Skill 的 `deck-css.md` 一致 |
| 暖色渐变 | 朱砂 6% 右上 + 墨色 3% 左下 |
| 画布比例 | 16:9 / 9:16 / 3:4 |

### 内容生成

**信息源** — 每行一个 RSS/网页地址，默认内置 4 个：

```
https://aihot.news/aihot-skill/README.md
https://daily.juya.uk/rss.xml
https://siweimidu.github.io/ai-ribao/feed/zh.xml
https://hex2077.dev/rss-zh-CN.xml
```

**文本生成** — 调用 DSH 已配置的模型，提示词内置 Skill 全部硬约束：

- 六大固定分类（要闻 / 模型发布 / 开发动态 / 产品应用 / 技术与洞察 / 行业动态）
- caption 不得以句号结尾，15–28 字
- metrics 1–3 块，value 用「万/亿」
- title 不重复，summary 不用省略号

### 配音

| 类型 | 厂商 | 音色 |
|---|---|---|
| 本地 | EdgeTTS | 晓晓 / 云希 / 云扬 / 晓伊 + 5 个 |
| 云端 | OpenAI | alloy / echo / fable / onyx / nova / shimmer |
| 云端 | MiniMax | 青涩青年 / 少女 / 播报男声 / 播报女声 |
| 云端 | Azure / 火山 / 自定义 | 填 Base URL + Key |

自定义项支持任意 **OpenAI 兼容**网关（vLLM、FastAPI、one-api 等）。

### 切换音

6 个 Web Audio 实时合成的音效，无版权素材：

| 预设 | 音色设计 |
|---|---|
| 清脆铃 | C6 → E6 → G6 三音上行 |
| 气泡 | 880 → 440Hz 下滑 |
| 玻璃 | 2093 + 3136 + 4186Hz 泛音 |
| 木琴 | 523Hz 三角波 + 二倍频 |
| 金币 | A5 → E6 方波 |
| 滑过 | 带通噪声 1800→3600Hz |

### 视频渲染

| 按钮 | 调用 |
|---|---|
| 生成 composition.html | Skill 的 `build_hyperframes.cjs` |
| 渲染成 MP4 | `npx hyperframes render` |
| 生成 Skill deck.html | Skill 的 `build_deck.cjs` |

实测：43 KB composition → 1.5 MB / 40 秒视频，渲染耗时 1 分 40 秒。

---

## 安装

### 前置

- DeepSeek Harness ≥ 最新版
- Node.js ≥ 22
- （可选）AI 日报 Skill 解压到 `D:\Skills\AI日报\`

### 从源码安装

```bash
git clone https://github.com/siweimidu/dsh-cover-studio.git
cd dsh-cover-studio

# 装到 DSH 的 desktop profile
dsh plugin --profile desktop add file:$(pwd)
```

Windows：

```powershell
dsh plugin --profile desktop add file:D:\path\to\dsh-cover-studio
```

重启 DSH，左侧栏出现「封面工作台」。

### 手动安装

把整个目录复制到：

```
C:\Users\<你>\.dsh\profiles\desktop\node_modules\@local\dsh-cover-studio\
```

---

## 使用

### 1. 导入已有日报

工具栏「导入 HTML」→ 选 Skill 生成的 `deck.html` → 自动解析成画板。

### 2. 从 RSS 生成

左侧「信息源」填地址 → 「文本生成」点「生成日报」→ 自动生成封面 + 每页画板。

### 3. 手动设计

- 左侧调色板**左键拖**图标到画布
- **右键**厂商卡片看全部图标
- 右侧「纸墨」选预设
- 画布空白处**拖拽框选**，按 Delete 删除

### 4. 导出

| 格式 | 位置 |
|---|---|
| PNG / JPG | 工具栏「导出 PNG」/「全部页」 |
| 单文件 HTML | 工具栏「HTML」 |
| deck-data.json | 工具栏「导出 JSON」 |

### 5. 渲染视频

右侧「渲染视频」→「生成 composition.html」→「渲染成 MP4」。

---

## 快捷键

| 键 | 功能 |
|---|---|
| Ctrl+Z / Ctrl+Shift+Z | 撤销 / 重做 |
| Ctrl+滚轮 | 以光标为锚点缩放 |
| Ctrl+0 | 适应窗口 |
| Ctrl+= / Ctrl+- | 放大 / 缩小 |
| 空格+拖拽 / 中键拖拽 | 平移画布 |
| Delete / Backspace | 删除选中 |
| Escape | 取消选择 |
| 方向键 | 微调 1px（Shift 10px） |
| Shift+点击 | 追加选中 |
| Alt+拖拽 | 强制框选 |

---

## 项目结构

```
dsh-cover-studio/
├── package.json          # 插件元数据 + dsh 声明
├── cordis.patch.yml      # 插件注入配置
├── lib/
│   ├── index.js          # 宿主侧：LLM / TTS / Skill 桥接 / HTTP 路由（30 KB）
│   └── client.js         # 浏览器侧：整个编辑器（9.9 MB，含内联图标）
├── src/
│   └── client/
│       ├── engine.js     # 纯逻辑：吸附、对齐、历史、几何
│       ├── skill-bridge.js  # deck-data ↔ scene 转换
│       └── icons.json    # 图标源数据
├── assets/logos/         # 早期 SVG 素材
├── templates/            # HTML 模板
└── README.md
```

### 通信架构

前端与宿主通过一条 POST 路由：

```
POST api/cover-studio
{ "endpoint": "generate", "payload": {...} }
→ { "ok": true, "value": {...} }
```

八个端点：

| 端点 | 功能 |
|---|---|
| `status` | Skill 路径 / 分类 |
| `models` | 可用模型列表 |
| `generate` | 生成 deck-data |
| `build-deck` | deck.html |
| `build-hyperframes` | composition.html |
| `render-video` | MP4 |
| `tts-presets` | 音色 + 本地可用性 |
| `tts-voices` | 云端音色列表 |
| `speak` | 合成音频 |

---

## 开发

```bash
# 语法检查
node --check lib/index.js
node --check lib/client.js

# 本地验证（无 DSH 环境）
node -e "import('./lib/index.js').then(m => console.log(m.name))"
```

修改后同步到 profile：

```powershell
robocopy . C:\Users\<你>\.dsh\profiles\desktop\node_modules\@local\dsh-cover-studio /MIR
```

---

## 兼容性

- 依赖 `apply(ctx, config)` 和可选的 `ctx.reflect`
- 其他 DSH 服务（`ctx.llm` / `ctx.connection`）运行时探测，缺失时降级而非崩溃
- 所有 UI 令牌读 `--dsw-*`，自动跟随亮/暗主题

---

## 已知限制

| 项 | 说明 |
|---|---|
| 画板上限 | 20 个（防卡顿） |
| 图标体积 | 9.9 MB 内联，首次加载需 1–2 秒 |
| EdgeTTS 403 | 打包版 7.2.x 已被微软拒绝，需系统 python 装 7.3.x |
| HyperFrames | 需要 `npx.cmd`（PowerShell 禁止 .ps1） |
| 锁定元素 | `locked` 元素不参与框选，设计如此 |

---

## 致谢

图标来自：
- [@lobehub/icons-static-svg](https://github.com/lobehub/lobe-icons) 1.98.0 (MIT)
- App Store 官方 artwork
- 各厂商官网 / 官方 GitHub

纸纹、版式、数据 Schema 遵循 **AI 日报 Skill** 的硬约束。

---

## 许可

MIT © 2026 dsh-cover-studio contributors

商标归各自权利方所有，图标仅用于识别目的。

## 视口持久化

### 问题

每次打开工作台，画板都贴在左上角，不记得上次看到哪里。

```js
var _pan = useState({ x: 0, y: 0 });   // ← 永远从原点开始
var _zoom = useState(0);               // ← 永远 fit 模式
```

### 修复

新增存储键，记录 `pan` / `zoom` / `activeBoard`：

```
dsh.cover-studio.view.v1
```

```js
function loadView() {
  var v = JSON.parse(localStorage.getItem(VIEW_KEY));
  if (!v || typeof v.panX !== "number") return null;
  return v;
}

var _pan = useState(savedView
  ? { x: savedView.panX, y: savedView.panY }
  : { x: 0, y: 0 });
```

### 防抖写入

平移时 `pointermove` 每帧触发，localStorage 是同步 API，直接写会卡。400ms 防抖：

```js
viewTimer.current = setTimeout(function () {
  saveView({ panX: pan.x, panY: pan.y, zoom: zoom, activeBoard: activeBoard });
}, 400);
```

### 首次打开自动居中

没有存档时（第一次用），画板自动居中而非贴左上角：

```js
var fit = Math.min((vw - 80) / spec.w, (vh - 80) / spec.h);
setZoom(fit);
setPan({
  x: (vw - spec.w * fit) / 2 - bx * fit,
  y: (vh - spec.h * fit) / 2 - by * fit
});
```

### 存档校验

| 情况 | 结果 |
|---|---|
| JSON 损坏 | 返回 null，走首次居中 |
| 缺 `panX`/`panY` | 返回 null |
| 正常 | 精确恢复 |
