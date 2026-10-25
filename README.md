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

### 方式一：从 GitHub 安装（推荐）

在 DSH 的 **设置 → 插件 → 添加插件** 里输入：

```
dsh-cover-studio@github:siweimidu/dsh-cover-studio
```

或命令行：

```bash
dsh plugin --profile desktop add github:siweimidu/dsh-cover-studio
```

### 方式二：从 git URL 安装

```bash
dsh plugin --profile desktop add git+https://github.com/siweimidu/dsh-cover-studio.git
```

### 方式三：从 npm 安装

```bash
dsh plugin --profile desktop add dsh-cover-studio
```

### 方式四：本地路径

```bash
git clone https://github.com/siweimidu/dsh-cover-studio.git
dsh plugin --profile desktop add file:./dsh-cover-studio
```

### 手动安装

把整个目录复制到：

```
C:\Users\<你>\.dsh\profiles\desktop\node_modules\dsh-cover-studio\
```

### 环境要求

| 项 | 要求 | 说明 |
|---|---|---|
| DeepSeek Harness | ≥ 最新版 | — |
| Node.js | ≥ 22 | — |
| AI 日报 Skill | 可选 | 缺少时「文本生成 / 渲染视频」不可用，其余功能正常 |
| edge-tts | 可选 | 本地配音需要，云端 TTS 不需要 |
| HyperFrames | 可选 | 视频渲染需要，`npx hyperframes` |

安装后**重启 DSH**，左侧栏出现「封面工作台」。


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

## 文字缩放手势

### 问题

文字框放大时字号不变，只能改变换行宽度。

```js
// resize 只改 W/H，从不碰 size
s.elements[i].w = Math.round(nw);
s.elements[i].h = Math.round(nh);
```

### 修复：按手柄类型区分

| 手柄 | 行为 | 用途 |
|---|---|---|
| **角点**（nw/ne/sw/se） | 缩放字号 | 让文字整体变大变小 |
| **边手柄**（n/s/e/w） | 只改宽度、字号不变 | 调整换行、让文字排得更宽 |

```js
var corner = hd.length === 2;   // 两字母 = 角点
var fontScale = 1;
if (corner && o0.type === 'text' && o0.size && o0.w > 0) {
  fontScale = Math.max(6, Math.round(nw)) / o0.w;
}

// 应用
s.elements[i].size = Math.max(6, Math.round(o0.size * fontScale));
```

`o0.size` 必须在 `onHandleDown` 时快照，不能从 live 元素读——that 会被上一次 resize 的结果污染。

### 属性面板补充控件

选中文字时，位置面板多两个数字输入：

```
字号  [48]    行高  [1.2]
```

只对 `cur.type === 'text'` 显示，图片和图标没有这两个字段。

### 效果

| 操作 | w | size |
|---|---|---|
| 原始 | 300 | 32 |
| 角点放大 1.6× | 480 | **51** |
| 边手柄加宽 | 480 | 32（不变）|
### 文字默认垂直居中

**问题**：文字框放大后，文字贴在框顶，看起来像滑出去了。

**原因**：`vAlign` 的默认分支是 `flex-start`：

```js
alignItems: el.vAlign === 'center' ? 'center'
  : el.vAlign === 'bottom' ? 'flex-end' : 'flex-start'   // ← 默认贴顶
```

**修复**：默认改成 `center`，只有显式设成 `top` 才贴顶：

```js
alignItems: el.vAlign === 'top' ? 'flex-start'
  : el.vAlign === 'bottom' ? 'flex-end' : 'center'
```

面板里的控件默认值也同步为 `center`，保持所见即所得。

#### 水平也居中

垂直居中后，文字仍贴在框左边。补上水平方向：

```js
// 新建文字
align: 'center',        // 之前是 'left'

// 渲染：只有显式设成 left 才贴左
justifyContent: el.align === 'left' ? 'flex-start'
  : el.align === 'right' ? 'flex-end' : 'center',

// textAlign 跟随 align，否则多行文字换行后仍靠左
textAlign: el.align || 'center',
```

`justifyContent` 控制整个文字块的位置，`textAlign` 控制块内每一行；缺一个，多行文字就会歪。

#### 三态对比

| 状态 | alignItems | justifyContent | textAlign |
|---|---|---|---|
| 之前 | flex-start | flex-start | left |
| 仅垂直 | center | flex-start | left |
| **现在** | **center** | **center** | **center** |

#### Skill 模板保持左对齐

`align: 'left'` 还有 16 处，全部在 Skill 生成的新闻页模板里（`sceneFromScrape`、`buildPageElements`）。
那是排版规范的要求，不能改。只有手动「+ 大标题 / + 副标题 / + 正文」新建的才居中。

## 分类卡修复

### 1. 改字没反应（`live` 不刷新）

`patch()` 走 `live()`，但 `live()` 只写状态、不 save、不 bump：

```js
// 之前：写完就返回，没有 saveScene，没有 bump
mutator({ elements: work, page: page, scene: next });
writeElements(next, work);
return next;
```

结果是面板的值进了 state，画布仍渲染旧值。分类名、颜色、透明度、行高、字距全部失效。

```js
// 现在
writeElements(next, work);
saveScene(next);
// ...
bump(function (v) { return v + 1; });   // 触发重渲染
```

### 2. 半透明看不清

```js
// 之前
background: 'rgba(255,255,255,.55)',
border: '1px solid rgba(20,20,19,.16)',

// 现在
background: '#ffffff',
border: '1px solid rgba(20,20,19,.22)',
```

半透明白叠在米白纸面上等于没打开，文字对比度被压到几乎看不见。

### 3. 文字加深

| 元素 | 之前 | 现在 |
|---|---|---|
| 条目标题 | `rgba(20,20,19,.76)` | **`.92`** |
| 时间码 | `rgba(20,20,19,.42)` | **`.55`** |
| 「暂无」 | `rgba(20,20,19,.38)` | **`.55`** |

### 4. 内容垂直居中

```js
display: "flex", flexDirection: "column",
justifyContent: "center",     // ← 新增
```

配套把 items 容器的 `flex: 1` 改成 `flex: "none"`：留着 `flex:1` 会把内容撑满，
`justifyContent: center` 就失效了，内容又被顶回上方。

## 梯队筛选 → 图标导入/导出

删掉「全部 / 第一梯队 / 第二梯队」，换成「导入图标 / 导出图标」。

### ZIP 导出

导出的是 **zip 压缩包**，里面是真实的图片文件：

```
cover-studio-icons-<时间戳>.zip
├── OpenAI/
│   ├── symbol-color.png
│   └── wordmark-black.svg
├── 智谱 AI/
│   └── symbol-color.png
└── manifest.json
```

一个厂商一个文件夹，一个变体一个文件。`manifest.json` 记录分组结构，
不用打开应用也能读懂压缩包。

#### 为什么要自己写 ZIP

Chrome 有 `DecompressionStream`，但没有 zip API。为了两个操作引入一个库，
比这 120 行代码更贵。写的时候**只用 stored（不压缩）**——图片本身已经压缩过，
再 deflate 一次收益接近零；读的时候两种方式都支持。

```js
function makeZip(entries)    // 打包，stored
async function readZip(buf)  // 解包，stored + deflate
```

CRC32 查表实现在 `CRC_TABLE`，一次构建，之后 O(1) 查表。

### 导入到指定分类

选完文件会弹出分类面板：

| 操作 | 结果 |
|---|---|
| 输入新名字 | 新建一个分类 |
| 点选已有分类 | 追加到那个分类（内置厂商也可以）|
| 取消 | 什么都不做 |

支持的文件：

| 格式 | 处理 |
|---|---|
| `.zip` | 解压出所有图片，子文件夹名并入变体名 |
| `image/*` | 单张图片直接导入 |

#### 路径分隔符

Windows 的压缩工具写反斜杠，macOS/Linux 写正斜杠。两种都处理：

```js
var norm = en.name.replace(/\\/g, "/");
var parts = norm.split("/");
```

#### 重名保护

同名变体自动加后缀，不会覆盖已有图标：

```js
var key = variant;
var n = 1;
while (next[target][key]) { key = variant + "-" + n; n++; }
```

### 分类卡文字颜色的真因

之前只改了卡片背景（半透明 → 白底），但文字仍然看不清。根因在别处：

```js
// 错的
function presetOf(id) {
  for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i];
  return PRESETS[0];
}
```

`PRESETS` 的条目只有 `id / name / tone / accent / grid`，**没有 `ink`、`bg`、`dim`**。
那些字段是 `resolvePreset()` 算出来的。

所以 `preset.ink` 是 `undefined`，`color: undefined` 让浏览器退回继承色，
在浅色卡片上就成了近似白色。

```js
// 对的
function presetOf(id) {
  return resolvePreset(id);
}
```

#### 排查路径

