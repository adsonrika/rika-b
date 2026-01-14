# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo built with pnpm workspaces, containing:
- **apps/web** - Vue 3 + TypeScript + Vite frontend (SPA)
- **apps/api** - Vercel Serverless Functions backend
- **packages/shared** - Shared TypeScript utilities and types (no runtime side effects)

## Development Requirements

- **Node.js**: >= 20.19.0
- **Package manager**: pnpm (uses pnpm workspaces)

## Common Commands

```bash
# Install dependencies
pnpm install

# Start both frontend and backend (most common for development)
pnpm dev
# - Starts web dev server (Vite) on default port
# - Starts local API server on port 3000
# - Web proxies /api/* to localhost:3000

# Run tests (Vitest)
pnpm test
# Tests are located in **/__test/**/*.test.ts

# Build everything
pnpm build
# Build order: packages/shared -> apps/web -> apps/api

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm check
# Runs: tsc --noEmit in each workspace

# Clean build artifacts
pnpm clean
```

### Workspace-specific commands

```bash
# Web app
pnpm -C apps/web dev          # Start Vite dev server
pnpm -C apps/web build        # Build for production
pnpm -C apps/web check        # Type check + lint

# API
pnpm -C apps/api dev:local    # Start local API dev server
pnpm -C apps/api build        # Build for Vercel deployment

# Shared package
pnpm -C packages/shared build # Build TypeScript (output: dist/)
pnpm -C packages/shared check # Type check + lint
pnpm -C packages/shared test  # Run tests
```

### Running a single test

```bash
# From root, run a specific test file
pnpm test packages/shared/__test/parse-blog.test.ts
```

## Architecture

### Monorepo Structure

The repository uses pnpm workspaces with workspace dependencies:
- `@rika/shared` exports are consumed by apps via `workspace:*` protocol
- After building shared, apps can import from it using subpath exports

### Shared Package Exports

The `@rika/shared` package uses conditional exports (see `packages/shared/package.json`):
- `@rika/shared/api` - API types and utilities
- `@rika/shared/blog` - Blog-related utilities
- `@rika/shared/git` - Git operations
- `@rika/shared/i18n` - Internationalization resources
- `@rika/shared/logger` - Logging utilities
- `@rika/shared/utils` - General utilities (retry, fetch, frequency control, etc.)
- `@rika/shared/vite-plugins` - Vite plugins

### Backend Architecture

**Local Development (`pnpm -C apps/api dev:local`)**:
- Uses a custom Node.js HTTP server (`scripts/api-dev-server.ts`)
- Loads handlers from `apps/api/src/*.ts` dynamically
- Emulates Vercel's `VercelRequest`/`VercelResponse` API
- Also serves web frontend from `apps/web/dist/` (build required first)

**Vercel Deployment**:
- Files in `apps/api/src/*.ts` become serverless functions at `/api/{name}`
- `vercel.json` configures rewrites to route `/api/*` to functions
- Build output goes to `dist/` (configured via Vite)

### Frontend Architecture

- **Build**: Vite builds to `apps/web/dist/`
- **API Proxy**: During dev, Vite proxies `/api/*` to `localhost:3000` (see `apps/web/vite.config.ts`)
- **Path Aliases**: `@/` maps to `apps/web/src/` in Vite config

### TypeScript Configuration

- `tsconfig.base.json` - Shared base config (ES2022, strict mode, NodeNext module resolution)
- Each workspace extends this base
- Uses `paths` for `@rika/shared/*` imports

### Logging

The shared logger (`@rika/shared/logger`) provides structured logging:
- `logger(__SOURCE_FILE__)` creates a logger instance
- Use `__SOURCE_FILE__` global to capture the source file
- Logs include: timestamp, level, message, source file, optional data
- Example: `const log = logger(__SOURCE_FILE__); log.info('message')`

### Internationalization (i18n)

- Resources in `packages/shared/src/i18n/`
- Frontend initializes i18next in `apps/web/src/i18n/`
- API error codes map to i18n keys (frontend translates based on code)

## Testing

- **Framework**: Vitest with globals enabled
- **Config**: Root `vitest.config.ts` applies to all workspaces
- **Location**: Tests in `**/__test/**/*.test.ts` directories
- **Coverage**: Not configured

## Build Artifacts

- `packages/shared/dist/` - Compiled JS + .d.ts
- `apps/web/dist/` - Vite build output (static assets)
- `apps/api/dist/` - Vercel deployment bundle

These directories are ignored by ESLint and git (see `.gitignore`).
