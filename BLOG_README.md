# 个人博客系统 - SSG 版本

## 🎯 项目概述

这是一个基于 Vue 3 + TypeScript 的**纯静态博客系统**，采用 SSG（Static Site Generation）方式，为每篇博客生成独立的 HTML 文件，无需运行时支持，可直接部署到任何静态托管平台。

## ✨ 特性

- 📝 **Markdown 写作**：在 `/blog` 目录下使用 Markdown 文件写博客
- 🚀 **纯静态站点**：构建时生成所有 HTML 文件，无需服务器
- ⚡ **超快速加载**：纯 HTML + CDN 资源，极致性能
- 🎨 **现代设计**：简洁、克制的 UI，支持深色/浅色主题切换
- 📱 **响应式**：完美适配桌面和移动端
- 🔍 **SEO 友好**：语义化 HTML，良好的元数据支持
- 📑 **目录导航**：自动生成文章目录，支持点击跳转
- 🏷️ **标签系统**：支持文章标签分类
- 💾 **零依赖运行**：生成的 HTML 文件可直接用浏览器打开

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

**注意**：需要 Node.js >= 20.19.0

### 2. 写博客文章

在 `/blog` 目录创建 Markdown 文件：

```markdown
# 文章标题

<p hidden>
tags: 标签1, 标签2
desc: 文章描述
</p>

这里是文章内容...

## 二级标题

正文内容...
```

### 3. 生成静态站点

```bash
# 生成纯静态 HTML 文件
pnpm -C apps/web build:ssg
```

生成的文件位于 `apps/web/dist/` 目录：
- `dist/index.html` - 首页
- `dist/blog/*.html` - 各篇博客文章

### 4. 预览

直接用浏览器打开 `apps/web/dist/index.html`，或者使用静态服务器：

```bash
# 使用 Python
cd apps/web/dist && python -m http.server 8000

# 使用 Node.js serve
npx serve apps/web/dist
```

然后访问 http://localhost:8000

## 📁 项目结构

```
rika-b/
├── blog/                              # 博客文章目录
│   ├── hello-world.md
│   └── vue3-composition-api.md
├── apps/web/
│   ├── dist/                          # SSG 生成的静态文件
│   │   ├── index.html                 # 首页
│   │   └── blog/                      # 博客文章页面
│   └── scripts/
│       └── generate-ssg.ts            # SSG 生成脚本
└── packages/shared/
    └── src/blog/                      # 博客解析工具
```

## 🌐 部署

由于生成的文件是纯静态 HTML，可以直接部署到：

**Vercel / Netlify / GitHub Pages** 等任何静态托管平台
- 只需将 `apps/web/dist` 目录内容上传即可
- 无需服务器，无需 Node.js

## 🎯 工作流程

1. **写作**：在 `/blog` 目录创建/编辑 Markdown 文件
2. **生成**：运行 `pnpm -C apps/web build:ssg`
3. **预览**：在浏览器中打开 `dist/index.html`
4. **部署**：将 `dist` 目录部署到静态托管平台

## 🌟 优势

1. **极致性能**：纯静态 HTML，加载速度极快
2. **零成本部署**：可部署到 GitHub Pages、Netlify 免费托管
3. **无需服务器**：不需要 Node.js、PHP 等运行时环境
4. **SEO 完美**：所有内容在 HTML 中，搜索引擎可直接抓取
5. **简单可靠**：没有数据库、没有 API，不会出现服务器错误
6. **版本控制**：所有内容都在 Git 中，方便管理和回滚

详细文档：查看完整项目说明