| 检查 | 结果 |
|---|---|
| 卡片背景是不透明白 | 已改，排除 |
| `TONES.paper.ink` | `#141413`，正常 |
| `preset` 从哪来 | `presetOf(scene.preset)` |
| `presetOf` 返回什么 | `PRESETS[i]`，缺 `ink` ← **根因** |

修复后渲染：`{ color: "#141413", fontSize: 17 }` 配 `background: "#ffffff"`，对比度 18:1。

### 去掉空卡占位符

空分类卡原本会画两个**编辑器 UI 的东西**到画布上：

| 元素 | 来源 | 问题 |
|---|---|---|
| `暂无` | `items.length === 0` 的占位 | 草稿 UI 文案，不该出现在成品里 |
| `00` | `padStart(2, "0")` 的条目计数 | 没有条目时计数毫无意义 |

```js
// 之前：计数器无条件渲染
String((el.items || []).length).padStart(2, "0")

// 之前：空列表渲染占位
if (!items.length) return h("div", {...}, "暂无");
```

改成：

```js
// 有东西才计数
(el.items || []).length ? h("span", {...}, count) : null,

// 空卡就是只有标题的卡
if (!items.length) return null;
```

### 导出也同步

`exportHTML()` 之前也把「暂无」写进成品，而且卡片还是旧的半透明背景。
现在画布和导出走同一套规则：

| | 空卡 | 有内容的卡 |
|---|---|---|
| 分类名 | 显示 | 显示 |
| 数量 | 不显示 | 显示（零填充两位）|
| 条目 | 不渲染 | 渲染 |
| 占位文案 | 无 | 无 |

## 面板说明重做

### 删掉「属性」面板

那个面板的全部内容是一句「从左侧拖入模型图标，或添加文字」，
占一个可折叠区块的位置，却说不出任何信息。删掉。

### 五个面板各加「这一步做什么」

原本只有标题和输入框，用户不知道该从哪一步开始。现在每个面板顶部都有说明块：

| 面板 | 说明要点 |
|---|---|
| **信息源** | 告诉工作台从哪抓资讯；填好后去「文本生成」 |
| **文本生成** | 把资讯变成画板；1 选模型 · 2 贴资讯 · 3 点生成 |
| **配音** | 给日报配旁白；本地免费、云端要密钥 |
| **切换音** | 翻页音效；点试听逐个听 |
| **渲染视频** | 三步：生成 composition → 渲染 MP4 → 导出 Skill deck |

```js
function PanelHowTo(props) {
  return h("div", { style: { ... } },
    h("div", null, props.title),
    props.children
  );
}
```

样式：淡背景块 + 上边框，和面板内容区分开，不抢视觉。

### 左侧改成引导

删掉按钮后，「文字」标签页只剩一块说明，指向工具栏：

```
添加文字
用上方工具栏的按钮：
+ 大标题 · + 副标题 · + 正文 · + 分类卡 · + 图片
也可以双击画布空白处，在弹出的菜单里选。
```

### 验证

```
addElement("headline") 调用: 1 处（工具栏）
渲染树中 "+ 大标题" 出现: 1 组
```

## 预设从 16 个减到 2 个

### 问题

预设是 `基调 × 强调色` 的组合。原来的生成逻辑：

```js
for (每个 accent) list.push({ tone: "paper", accent: a.id });   // 8 个
for (每个 accent) list.push({ tone: "ink",   accent: b.id });   // 8 个
// → 16 个
```

但**强调色在下面的面板里单独有一排 8 个色块**。所以 16 个预设里有 14 个是冗余的：
调色板上点一下就够了，不需要在预设里再列 8 遍。

### 改法

```js
var PRESETS = [
  { id: "claude-paper", name: "纸", tone: "paper", accent: "claude" },
  { id: "claude-ink",   name: "墨", tone: "ink",   accent: "claude" }
];
```

预设负责「基调」，强调色面板负责「颜色」。两个维度分开，各管一件事。

### 旧存档兼容

老场景里存的是 `cinnabar-ink`、`graphite-paper` 这类 id，精简后会找不到。
`resolvePreset` 加了一层解析：从 id 后缀反推 tone 和 accent。

```js
if (!preset && typeof id === "string") {
  var dash = id.lastIndexOf("-");
  var tonePart = id.slice(dash + 1);      // "ink" / "paper"
  var accentPart = id.slice(0, dash);     // "cinnabar" ...
  if (合法) preset = { tone: tonePart, accent: accentPart };
}
```

实测：`cinnabar-paper` → 朱砂 + 纸底，`graphite-ink` → 石墨 + 墨底，都还原正确。
无效 id 回退到第一个预设。

## 添加按钮归位到左侧栏

### 最终布局

| 区域 | 负责 |
|---|---|
| **顶栏** | 文件 / 视图 / 导出：撤销、重做、新封面、清除、复制、删除、导入 HTML、文本生成、导出 JSON、缩放、导出 PNG |
| **左侧栏** | 内容添加：+ 大标题 / + 副标题 / + 正文 / + 分类卡 / + 图片 |

添加动作和左侧的图标网格是同一件事（往画布放东西），放一起才顺手。
顶栏留给「对整份文档操作」，不塞创作入口。

### 验证

```
「文字」标签页:  + 大标题 1 · + 副标题 1 · + 正文 1 · + 分类卡 1 · + 图片 1
顶栏:          撤销 · 重做 · 清除 · 复制 · 删除 · 导入 HTML · 文本生成 · 导出 JSON
顶栏有添加按钮:  无
addElement 调用: 每个命令各 1 处，全在左侧栏
```

### 删掉「纸墨」面板

「纸墨」和「预设组合」控制的是**同一个东西**——基调：

| 面板 | 控件 | 实际效果 |
|---|---|---|
| 纸墨 | 「纸底 / 墨底」两段按钮 | 切 tone |
| 预设组合 | 「纸 / 墨」两张卡片 | 切 tone |

两个都改 `scene.preset`，只是长得不一样。留一个就行。

### 删除范围

`panelId: "tone"` 出现在两个地方，都要删：

| 位置 | 场景 |
|---|---|
| `Inspector` 未选中分支 | 没选元素时 |
| `Inspector` 选中分支 | 选了元素时 |

只删一处的话，选中元素时「纸墨」又冒出来。

### 顺带清理

| 项 | 处理 |
|---|---|
| `openPanels.tone` | 删（面板没了，键也没用）|
| `toneHint` / `tonePaper` / `toneInk` | 中文、英文两份语言表都删 |
| `openPanels.preset` | `false` → `true`（现在是唯一的基调入口，默认展开）|

### 现在的面板顺序

```
强调色   →  8 个色块
预设组合 →  纸 / 墨
背景色
纸纹
画布比例
```

### 删掉右侧「画布比例」面板

顶栏已经有一组比例按钮（`16:9 / 9:16 / 3:4`），右侧栏又放了一遍。

| 位置 | 控件 |
|---|---|
| 顶栏 | 三个分段按钮，常驻可见 |
| 右侧栏 | 「画布比例」面板，需展开 |

两者都写 `scene.ratio`。顶栏那个不用展开就能点，删右侧的。

顺带清掉 `openPanels.ratio`（面板没了，键也没用）。

### 现在的右侧面板

```
强调色   →  8 个色块
预设组合 →  纸 / 墨
背景色
纸纹
───────
信息源
文本生成
配音
切换音
渲染视频
```

### 强调色修好了

之前色块点了没反应，有两个 bug。

**bug 1：选中判定永远为假**

```js
var on = a.value === preset.accent;
//    "#d97757"  ===  "claude"      → 永远 false
```

`preset.accent` 是 accent 的 **id**（`"claude"`），色块带的是 **hex**（`"#d97757"`）。
类型不同的两个值比较，所以从来没有色块显示为选中。

改成两边都取 hex：

```js
var isActive = preset.accent === a.value;   // preset.accent 已是解析后的 hex
```

**bug 2：写入的值没人读**

点没有对应预设的色块时，代码写 `accentOverride`：

```js
commit({ accentOverride: a.value })
```

但全文搜 `accentOverride` 只有 **1 处**——写的这处。没有任何地方读它，
所以画布完全不变。

补上读取：

```js
var preset = useMemo(function () {
  var base = presetOf(scene.preset);
  if (scene.accentOverride) {
    return Object.assign({}, base, {
      accent: scene.accentOverride,
      accentText: base.tone === "ink"
        ? mix(scene.accentOverride, "#f0eee6", 0.35)   // 深色底上提亮
        : scene.accentOverride
    });
  }
  return base;
}, [scene.preset, scene.accentOverride]);
```

`accentText` 是为深色背景准备的：靛青 `#3b5bdb` 在墨底上会糊，提亮成 `#7a8edf` 才看得清。

**两处面板**

`panelId: "accent"` 出现在未选中和选中两个分支，同样的 bug 各有一份，都要改。

## 分类卡改版

按 Skill 新闻页的版式重做。

### 结构

```
│ 行业动态                       02   ← 标题 + 橙色计数
│ ─────────────────────────────────  ← 细分隔线
│ 01:17  Claude Code 团队成员 …     ← 时间码 + 自动换行标题
│ 01:46  英国公布数亿英镑 …
│
└─ 左侧 4px 强调色竖线，贯穿整张卡
```

