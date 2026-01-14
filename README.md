# Rika-B

基于 Vue 3 + TypeScript + Vite 的全栈 monorepo 项目，采用 pnpm workspaces 管理。

## 项目结构

此项目是一个 monorepo，包含以下 workspace：

- **apps/web** - Vue 3 前端应用（SPA）
- **apps/api** - Vercel Serverless Functions 后端
- **packages/shared** - 前后端共享的 TypeScript 工具和类型（无运行时副作用）

```text
.
├── apps/
│   ├── web/              # Vue 3 + Vite 前端应用
│   │   ├── src/          # Vue 组件和业务逻辑
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/              # Vercel Serverless Functions
│       ├── src/          # API 处理函数（会部署为 /api/*）
│       ├── vercel.json   # Vercel 配置
│       └── package.json
├── packages/
│   └── shared/           # 共享 TypeScript 模块
│       ├── src/
│       │   ├── api/      # API 类型和工具
│       │   ├── blog/     # Blog 相关工具
│       │   ├── git/      # Git 操作
│       │   ├── i18n/     # 国际化资源
│       │   ├── logger/   # 日志工具
│       │   └── utils/    # 通用工具（retry、fetch、频率控制等）
│       └── package.json  # 使用 conditional exports
├── scripts/              # 构建和开发脚本
├── tsconfig.base.json    # 共享 TypeScript 配置
├── vitest.config.ts      # Vitest 测试配置
└── pnpm-workspace.yaml   # pnpm workspaces 配置
```

## 依赖要求

- **Node.js**: `>= 20.19.0`（见 `package.json#engines` / `.nvmrc`）
- **pnpm**: 推荐使用仓库内 `pnpm-lock.yaml` 对应的版本

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 本地开发

同时启动前端和后端（推荐）：

```bash
pnpm dev
```

这会启动：

- **前端**: Vite dev server（默认端口）
- **后端**: 本地 API server（端口 3000），加载 `apps/api/src/*.ts`
- **API 代理**: 前端通过 Vite `server.proxy` 将 `/api/*` 代理到 `http://localhost:3000`

### 单独启动各服务

```bash
# 仅启动前端
pnpm -C apps/web dev

# 仅启动后端（本地开发模式）
pnpm -C apps/api dev:local

# 仅启动后端（Vercel 模式，用于行为对齐测试）
pnpm -C apps/api dev:vercel
```

## 常用命令

### 代码质量

```bash
# Lint 检查
pnpm lint

# Lint 自动修复
pnpm lint:fix

# 代码格式化
pnpm format
pnpm format:check
```

### 构建和类型检查

```bash
# 构建所有 workspace（顺序：shared -> web -> api）
pnpm build

# 类型检查所有 workspace
pnpm check

# 清理构建产物
pnpm clean
```

### 测试

```bash
# 运行所有测试（Vitest）
pnpm test

# 运行单个测试文件
pnpm test packages/shared/__test__/parse-blog.test.ts
```

### 预览构建产物

```bash
# 先构建 web，然后用本地 API server 预览
pnpm preview
```

### Workspace 特定命令

```bash
# Web 应用
pnpm -C apps/web build          # 构建前端（输出到 apps/web/dist/）
pnpm -C apps/web check          # 类型检查 + lint

# API
pnpm -C apps/api build          # 构建 API（输出到 apps/api/dist/）
pnpm -C apps/api check          # 类型检查 + lint

# Shared 包
pnpm -C packages/shared build   # 构建 TypeScript（输出到 packages/shared/dist/）
pnpm -C packages/shared check   # 类型检查 + lint
pnpm -C packages/shared test    # 运行测试
```

## 架构说明

### Monorepo 与 Workspace 依赖

项目使用 pnpm workspaces，workspace 之间通过 `workspace:*` 协议引用：

- `@rika/shared` 的导出被 apps 通过 `workspace:*` 协议消费
- 构建 shared 后，apps 可以通过 subpath exports 导入

### Shared 包的导出

`@rika/shared` 使用 conditional exports（见 `packages/shared/package.json`）：

