# Vue 3 + TypeScript + Vite

## 依赖要求

- **Node.js**: `>= 20.19.0`（见 `package.json#engines` / `.nvmrc`）
- **pnpm**: 推荐使用仓库内 `pnpm-lock.yaml` 对应的版本

## 快速开始

安装依赖：

```bash
pnpm install
```

本地开发（同时启动前端 + Vercel Serverless API）：

```bash
pnpm dev
```

- 前端：Vite dev server
- 后端：本地 API server（原生 http，加载 `api/*.ts`）
- 前端通过 Vite `server.proxy` 将 `/api/*` 代理到 `http://localhost:3000`

如果你需要与线上 Vercel 行为对齐，可使用：

```bash
pnpm dev:api:vercel
```

## 常用命令

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm build
pnpm preview
```

## 目录结构

```text
.
|-- api/                # Vercel Serverless Functions（如 /api/health）
|-- shared/             # 前后端共享的纯 TS 模块（无运行时副作用）
|-- src/                # Vue 前端
|-- vercel.json         # Vercel 配置（SPA fallback + 构建输出）
|-- vite.config.ts      # Vite 配置（含 shared alias + /api proxy）
|-- tsconfig*.json      # TS 配置（抽取公共 tsconfig.base.json）
```

## shared 导入

项目支持使用 `shared` / `shared/*` 引用共享代码：

- 运行时（前端）：`vite.config.ts` 配置了 `resolve.alias`
- 类型检查（前端/后端）：`tsconfig.base.json` 配置了 `compilerOptions.paths`

示例：

```ts
import { nowIsoString } from 'shared'
```

## 国际化（i18next）

国际化采用 i18next，并按“共享资源 + 前端运行时”分离：

- **shared 侧**：
  - `shared/i18n/zh-CN.ts` / `shared/i18n/en.ts`：翻译资源
  - `shared/i18n/keys.ts`：`I18N_KEYS`
- **前端侧**：
  - `src/i18n/index.ts`：初始化 i18next，并提供 `useI18n()`（Vue 响应式绑定）

## API 错误返回与国际化

约定：API **仅返回** `code + message`，`message` 不做国际化。

- `shared/api/error.ts`：`ApiErrorResponse` 类型
- `shared/api/error-code-i18n.ts`：`code -> i18nKey` 映射（前端可根据 `code` 再做翻译）

## 样式（TailwindCSS）

- `tailwind.config.js` / `postcss.config.js`
- `src/style.css` 引入 Tailwind 指令

## 部署（Vercel）

项目按 Vercel 的约定组织：

- `api/` 下文件会作为 Serverless Functions 部署
- `pnpm build` 输出到 `dist/`
- `vercel.json` 配置 SPA 路由 fallback 到 `index.html`，同时保留 `/api/*`