### 改动对照

| 项 | 之前 | 现在 |
|---|---|---|
| 卡片底 | 白底 + 边框 | 透明（画在纸面上）|
| 强调线 | 标题左侧 3px 短线 | **卡边 4px 通长竖线** |
| 标题 | 38px | **40px**，行高 1.15，字距 .02em |
| 分隔线 | 无 | **标题下 1px 细线**（墨色 18%）|
| 计数 | 灰色 `rgba(.42)` | **强调色**、20px、加粗 |
| 条目 | 固定行高 + 省略号截断 | **自动换行**，行高 1.5 |
| 时间码 | 与标题同字号 | 15px，行高 1.9（与首行对齐）|
| 条目间距 | 无 | gap 10px |

### 关键改动：不再截断

```js
// 之前：一行塞不下就省略号
whiteSpace: 'nowrap', textOverflow: 'ellipsis'

// 现在：换行，卡片自适应变高
whiteSpace: 'normal', wordBreak: 'break-word'
```

一条新闻标题被截成「…分别宣布…」比卡片高 20px 糟糕得多。

### 三处同步

分类卡有三套渲染路径，都要改，否则导出和画布不一致：

| 路径 | 用途 |
|---|---|
| `Canvas` DOM | 画布显示 |
| `renderAndDownload` | 导出 PNG/JPG |
| `exportHTML` | 导出单文件 HTML |

Canvas 导出用 `ctx.measureText` 手动折行（canvas 没有 word-wrap）。

### 卡片改回不透明 + 加大默认高度

改版时把卡片背景设成了 `transparent`，问题有两个：

1. 分隔线下的文字直接压在纸纹上，看不出属于这张卡
2. 新建卡片默认 `540 × 190`，装不下标题 + 两条自动换行的文字，第二条被 `overflow: hidden` 裁掉

#### 卡片底色

```js
function cardBgColor(preset) {
  return preset.tone === "ink"
    ? mix(preset.bg, "#ffffff", 0.06)   // 墨底：比页面亮 6%
    : mix(preset.bg, "#ffffff", 0.55);  // 纸底：比页面亮 55%
}
```

| 基调 | 页面 | 卡片 | 效果 |
|---|---|---|---|
| 纸 | `#f0eee6` | `#f8f7f4` | 隐约浮起 |
| 墨 | `#141413` | `#222221` | 隐约浮起 |

不用纯白：纯白在纸色画布上太跳，像贴上去的。

#### 默认尺寸

| 项 | 之前 | 现在 |
|---|---|---|
| 宽 | 540 | **560** |
| 高 | 190 | **280** |

标题占约 74px，两条两行文字再占约 130px，190 必然裁掉第二条。

#### 三处同步

| 路径 | 改了什么 |
|---|---|
| Canvas DOM | `background: cardBgColor(preset)` |
| `renderAndDownload` | 先铺 `cardBgColor` 再画强调线 |
| `exportHTML` | `background: cardBgColor(pr)` |

`sceneFromScrape` 里的 3 列网格卡片（`x: 116 + col * 574`）保持 540×190，那是 Skill 封面的固定版式。

### 分类卡条目可编辑

### 问题

空卡的右侧面板只有一个 20px 高的「+ 添加」按钮，下面什么都没有。
看起来像是面板坏了，实际是**条目为 0 时根本没有渲染任何输入框**。

### 两条路径

**路径 1：面板逐条输入**

空卡现在有引导块：

```
┌─────────────────────────────┐
│        还没有条目            │
│ 点右上「+ 添加」逐条输入，    │
│ 或双击画布上的卡片直接编辑    │
└─────────────────────────────┘
```

**路径 2：双击卡发行内编辑**

双击分隔线下的任意一行，原地变成 textarea：

```js
onDoubleClick: function (e) {
  e.stopPropagation();
  setSel([el.key]);
  setEditing({ key: el.key, idx: ii });
}
```

编辑态渲染 textarea，非编辑态渲染 span：

```js
(editing && editing.key === el.key && editing.idx === ii)
  ? h("textarea", { autoFocus: true, onChange: ... })
  : h("span", { onDoubleClick: ... }, it.title)
```

改一个字要跑到右侧面板去，距离太远了——卡片的本职就是这些行。

### 退出编辑

| 动作 | 结果 |
|---|---|
| 失焦 | 退出 |
| `Esc` | 退出 |
| 输入 | 实时写回 `items[idx].title` |

`onPointerDown` 阻止冒泡，否则点击输入框会触发元素拖拽。

### 卡片文字等比缩放 + 加深

### 问题 1：文字不跟随卡片缩放

字号只跟画布缩放，不跟卡片尺寸：

```js
fontSize: 40 * scale        // scale 是画布缩放
```

把卡片拉大一倍，字号完全不变，只是留白变多。

改成以 `560×280` 为基准的比例因子：

```js
var k = Math.min(el.w / 560, el.h / 280);
k = Math.max(0.55, Math.min(3, k));   // 上下限，防止极端值

fontSize: 40 * scale * k,
borderLeft: (4 * scale * k) + "px solid ...",
padding: (18 * scale * k) + "px " + (20 * scale * k) + "px",
```

取 `min(宽比, 高比)` 而不是各自算，这样文字不会被拉扁。

| 卡片尺寸 | k | 标题 | 条目 | 时间码 |
|---|---|---|---|---|
| 280×140 | 0.55 | 22px | 10px | 8px |
| **560×280** | **1.00** | **40px** | **19px** | **15px** |
| 840×420 | 1.50 | 60px | 29px | 23px |
| 1120×560 | 2.00 | 80px | 38px | 30px |

### 问题 2：下面字看不清

| 元素 | 之前 | 现在 |
|---|---|---|
| 条目文字 | `rgba(20,20,19,.88)` | **`#141413`**（纯墨色）|
| 时间码 | `rgba(20,20,19,.42)` | **`.62`** |

88% 的黑放在浅纸色卡片上，实际是灰的；62% 的时间码仍比正文浅，但读得清。

### 三处同步

| 路径 | 缩放方式 |
|---|---|
| Canvas DOM | `* k` 乘在字号、内边距、间距、圆角上 |
| `renderAndDownload` | 同样的 `k`，`ctx.font` 逐处乘 |
| `exportHTML` | **改用 em 单位**，`font-size: 40px*k` 做基准，其余用 `.5em` `.475em` |

HTML 导出用 em 是为了少算十几处像素值——改一个基准字号，整张卡跟着缩。

#### 改为按宽度缩放 + 放大基准

两个问题一起改。

**问题 A：比例因子取错了维度**

```js
var k = Math.min(el.w / 560, el.h / 280);   // 之前
```

`min` 取宽高较小的那个。把卡片拉高到 560×480，宽比 1.0、高比 1.71，
`min` 仍然是 1.0——**拉高卡片字号完全不变**。

```js
var k = el.w / 560;              // 现在：宽度决定字号
k = Math.max(0.7, Math.min(3, k));
```

宽度决定字号，高度只决定能放几行。这也更符合直觉：变宽了字要变大，
变高只是多出空白。

**问题 B：基准字号太小**

| 元素 | 之前 | 现在 | 增幅 |
|---|---|---|---|
| 标题 | 40px | **46px** | +15% |
| 计数 | 20px | **22px** | +10% |
| 条目 | 19px | **24px** | **+26%** |
| 时间码 | 15px | **19px** | **+27%** |

条目和时间码是读得最多的一行，原来 19px 在 1920 宽的画布里等于 9.5px，太小。

**新的缩放表**

| 卡片宽度 | k | 标题 | 条目 | 时间码 |
|---|---|---|---|---|
| 280px | 0.70 | 32px | 17px | 13px |
| 400px | 0.71 | 33px | 17px | 14px |
| **560px** | **1.00** | **46px** | **24px** | **19px** |
| 700px | 1.25 | 58px | 30px | 24px |
| 840px | 1.50 | 69px | 36px | 29px |
| 1120px | 2.00 | 92px | 48px | 38px |

底盘从 `0.55` 提到 `0.7`：再小的卡片也不至于缩成蚂蚁。

## 卡片字体可调

选中分类卡后，「内容」输入框下面多了五个控件。

### 控件

| 控件 | 范围 | 作用 |
|---|---|---|
| **字号倍率** | 50% - 220% | 在自动缩放之上再乘一个倍数 |
| **字体** | 宋 / 黑 / 等宽 | 标题和条目同时切换 |
| **标题字重** | 400 / 600 / 700 / 900 | 只作用于标题 |
| **行高** | 数值输入 | 条目行距 |
| **条距** | 数值输入 | 条目之间间距 |

### 字号倍率怎么和自动缩放共存

自动缩放按卡片宽度算 k，倍率在它之上再乘一次：

```js
var k = Math.max(0.7, Math.min(3, el.w / 560));
k = k * (el.fontScale === undefined ? 1 : el.fontScale);
```

