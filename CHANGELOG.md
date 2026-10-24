# 更新日志

## [1.0.0] - 2026-10-24

### 新增

- 169 个 AI 模型图标 / 1403 图标 / 109 厂商卡片
- 按母公司分组（智谱 11 / 字节 8 / Google 8 / 腾讯 7 / OpenAI 5…）
- 无限画布：框选、吸附、网格排布、整体缩放旋转
- 多画板（上限 20），持久化到 localStorage
- 16 个纸墨预设（8 accent × 2 tone）
- 纸纹参数对齐 AI 日报 Skill（160px / 242 / 7.5%）
- RSS 信息源 + LLM 文本生成
- TTS：EdgeTTS 本地 + OpenAI/MiniMax/Azure/火山/自定义
- 6 个 Web Audio 实时合成的切换音
- HyperFrames 视频渲染 + Skill deck.html 生成
- 导出 PNG/JPG/HTML/JSON

### 修复

- 多画板元素串扰（mutate 从 boards 读而非 scene）
- 框选无响应（装饰层拦截 + React ref 竞态）
- 纸纹不可见（噪点色与纸色差 2-3 色阶）
- 导出按钮黑底黑字（令牌在深色主题下解析相同）
- 面板依赖选中状态（抽成 StudioPanels）
- 画板刷新后消失（独立存储键）
- 网格排布后缩放基准未更新
- 图标库跨模型重复（Meta/Cohere/NVIDIA/Luma/Google/腾讯）
