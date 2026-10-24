# 贡献指南

## 开发环境

- Node.js >= 22
- DeepSeek Harness（用于测试插件加载）

## 本地开发

```bash
git clone https://github.com/siweimidu/dsh-cover-studio.git
cd dsh-cover-studio

# 语法检查
node --check lib/index.js
node --check lib/client.js
```

## 安装到 DSH 测试

```bash
dsh plugin --profile desktop add file:$(pwd)
```

或直接复制到 profile 的 `node_modules/@local/dsh-cover-studio/`。

## 代码结构

| 文件 | 职责 |
|---|---|
| `lib/index.js` | 宿主侧：LLM 调用、TTS、Skill 桥接、HTTP 路由 |
| `lib/client.js` | 浏览器侧：整个编辑器（含内联图标） |
| `src/client/engine.js` | 纯逻辑：吸附、对齐、历史、几何 |
| `src/client/skill-bridge.js` | deck-data ↔ scene 转换 |

## 提交规范

```
feat: 新功能
fix: 修复
docs: 文档
refactor: 重构
perf: 性能
chore: 杂项
```

## 注意事项

- `lib/client.js` 是构建产物，源码在 `src/`
- 修改后必须同步到 profile 才能测试
- 所有 DSH 服务调用都要运行时探测，缺失时降级
- UI 令牌只用 `--dsw-*`，不硬编码颜色（主按钮除外）