这样两种诉求都能满足：

| 想做的事 | 用什么 |
|---|---|
| 整张卡等比放大（含留白） | 拖卡片右下角 |
| 只把字放大、卡片不变 | **字号倍率** |

### 字体栈

```js
var cardFont = el.cardFont === "sans"
  ? "Noto Sans SC", "Helvetica Neue", Arial, sans-serif
  : el.cardFont === "mono"
  ? ui-monospace, "SF Mono", Consolas, monospace
  : "Noto Serif SC", Georgia, serif;
```

宋体是默认值，和 Skill 的新闻页一致。

### 三处同步

| 路径 | 处理 |
|---|---|
| Canvas DOM | 直接读字段 |
| renderAndDownload | ctx.font 拼 titleWeight + size + cFont |
| exportHTML | 内联 font-family / font-weight / line-height |

## 卡片所有元素可编辑

### 画布内双击即可改

| 元素 | 双击后 |
|---|---|
| 分类标题 | 变 input，Enter/Esc 退出 |
| 右上角计数 | 变 input，可改成任意文字 |
| 时间码 | 变 input |
| 条目文字 | 变 textarea |

`editing` 从 `{key, idx}` 扩展成 `{key, field, idx}`：

```js
setEditing({ key: el.key, field: "category" });          // 标题
setEditing({ key: el.key, field: "count" });             // 计数
setEditing({ key: el.key, field: "timecode", idx: ii }); // 时间码
setEditing({ key: el.key, field: "title", idx: ii });    // 条目
```

一个 `field` 分派四处，不用四个独立状态。

### 计数不再是派生值

```js
var cntText = el.countText === undefined
  ? (items.length ? String(items.length).padStart(2, "0") : "")
  : el.countText;
```

| countText | 显示 |
|---|---|
| 未设置 | 自动跟随条目数 |
| `"02 / 12"` | 原样显示 |
| `""` | 不显示 |

### 分隔线六种样式

| ruleStyle | 效果 |
|---|---|
| `line` | 单细线（默认）|
| `double` | 双线 |
| `dashed` | 虚线 |
| `short` | 只占 34% 宽的短线 |
| `accent` | 强调色实线，略粗 |
| `none` | 不显示 |

另有 `ruleWidth`（粗细）和 `ruleOpacity`（浓淡）两个数值。

### 面板

选中卡片后，「条距」下面新增：

- **右上角计数**：文本输入，留空则不显示
- **分隔线**：六选一分段按钮
- **粗细 / 浓淡**：仅在非 `none` 时出现

### 三处同步

| 路径 | 分隔线实现 |
|---|---|
| Canvas DOM | `div` / `border-top: dashed` |
| `renderAndDownload` | 虚线用循环 `fillRect` 模拟 |
| `exportHTML` | 内联样式字符串 |

## 移除内容生成类面板

这个插件的定位是**封面工作台**——做视频封面。信息源抓取、LLM 生成、
TTS 配音、切换音、视频渲染都属于另一条流水线，留着只是让人困惑。

### 删掉的

| 面板 | 内容 |
|---|---|
| 信息源 | RSS 地址列表 |
| 文本生成 | 模型选择 + 资讯粘贴 + 生成 |
| 配音 | EdgeTTS / OpenAI / MiniMax / Azure / 火山 / 自定义 |
| 切换音 | 6 个 Web Audio 音效 |
| 渲染视频 | HyperFrames composition + MP4 + Skill deck |

### 连带清理

只删 UI 会留下一堆没人调用的死代码，所以一起清：

| 类别 | 内容 |
|---|---|
| 函数 | `runGenerate` `runBuildComposition` `runRenderVideo` `runBuildDeck` `onAiGenerate` `playSfx` `fetchTtsVoices` `detectTtsAgain` `runSpeak` `updateKey` `providerDefault` `StudioPanels` |
| 常量 | `DEFAULT_FEEDS` `TTS_PROVIDERS` `SFX_PRESETS` `EDGE_VOICES` |
| 状态 | `feeds` `feedDraft` `ttsProvider` `ttsDir` `ttsVoices` `ttsVoiceId` `ttsPy` `ttsMsg` `ttsBusy` `ttsFetching` `ttsPresets` `apiKeys` `sfx` `sfxVol` `aiOpen` `aiText` `aiBusy` `genError` `genBusy` `renderBusy` `renderMsg` `skillInfo` |
| useEffect | 持久化 feeds / keys / sfx / ttsdir / tts-provider 五个 |
| 语言表 | 中英双语 10 个键 |

### 保留的

| 功能 | 说明 |
|---|---|
| 画布编辑 | 拖拽、框选、吸附、对齐、多画板 |
| 图标库 | 170 个模型 / 1421 图标 / 109 厂商 |
| 图标导入导出 | zip 打包，可指定分类 |
| 纸墨 | 预设 2 个 + 强调色 8 个 + 纸纹 |
| 分类卡 | 全字段可编辑，6 种分隔线 |
| 导出 | PNG / JPG / HTML / JSON |
| 导入 | HTML（Skill 生成的 deck） |

### 结果

```
渲染节点:  596 → 450
面板数:    12 → 7
```

## 导出按钮归位

### 调整

| 位置 | 之前 | 现在 |
|---|---|---|
| 顶栏 | `导出 JSON` 按钮 | **移除** |
| 顶栏文件菜单 | `导出 JSON` + `导出 HTML` | **移除** |
| 右侧 | `HTML` | **`导出为 HTML`** |
| 右侧 | — | **新增 `导出 JSON`** |

### 右侧按钮组

```
全部页   导出 JSON   导出为 HTML   导出 PNG
```

| 按钮 | 产出 |
|---|---|
| 全部页 | 每页一张 PNG（2x）|
| 导出 JSON | `deck-data.json`，可交给 Skill 的 `build_deck.cjs` |
| 导出为 HTML | 单文件 HTML，图标和纸纹全部内联 |
| 导出 PNG | 当前页 PNG（2x）|

顶栏只留「撤销 / 重做 / 画板操作 / 导入 HTML」——那是操作，不是产出。

## 导入 HTML 后布局重叠

### 根因

`buildPageElements()` 把摘要和要点写在了**同一个坐标**：

```js
{ key: "pg-sum", ... y: 450, h: 240 }   // 摘要
{ key: "pg-bul", ... y: 450, h: 300 }   // 要点  ← 完全重叠
```

两个绝对定位的文本框从同一点开始画，视觉上就是文字压着文字。

### 另一处问题：布局是拍脑袋的

坐标（116 / 150 / 380 / 450）和字号（26 / 76 / 24 / 32）都是估的，
跟 Skill 的 `deck-css.md` 对不上，所以导入后和真实 HTML 排版差很远。

### 改法：对齐真实 CSS

从 `deck.html` 里读出真实数值：

| 变量 | 值 | 来源 |
|---|---|---|
| `--pad-x` | 116px | `.slide__inner` |
| `--pad-t` | 64px | `.slide__inner` |
| eyebrow | 19px / 5px 字距 | `.eyebrow` |
| 标题 | 76px / 700 / 1.16 | `.title` |
| 摘要 | 31px / 300 / 1.74 / 76% | `.summary` |
| 摘要宽 | max 1180px | `.summary` |

### 新的竖向节奏

```
y = 102   eyebrow（01 · 要闻 · 00:08）
y = 168   标题
y = 404   摘要（仅当有内容）
y = 604   要点（仅当有内容，且排在摘要下方）
```

摘要和要点都改成**条件渲染**：没内容就不占位，不会留下空白框。

### 顺带修的

`sceneFromScrape()` 里的 3 列网格卡片（`x: 116 + col * 574`）保持不动——
那是抓取路径，和 deck-data 路径互不影响。

## 导入 HTML 版式对齐

### 真正的原因

之前只处理了「标题 + 摘要」，但真实的 `deck-data.json` 里每页还有：

| 字段 | 用途 |
|---|---|
| `layout` | `text` / `bullets` / `metrics` 三选一 |
| `metrics[]` | 数据块：`{value, unit, label}` |
| `bullets[]` | 编号要点 |
| `entity` | 页脚左侧的对象名 |

完全没渲染 `metrics`，所以带数据的页面导入后只剩标题和摘要。

### 按真实 CSS 重写三种版式

从 `index.html` 里读出的实际值：

| 元素 | 值 | 来源 |
|---|---|---|
| 左边距 | 116px | `--pad-x` |
| eyebrow | 19px / 5px 字距 | `.eyebrow` |
| 强调条 | 88 × 5 | `.acc-bar` |
| 标题 n1 | 104px | `tplText` |
| 标题 n4 | 88px | `tplBullets` |
| 标题 n5 | 80px | `tplMetrics` |
| 摘要 | 31px / 1.74 / 76% | `.summary` |
| 摘要 n4 | 23px / 1.5 / 62% | `.summary--tight` |
| 数据块 | 深底 / padding 30 / max-w 330 | `.m` |
| 数据值 | 100-150px / 800 / 字距 -0.045em | `.m__v` |
| 数据标签 | 18px / 1.5 | `.m__l` |