```ts
// API 相关
import { ApiErrorResponse } from '@rika/shared/api'
import { errorCodeToI18nKey } from '@rika/shared/api'

// Blog 相关
import { parseBlogPost } from '@rika/shared/blog'

// Git 操作
import { getGitCommit } from '@rika/shared/git'

// 国际化资源
import { I18N_KEYS } from '@rika/shared/i18n'

// 日志
import { logger } from '@rika/shared/logger'

// 通用工具
import { retry, fetchWithTimeout } from '@rika/shared/utils'

// Vite 插件
import { somePlugin } from '@rika/shared/vite-plugins'
```

### 后端架构

**本地开发（`pnpm -C apps/api dev:local`）**：

- 使用自定义 Node.js HTTP server（`scripts/api-dev-server.ts`）
- 动态加载 `apps/api/src/*.ts` 中的处理函数
- 模拟 Vercel 的 `VercelRequest`/`VercelResponse` API
- 同时从 `apps/web/dist/` 提供前端静态文件（需要先构建 web）

**Vercel 部署**：

- `apps/api/src/*.ts` 中的文件会部署为 `/api/{name}` 的 serverless functions
- `vercel.json` 配置 rewrites，将 `/api/*` 路由到对应的函数
- 构建输出到 `dist/`（通过 Vite 配置）

### 前端架构

- **构建输出**: Vite 构建到 `apps/web/dist/`
- **API 代理**: 开发时，Vite 将 `/api/*` 代理到 `localhost:3000`（见 `apps/web/vite.config.ts`）
- **路径别名**: Vite 配置中 `@/` 映射到 `apps/web/src/`

### TypeScript 配置

- `tsconfig.base.json` - 共享基础配置（ES2022、strict mode、NodeNext 模块解析）
- 每个 workspace 继承此基础配置
- 使用 `paths` 配置 `@rika/shared/*` 的导入

## 国际化（i18next）

采用 i18next，按"共享资源 + 前端运行时"分离：

### Shared 侧（共享资源）

- `packages/shared/src/i18n/zh-cn.ts` / `en.ts` - 翻译资源
- `packages/shared/src/i18n/keys.ts` - `I18N_KEYS` 常量

### 前端侧（运行时）

- `apps/web/src/i18n/index.ts` - 初始化 i18next，提供 `useI18n()`（Vue 响应式绑定）

### API 错误处理

约定：API **仅返回** `code + message`，`message` 不做国际化：

- `packages/shared/src/api/error.ts` - `ApiErrorResponse` 类型
- `packages/shared/src/api/error-code-i18n.ts` - `code -> i18nKey` 映射
- 前端根据 `code` 在客户端进行翻译

## 日志

共享 logger（`@rika/shared/logger`）提供结构化日志：

```ts
import { logger } from '@rika/shared/logger'

const log = logger(__SOURCE_FILE__)

log.info('用户登录', { userId: '123' })
log.error('数据库连接失败', { error })
```

- 使用 `__SOURCE_FILE__` 全局变量捕获源文件路径
- 日志包含：时间戳、级别、消息、源文件、可选数据

## 样式（TailwindCSS）

- 配置文件：`apps/web/tailwind.config.js` / `postcss.config.js`
- 引入指令：`apps/web/src/style.css`

## 测试

- **框架**: Vitest（启用 globals）
- **配置**: 根目录 `vitest.config.ts` 适用于所有 workspace
- **测试位置**: `**/__test/**/*.test.ts`
- **覆盖率**: 未配置

## 构建产物

以下目录会被 ESLint 和 git 忽略（见 `.gitignore`）：

- `packages/shared/dist/` - 编译后的 JS + .d.ts
- `apps/web/dist/` - Vite 构建输出（静态资源）
- `apps/api/dist/` - Vercel 部署包

## 部署（Vercel）

项目按 Vercel 约定组织：

- `apps/api/src/` 下的文件作为 Serverless Functions 部署
- `pnpm build` 输出到 `dist/`
- `vercel.json` 配置：
  - SPA 路由 fallback 到 `index.html`
  - 保留 `/api/*` 路由到 serverless functions

## 更多信息

详细的项目指南请参考 [CLAUDE.md](./CLAUDE.md)。