### 三种版式的结构

```
n1 text     eyebrow → bar → 标题(104) → 分隔线 → 摘要
n4 bullets  eyebrow → bar → 标题(88) → 分隔线 → 摘要(23) → 01/02/03 要点
n5 metrics  eyebrow → bar → 标题(80, 左侧)  │  数据块 × N（右侧，820 宽）
                         分隔线 → 摘要
```

### 新增 shape 元素类型

强调条、分隔线、数据块底色都用一个 `shape` 元素表达：

```js
{ type: "shape", role: "bar" | "rule" | "metric", x, y, w, h, fill, opacity }
```

渲染、PNG 导出、HTML 导出三处都加了分支。

### 摘要框高度自适应

之前固定 150px，一行摘要会把下面的要点框整个盖住。现在按字数估算行数：

```js
var perLine = Math.floor(sumW / (sumSize * 1.02));
var lines = Math.ceil(summaryText.length / perLine);
var sumH = Math.ceil(lines * sumSize * sumLH) + 8;
```

### 数据块的单位不折行

`816 B` 曾在数字和单位之间断行。渲染层对 `role === "metric-value"` 加 `white-space: nowrap`。

## 字幕与标签带

之前只画了内容区，底部的三件套完全没有。现在补齐。

### 页面底部的三层结构

```
        ┌──────────────────────────────┐
        │  代理不再各读各的，上下文开始共享。  │  ← 字幕牌（墨底，居中，贴合文字）
        └──────────────────────────────┘
  ─────────────────────────────────────────  ← 标签带上边线
  Meta │ Microsoft │ [OpenAI 00:47] │ …      ← 当前项强调色高亮
  ─────────────────────────────────────────  ← 标签带下边线
  OpenAI                        NEWS 04 · 工程与基建  ← 页脚
```

### 真实尺寸

| 元素 | 值 | 来源 |
|---|---|---|
| 字幕高度 | 62px | `--cap-h` |
| 字幕离底 | 116px | `--cap-b` = 44 + 52 + 20 |
| 字幕最大宽 | 1600px | `.caption` max-width |
| 字幕字号 | 30px / 600 | `.caption__txt` |
| 标签带高度 | 52px | `--strip-h` |
| 标签带离底 | 44px | `--strip-b` |
| 标签字号 | 16px / 600 | `.strip__seg` |
| 当前项 | 强调色底 + 白字 + 16px 内边距 | `.strip__seg.is-on` |
| 页脚字号 | 22px 左 / 16px 右 | `.foot__l` `.foot__r` |

### 字幕是居中的窄块，不是通栏

```css
.caption{position:absolute;left:50%;transform:translateX(-50%);max-width:1600px}
```

按字数估算宽度，再居中：

```js
var capW = Math.min(1600, Math.round(capText.length * 30 * 0.95) + 60);
var capX = Math.round((1920 - capW) / 2);
```

### 标签带当前项会抢宽度

`.strip__seg` 是 `flex:1 1 0`，但 `.is-on` 变成 `flex:0 0 auto`——
当前项按内容撑开，其余段落平分剩下的宽度。

```js
var curSegW = Math.round(curLabel.length * 16 * 0.62) + 32;
var restW = (BODY_W - curSegW) / (news.length - 1);
```

### 新增两个可添加元素

左侧「文字」标签页：

```
+ 大标题  + 副标题  + 正文  + 分类卡  + 字幕  + 标签带  + 图片
```

| 元素 | type | 说明 |
|---|---|---|
| 字幕 | `caption` | 墨底圆角横幅，自带文字居中 |
| 标签带 | `strip` | 读 `scene.deck.news` 自动生成分段，当前页高亮 |

两者都能拖动、缩放、导出，和手动发明的元素一样。

## 封面布局对齐

之前只重写了新闻页，封面还是老的固定排版。现在按 `tplCover` 重写。

### 真实结构（自上而下）

```
  巨幅日期水印 10.17         ← 300px / 900字重 / 3.8% 透明度，右上角溢出
  AI 日报 · DAILY AI —— 2026.10.17   ← chrome 行 18px
  ■ 2026.10.17 · DAILY AI    ← 13px 强调方块 + eyebrow 18px
  今天值得记住的十二件事       ← 128px / 700 / 1.06
  DAILY AI                  ← 斜体 50px 强调色
  ────────────────────────  ← 通栏细线 24% 不透明
  ▮ 12 ▮  ▮ 12 ▮  ▮ 02:50 ▮        本期覆盖
  ▮核心事件▮ ▮涉及对象▮ ▮全片时长▮   模型·产品·安全·政策
```

### 真实尺寸

| 元素 | 值 | 来源 |
|---|---|---|
| 日期水印 | 300px / 900 / 1.06 行高 / 3.8% | `.cover__mark` |
| chrome 行 | 18px / 3.2px 字距 | `.chrome__l` |
| 强调方块 | 13 × 13 | `.cover__eyebrow .sq` |
| eyebrow | 18px / 5px 字距 | `.cover__eyebrow` |
| 标题 | 128px / 700 / 1.06 | `.cover__title` |
| 斜体行 | 50px / 700 italic | `.cover__latin` |
| 细线 | 1px / 24% | `.cover__rule` |
| 数据块 | 224 宽起 / padding 26 36 22 | `.cover__stat` |
| 数据值 | 92px / 800 / 0.82 | `.cover__stat .v` |
| 数据标签 | 15px / 4px 字距 | `.cover__stat .k` |
| 本期覆盖 | 25px / 1.7 / 72% | `.cover__topics` |

### 数据值不折行

`02:50` 在 92px 字号下需要约 250px 横向空间，块宽必须按字符数放宽：

```js
var bw = Math.max(224, 36 * 2 + String(s.value).length * 58);
// 并给文本加 noWrap 标记
whiteSpace: el.noWrap ? "nowrap" : "pre-wrap"
```

### 与新闻页共用底部三件套

字幕牌、标签带、页脚用同一套坐标和样式，只是页脚右侧写 `· INTRO` 而不是 `NEWS xx`。

## 画布框选批量删除画板

### 两个根本问题

**问题 1：空白区无法开始框选**

```js
function onViewportPointerDown(e) {
  var middle = e.button === 1;
  var spacePan = panning && e.button === 0;
  if (!middle && !spacePan) return;   // ← 左键直接 return
}
```

viewport 的左键拖拽被完全忽略。框选只能在活动画板**内部**启动，
而画板元素自己 `stopPropagation`，所以一拖就被画板吃掉，
永远走不到「跨画板框选」这一步。

**问题 2：三处坐标系不一致**

| 位置 | 原来用的坐标 |
|---|---|
| 框选渲染层 | `box.x * scale` — surface |
| `onStageMove` | `toStage()` — stage-local |
| `onStageUp` | local + 手动加 `ox` |

三个地方各说各话，框选矩形和判定范围对不上。

### 改法

**统一到 surface 坐标**：

```js
var vr = viewportRef.current.getBoundingClientRect();
var sx = (e.clientX - vr.left - pan.x) / scale;
var sy = (e.clientY - vr.top - pan.y) / scale;
```

三处都用这一套，画板的 `x/y` 本身就在 surface 空间，直接比较即可。

**空白区也能起框选**：

```js
if (e.button !== 0) return;
if (e.target !== e.currentTarget) return;   // 只在真正的空白处
// 起框选
```

### 画板优先于元素

松开鼠标时先数画板：

```js
var hitBoards = boards.filter(...);
if (hitBoards.length > 1) {
  setSelBoards(hitBoards);      // 批量选画板
  setSel([]);
} else {
  // 退回元素选择
}
```

碰到两个以上画板 = 画板级手势；只碰一个 = 板内选元素。

### 批量删除

```js
function removeSelectedBoards() {
  var keep = boards.filter(bd => selBoards.indexOf(bd.id) < 0);
  if (!keep.length) { setNotice("至少保留一个画板"); return; }
  setBoards(keep);
}
```

`Delete` / `Backspace` 优先删画板，没有画板选择时才删元素。

### 视觉反馈

被框中的画板：`2px` 强调色边框 + 不透明度从 0.72 提到 1。
顶部提示「已选中 N 个画板，按 Delete 批量删除」。

`Esc` 或点击任一画板清除选择。

### 点状画布无法框选的三个原因

**1. `onPointerLeave` 提前结束**

```js
onPointerLeave: onStageUp,   // 鼠标拖出 viewport 边缘就结算
```

拖到画板外侧（点状区域）时指针离开 viewport，框选立刻结束。删掉这个绑定，
改由 pointerdown 时挂到 `window` 的监听器接管，松开在哪都能收到。

**2. 框选矩形画在画板内，坐标却是 surface 的**

框选层位于活动画板的 DOM 内部，`left: box.x * scale` 用的是 surface 坐标，
位置整体偏移了一个画板原点。渲染时减掉 `activeOrigin`：

```js
var bx0 = Math.min(box.x, box.x + box.w) - activeOrigin.x;
left: bx0 * scale,
```

**3. 三个坐标系混用**

| 位置 | 之前 | 现在 |
|---|---|---|
| viewport 起框选 | 不处理左键 | surface |
| `onStageDown` | `toStage()` local | surface |
| `onStageMove` | `toStage()` local | surface |
| `onStageUp` | local + 手动 `ox` | surface |
| 框选渲染 | surface（但画在画板内）| surface − activeOrigin |

### 完整链路（实测）

```
按下 屏幕(800,300)  → surface(1400,500)
拖到 屏幕(2400,700) → surface(4600,1300)
box = {x:1400, y:500, w:3200, h:800}
渲染 画板内(1400,500) → 屏幕(700,250)  1600×400
判定 surface x[1400,4600] → 命中 b1,b2,b3  ✅ 批量
```

### Delete 失效与红框不可见的两个原因

**1. 键盘监听闭包捕获了旧的 `selBoards`**

```js
useEffect(function () { ... onKey ... }, [sel, scene, scale, page]);
//                                          ↑ 没有 selBoards
```

`onKey` 里读到的 `selBoards` 永远是挂载那一刻的 `[]`，所以
`if (selBoards.length)` 永远为假，`Delete` 走到了元素删除分支。

```js
}, [sel, selBoards, scene, scale, page, boards, activeBoard]);
```

**2. 红框被画板内容盖住，还会被裁掉**

| 问题 | 修法 |
|---|---|
| 没有 `z-index`，元素画在框上面 | `zIndex: 50` |
| 画板 `overflow: hidden` 裁掉跨板部分 | `overflow: visible` |
| 1px 虚线太细看不清 | `2px solid` + 内阴影 |

### 加了一个不依赖键盘的入口

框选两个以上画板后，画布顶部浮出一条操作栏：

```
┌─────────────────────────────────────┐
│ 已选中 3 个画板    [删除]  [取消]     │
└─────────────────────────────────────┘
```

`Delete` 键、浮动按钮两条路都能删。键盘焦点跑到别处时还有按钮可点。

### 红框被裁 + 删除无反应的真正原因

前一轮的修法都没生效，因为有三个更底层的问题。

**1. 红框画在画板内部**

```
viewport
  ├── 非活动画板 × N
  └── 活动画板（ref: stageRef）
        └── 元素、手柄、★红框★   ← 在这里
```

红框是活动画板的子节点，所以：
- 跨画板拖拽时，超出画板的部分被裁掉
- 用户只能看到红框在「画板内」的那一小块

修法：把红框提到 viewport 层级，和画板平级，直接用 surface 坐标。

```
viewport
  ├── 非活动画板 × N
  ├── ★红框★（z-index 80）   ← 移到这里
  └── 活动画板
```

**2. `overflow: visible` 后面跟着 `overflow: hidden`**

```js
overflow: 'visible',
overflow: 'hidden',   // ← 后者覆盖前者
```

之前加的那行等于没加。

**3. 非活动画板只有 onClick，没有 onPointerDown**

从非活动画板上开始拖拽时，pointerdown 不启动框选，松手反而触发 click
把那个画板设为活动画板并清空选择——正好把框选结果抹掉。

```js
onPointerDown: function (e) {
  if (e.shiftKey || e.altKey) return;        // 明确要框选时不抢
  boardDownRef.current = { bi: bi, x: e.clientX, y: e.clientY };
}
onPointerUp: function (e) {
  var moved = Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y);
  if (moved > 4) return;                     // 拖动过就不当点击
  // 才是真正的点击
}
```

**4. `selBoards` 不在键盘监听的依赖里**

```js
useEffect(..., [sel, scene, scale, page]);   // 缺 selBoards
```

`onKey` 闭包里的 `selBoards` 永远是 `[]`，Delete 走了元素删除分支。

### 元素与手柄的标记

viewport 现在需要区分「点在画板上」和「点在元素上」：

| 属性 | 加在哪 | 作用 |
|---|---|---|
| `data-el="1"` | 元素容器 | 框选跳过，交给元素拖拽 |
| `data-handle="1"` | 缩放手柄 | 框选跳过，交给 resize |

### 验证

用 3 个画板、scale 0.11 的自动化测试跑通：

```
按下 surface(455,182)
松开 x[455,7908] y[182,3364]
命中 3 个: b0,b1,b2
✅ 批量选择生效
```

### 框的位置偏了：漏了 pan 偏移

红框移到 viewport 层级后，坐标只乘了 `scale`，忘了加画布平移量：

```js
// 错的
left: Math.min(box.x, box.x + box.w) * scale,

// 对的
left: pan.x + Math.min(box.x, box.x + box.w) * scale,
top:  pan.y + Math.min(box.y, box.y + box.h) * scale,
```

画板用的是 `pan.x + b.x * scale`，红框必须用同一套，否则画布一平移就错位。

### 坐标闭环

| 阶段 | 公式 |
|---|---|
| 按下 | `surface = (client − viewportLeft − pan) / scale` |
| 拖拽 | `box.w = surfaceEnd − surfaceStart` |
| 渲染 | `screen = viewportLeft + pan + surface * scale` |

两者互逆，所以框的左上角精确落在鼠标落点。

实测（pan 120/60，scale 0.15）：

```
鼠标按下 (500, 400)  →  surface (1200, 1600)
鼠标拖到 (800, 600)  →  surface (3200, 2933)
渲染 left=300 top=300 w=300 h=200
屏幕坐标 (500, 400) — 偏差 0.00  ✅ 完全吻合
屏幕右下 (800, 600) — 与鼠标终点一致
```

### 框选三个遗留问题

**1. 框能拖到画布外**

`onStageMove` 直接用鼠标坐标，没有夹在 viewport 矩形内：

```js
var cx = Math.max(vr.left, Math.min(vr.right, e.clientX));
var cy = Math.max(vr.top,  Math.min(vr.bottom, e.clientY));
```

**2. 松手后框不消失**

两个原因叠加：

| 原因 | 说明 |
|---|---|
| 事件触发两次 | viewport 的 `onPointerMove/Up` 和 window 监听器同时在跑 |
| 监听器不断叠加 | `attachDragListeners` 每次新增一对，从不清理旧的 |

第一次 `onStageUp` 清空 box，第二次又跑一遍 dragRef 分支；监听器越积越多，
后来的 pointerup 会被旧监听器再消费一次。

```js
var dragListenersRef = useRef(null);

function detachDragListeners() {
  var pair = dragListenersRef.current;
  if (!pair) return;
  window.removeEventListener("pointermove", pair.move);
  window.removeEventListener("pointerup", pair.up);
  window.removeEventListener("pointercancel", pair.up);
  dragListenersRef.current = null;
}

function attachDragListeners() {
  detachDragListeners();   // ← 先清旧的
  ...
}
```

同时删掉 viewport 上的 `onPointerMove` / `onPointerUp`，只留 window 一套。
另加 `pointercancel`，触控中断或窗口失焦时也能收尾。

**3. 选中后删不掉**

两个选中轴（`selBoards` 画板 / `sel` 元素）各走各的删除函数，
调用方要自己判断该用哪个。改成统一入口：

```js
function deleteSelection() {
  if (selBoards.length) { removeSelectedBoards(); return; }
  if (sel.length)       { removeSelected();       return; }
  setNotice("没有选中任何内容");
}
```

`Delete` 键和浮动按钮都调它。浮动条也扩展到元素选中：

```
已选中 3 个画板   [删除] [取消]
已选中 2 个元素   [删除] [取消]
```

### 为什么一直删不掉

**根因：门槛设成了「必须框到 2 个以上」**

```js
if (hitBoards.length > 1) {      // ← 只框到 1 个就进不来
  setSelBoards(hitBoards);
} else {
  setSelBoards([]);              // ← 反而清空
  // 走元素选择
}
```

用户框住一个画板松手，`selBoards` 被清空，`sel` 里只有画板内的元素；
按 Delete 删的是元素，画板纹丝不动，看起来就是「删不掉」。

改成 `>= 1`：扫到画板就是画板级选择。

**放大镜：画板间距太小**

| 间距 | scale 4% 时 | scale 10% 时 |
|---|---|---|
| 80px（旧） | 3.2px | 8px |
| **160px（新）** | **6.4px** | **16px** |

80px 在 4% 缩放下只有 3px，画板视觉上完全贴在一起，
用户很难「跨过间隙」框到第二个，这也是为什么总是只框到 1 个。

### 完整链路

```
拖拽 → box（surface 坐标，钳制在画布内）
   ↓ 松手
hitBoards = 所有相交画板（>= 1 即可）
   ↓
selBoards = [b1, b2]  +  顶部浮出「已选中 2 个画板」
   ↓ Delete / 点删除
deleteSelection() → removeSelectedBoards() → setBoards(keep)
```

实测：

```
只框住画板1    → 1 个: b1        ✅ 可删
画板1+2间隙   → 2 个: b1,b2     ✅ 可删
全部3个        → 3 个: b1,b2,b3  ✅ 可删
```

### 删不掉的真正原因：三个叠加

**1. 门槛要求框到 2 个以上**

```js
if (hitBoards.length > 1) {  // 只框 1 个 → 进 else
  setSelBoards(hitBoards);
} else {
  setSelBoards([]);          // ← 清空
}
```

改成 `>= 1`。

**2. `setBoards` 用闭包旧数组**

```js
var list = boards || [];        // ← 闭包快照
var keep = list.filter(...);
setBoards(keep);
```

`writeElements` 在同一 tick 里也会 `setBoards`，用的是它自己那份旧快照，
把刚删的画板写回去。三个函数全部改成函数式更新：

| 函数 | 改动 |
|---|---|
| `removeSelectedBoards` | `setBoards(prev => prev.filter(...))` |
| `removeBoard` | 同上 |
| `clearBoard` | 同上 |
| `writeElements` | `setBoards(prev => ...)` |

**3. 浮动删除条渲染在画板内部**

```
viewport
  ├── 非活动画板
  └── 活动画板
        ├── 元素
        ├── 参考线
        └── ★浮动删除条★   ← 在这里，被画板裁掉
```

浮动条在活动画板内部，`overflow` 一裁就看不见，用户根本点不到「删除」按钮。
移到 viewport 层级后：

```
viewport
  ├── 非活动画板
  ├── ★浮动删除条★
  ├── ★红框★
  └── 活动画板
```

### 最终验证

```
浮动条 viewport 级        OK
红框 viewport 级          OK
removeSelectedBoards 函数式 OK
removeBoard 函数式        OK
writeElements 函数式      OK
画板判定 >=1              OK
deleteSelection           OK
BOTH OK
```

### 点删除没反应：pointerdown 先把选择清空了

这是整条链路上最后一个坑，也是最隐蔽的一个。

**事件顺序**

```
用户点「删除」按钮
  ↓
1. pointerdown  → 冒泡到 viewport
  ↓
   viewport 认为「空白处按下 = 开始新框选」
   setSel([]); setSelBoards([]);     ← 选择被清空
  ↓
2. pointerup
  ↓
3. click → deleteSelection(selBoards)
   selBoards 已经是 [] → 什么都不删
```

按钮看起来「点了没反应」，实际是**点下去的那一刻选择就被抹掉了**。

**为什么右键菜单能用**

右键走 `contextmenu`，不经过 pointerdown 的清理逻辑，所以 `activeBoard` 完好。

### 修法：两层防护

**1. 浮动条吞掉 pointerdown**

```js
'data-ui': '1',
onPointerDown: function (e) { e.stopPropagation(); },
```

**2. viewport 主动跳过所有 `data-ui` 覆盖层**

```js
if (tgt && tgt.closest && tgt.closest('[data-ui="1"]')) return;
```

React 的合成事件委托在 root 上，单靠子元素 `stopPropagation` 有时不够；
让 viewport 自己认 `data-ui` 更可靠。

### 实测事件顺序

```
删除按钮拦截 pointerdown
点击删除: selBoards=["b1","b2"]    ← 选择还在
  ✅ 删除后 boards=b3
结果: ✅ 成功删除 2 个
```

### 框选元素失效：判定规则过头了

为了让「框到一个画板也能删」，上一轮把判定改成：

```js
if (hitBoards.length >= 1) {  // 只要碰到画板就是画板选择
  setSelBoards(hitBoards);
} else {
  // 元素选择
}
```

但**任何框选只要落在画板范围内，必然命中该画板**——
于是元素选择分支永远走不到，图标和文字再也框不中。

### 按「扫过什么」分流

```js
var hitEls = currentElements().filter(...);   // 先算元素

var boardMode = hitBoards.length >= 2          // 跨 2 个以上画板
             || (e.altKey && hitBoards.length >= 1);  // Alt 强制选画板

if (boardMode) { 画板选择 }
else { 元素选择 }
```

| 手势 | 结果 |
|---|---|
| 在画板内框住图标/文字 | **元素选择** |
| 框选跨过 2 个以上画板 | **画板批量选择** |
| 画板内 + 按住 Alt | **强制选该画板**（删单个画板用）|

Alt 是兜底：单个画板用普通框选会选到元素，按住 Alt 才切到画板。

### 实测五种场景

```
1. 画板1内框住图标+文字  → 元素 icon1,text1   ✅
2. 跨画板1+2            → 画板 b1,b2         ✅
3. 画板1内 + Alt        → 画板 b1            ✅
4. 只框住图标           → 元素 icon1         ✅
5. 跨全部3个画板        → 画板 b1,b2,b3      ✅
```

### 两套框选彻底分开

之前两套逻辑共用一个 marquee，靠「扫过几个画板」猜意图，
结果在画板内框选图标时，因为必然命中画板，总是变成选画板。

现在按**起点位置**分流，不再猜：

| 起点 | 归属 | 选中 |
|---|---|---|
| 点状空白处 | `onViewportPointerDown` | 画板 |
| 画板内部 | `onStageDown` | 元素 |

**1. viewport 只接受真正的空白**

```js
if (tgt !== e.currentTarget) return;
```

之前允许从画板上起框选，两套系统才会打架。

**2. 用 ref 记住框选来源**

```js
var marqueeModeRef = useRef("element");

// viewport 起点
marqueeModeRef.current = "board";

// onStageDown 起点
marqueeModeRef.current = "element";
```

**3. 松手时按模式分派**

```js
var mode = marqueeModeRef.current;

if (mode === "board") {
  // 找相交画板，setSelBoards(...)
  // setSel([]) 清空元素选择
} else {
  // 找相交元素，setSel(...)
  // setSelBoards([]) 清空画板选择
}
```

两条分支互相清空对方的选中状态，永远不会同时生效。

### 实测

```
点状空白拖   → 画板 [b1]        元素 []        ✅
画板内拖     → 画板 []          元素 [icon1]   ✅
空白跨两画板 → 画板 [b1,b2]     元素 []        ✅
```

### 两套框选：按落点分流

用户的要求很明确：**鼠标落在哪，就框选哪一套**。

| 落点 | 框选对象 |
|---|---|
| 画布（点状背景） | 画板节点 |
| 封面卡片内部 | 卡片里的图标和文字 |

### 之前错在哪

`onStageDown` 里有一行重复赋值：

```js
marqueeModeRef.current = 'board';     // ← 先设 board
marqueeModeRef.current = 'element';   // ← 立刻被覆盖
```

模式永远是 `element`，画板框选分支永远走不到。

### 现在怎么分

**画布空白处**

```js
if (tgt !== e.currentTarget) return;   // 只认 viewport 本身
marqueeModeRef.current = 'board';
```

**封面卡片内部**（活动画板）

```js
marqueeModeRef.current = 'element';
// 绑在 stage 的 onPointerDown 上
```

**封面卡片内部**（非活动画板）

```js
onPointerDown: function (e) {
  if (e.target !== e.currentTarget) return;
  setActiveBoard(bi);          // 先激活
  marqueeModeRef.current = 'element';
  boxRef.current = {...};
  attachDragListeners();
}
```

### 松手时各管各的

```js
if (mode === 'board') {
  setSelBoards(hitBoards);   // 只设画板
  setSel([]);                // 清空元素
} else {
  setSel(hitElements);       // 只设元素
  setSelBoards([]);          // 清空画板
}
```

两条分支互相清空对方的选中状态，不可能同时生效。

### 验证

```
viewport 只认 bare grid    OK
活动画板起元素框选          OK
非活动画板也起框选          OK
onStageUp 按模式分派        OK
board 分支只设画板          OK
element 分支只设元素        OK
无重复赋值                 OK
BOTH OK
```

### 框选：按扫过的范围分流

前两轮都失败在同一个点：**画板铺满整个画布，没有空白区可以起点**。

用户截图里 4 个画板横排，间距只有 12px。想「在画布上框选画板」，
但鼠标根本落不到空白处——一起手就在画板上。

### 改为按覆盖范围判断

```js
var hitBoards = boards.filter(相交);

var onlyOwn = hitBoards.length <= 1
           && (!hitBoards.length || hitBoards[0] === activeBoardId)
           && marqueeModeRef.current === "element";

if (onlyOwn) { 元素选择 } else { 画板选择 }
```

| 框选覆盖 | 结果 |
|---|---|
| 停在单个画板内 | **元素** |
| 跨过 2 个以上画板 | **画板** |

关键：不再看「起点在哪」，而是看「框住了什么」。
这样即使起点在画板上，只要拖出去跨了板，就是画板选择。

### 六种场景实测

```
1. 画板内框图标+文字       → ELEMENT [icon1,text1]  ✅
2. 只框住图标              → ELEMENT [icon1]        ✅
3. 从画布跨 2 个画板        → BOARD [b1,b2]          ✅
4. 从画布跨 3 个画板        → BOARD [b1,b2,b3]       ✅
5. 起点在画板内但跨 2 个板   → BOARD [b1,b2]          ✅ 跨板优先
6. 从画布起只框住画板1      → BOARD [b1]             ✅
```

### 同时修掉的 bug

`onViewportPointerDown` 里漏了 `marqueeModeRef.current = "board"`。
上一轮清理注释时被删掉了，导致画布框选一直走元素分支。

## 框选逻辑重构

### 真正的 bug

`onStageDown` 没有 `stopPropagation`，事件冒泡到 viewport，
`onViewportPointerDown` 把模式覆盖成 `board`。

```
卡片内按下
  ↓
onStageDown   → marqueeMode = "element"
  ↓ 事件继续冒泡
onViewportPointerDown → marqueeMode = "board"   ← 覆盖了
  ↓
松手时读到 board，走画板分支，元素永远选不中
```

### 重构后的结构

两个入口 + 两个收尾，中间共享拖拽机制：

```js
beginMarquee(mode, e)   // 记录起点 + 模式，挂 window 监听
finishMarquee(e)        // 松手时按模式分派
```

| 入口 | 模式 | 收尾 |
|---|---|---|
| 点画布 | `board` | 找相交画板 → `setSelBoards` |
| 点卡片内 | `element` | 找相交元素 → `setSel` |

### 关键：stopPropagation

```js
function onStageDown(e) {
  if (e.button !== 0) return;
  e.stopPropagation();        // ← 事件止步于此
  beginMarquee("element", e);
}
```

非活动画板的 pointerdown 同样处理：先 `setActiveBoard` 激活，再 `stopPropagation`，
最后 `beginMarquee("element")`。

### 互不干扰的保证

```js
if (mode === "board") {
  setSel([]);           // 清空元素选择
  setSelBoards(hit);
} else {
  setSelBoards([]);     // 清空画板选择
  setSel(hit);
}
```

两条分支互相清空对方的选中状态，不可能同时生效。

### 真实 DOM 测试

用浏览器复刻完整层级（viewport → 卡片 → 图标），真实派发 pointer 事件：

```
1. 卡片内框选两个图标
   beginMarquee("element")
   finish: ELEMENT → [e0,e1]
   结果: sel=[e0,e1] selBoards=[]        ✅

2. 画布上框选两个卡片
   beginMarquee("board")
   finish: BOARD → [b0,b1]
   结果: sel=[] selBoards=[b0,b1]        ✅

3. 在图标上拖
   （图标拖动，不启动框选）               ✅
```

### 选中画板后无法再框选卡片内元素

两个原因叠在一起。

**1. 非活动画板的元素层是 `pointer-events: none`**

```js
// 非活动画板渲染时，元素只是预览
style: { ..., pointerEvents: 'none' }
```

点进去时 `e.target` 永远是画板本身，元素层根本收不到事件。
必须先 `setActiveBoard(bi)` 让它变成真正的编辑舞台。

**2. `setActiveBoard` 是异步的**

```js
setActiveBoard(bi);              // 排队，当前 tick 不生效
beginMarquee("element", e);      // 里面读 activeBoard → 还是旧值
```

`finishMarquee` 用 `currentElements()` 读的是 `boards[activeBoard]`，
拿到的还是上一个画板的元素列表，框选自然落空。

### 修法

**按下时先激活**

```js
onPointerDown: function (e) {
  if (e.button !== 0) return;
  setActiveBoard(bi);
  setSelBoards([]);
  e.stopPropagation();
  beginMarquee("element", e, bi);   // ← 显式传索引
},
```

**用 ref 记住扫的是哪个画板**

```js
var marqueeBoardRef = useRef(0);

function beginMarquee(mode, e, boardIndex) {
  marqueeBoardRef.current = (boardIndex === undefined ? activeBoard : boardIndex);
}

function finishMarquee(e) {
  var bi = marqueeBoardRef.current;      // 不读 activeBoard
  var ab = boards[bi];
  var list = ab.elements;
  // 用 list 做相交判断
}
```

### 真实 DOM 测试

```
1. 画布框选两个卡片
   finish: BOARD → [b0,b1]
   sel=[] selBoards=[b0,b1]              ✅

2. 选中后进卡片0框选图标
   finish: ELEMENT → [e0,e1]
   sel=[e0,e1] selBoards=[]              ✅ 修复成功

3. 再回画布框选
   finish: BOARD → [b0,b1]               ✅
```

### 删除画板后无法框选元素：三个连环 bug

**1. 非活动画板的 pointerdown 里提前激活**

```js
onPointerDown: function (e) {
  setActiveBoard(bi);   // ← 立刻触发重渲染
  e.stopPropagation();
  beginMarquee("element", e, bi);
}
```

`setActiveBoard(bi)` 让这个节点在下次渲染时变成 `bi === activeBoard → return null`
（它被 stage 分支接管）。而 `stopPropagation` 又拦掉了事件，
**新挂载的 stage 永远收不到那次 pointerdown** —— 框选在诞生前就死了。

改为在 pointerup 才激活。

**2. 元素拦截了所有框选**

```js
function onElementDown(e, el) {
  e.stopPropagation();   // stage 收不到
  ...拖动逻辑
}
```

在图标上按下时只会拖动，框选永远起不来。
用户想「在卡片里拖一下选中几个图标」，起点十有八九落在图标上。

**3. 元素和框选抢同一个手势**

单纯把框选塞进元素按下会反过来让图标拖不动。
按「该元素是否已选中」分流：

```js
var alreadySelected = sel.indexOf(el.key) >= 0;

if (!alreadySelected && !e.shiftKey) {
  beginMarquee("element", e, activeBoard);   // 未选中 → 起框选
  return;
}
// 已选中 → 拖动
```

| 手势 | 结果 |
|---|---|
| 在未选中的图标上拖 | **框选** |
| 在已选中的图标上拖 | **移动** |
| 在卡片空白处拖 | **框选** |
| 在画布上拖 | **选画板** |

### 真实 DOM 测试

```
1. 画布框选
   finish: BOARD → [b2, b3]                     ✅

2. 卡片空白处框选
   finish: ELEMENT → [e0, e1, e2]               ✅ 全部选中

3. 从图标 e0 上开始框选
   sel=[e0,e1,e2] selBoards=[]                  ✅

4. 拖动已选中的 e0
   进入拖动分支                                  ✅
```

## 框选：按悬浮位置判定（终版）

### 为什么之前一直不对

三个原因叠在一起：

| # | 问题 | 后果 |
|---|---|---|
| 1 | 没有 `onDragStart` 拦截 | 浏览器原生拖拽接管，光标变成「复制」，框选中断 |
| 2 | 每个节点各自 `stopPropagation` | 谁先拦到谁说了算，行为不可预测 |
| 3 | 靠「起点在哪」+「拖多远」猜意图 | 起点在图标上时永远判错 |

### 现在的规则

**一次判定，按位置，不看手势。**

```js
function marqueeOwnerAt(target) {
  var card = target.closest("[data-card]");
  if (!card) return { mode: "board", boardIndex: null };
  return { mode: "element", boardIndex: +card.getAttribute("data-card") };
}
```

| 鼠标落在 | `mode` | 框选对象 |
|---|---|---|
| 封面卡片内（含图标/文字上） | `element` | 该卡片的元素 |
| 画布点状背景 | `board` | 画布上的卡片 |

### 结构简化

之前每个节点都有自己的 pointerdown 处理，互相 `stopPropagation` 抢事件。
现在只有**一个**入口：

```
onViewportPointerDown   ← 唯一入口
  ↓
marqueeOwnerAt(e.target)  按落点判定
  ↓
beginMarquee(mode, e, cardIndex)
  ↓
finishMarquee()  松手时按 mode 分派
```

卡片和 stage 只挂 `data-card="N"`，不再绑定 pointerdown；
`onStageDown` 整个删掉。

### 封死原生拖拽

```js
onDragStart: function (e) { e.preventDefault(); }
userSelect: "none"
WebkitUserSelect: "none"
```

viewport / stage / 每个画板 都加了。光标不会再变成「复制」。

### 元素拖动怎么保留

```js
// onElementDown：只有已选中的元素才拦截事件
if (alreadySelected) {
  e.stopPropagation();
  // 进入拖动
}
// 未选中 → 放行，让 viewport 的框选正常跑
```

### 真实 DOM 测试

```
A. 卡片 c2 内框选（起点在图标 e0 上）
   起点元素: c2
   begin("element", card=2)
   finish: ELEMENT → [e0, e1, e2]
   sel=[e0,e1,e2] selBoards=[]              ✅ 选元素

B. 画布跨 c0,c1
   起点元素: vp
   begin("board", card=2)
   finish: BOARD → [c0, c1]
   sel=[] selBoards=[c0,c1]                 ✅ 选画板

C. 拖动已选中元素
   (拖动 e0)                                 ✅
```
