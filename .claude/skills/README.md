# Claude Skills 使用指南

本目录包含项目的自定义 Claude Code 技能（skills）。

## 可用技能

### 1. `/create-test` ✅
创建符合项目规范的测试文件
- 测试文件位置：`**/__test__/**/*.test.ts`
- 使用 `run_<功能>_test` 命名辅助方法
- 使用 `make*` 前缀命名数据工厂
- 参考：[packages/shared/__test/parse-blog.test.ts](../../packages/shared/__test/parse-blog.test.ts)

### 2. `/check-all` ✅
运行所有类型检查和 lint 检查
- 运行 `pnpm check` - TypeScript 类型检查
- 运行 `pnpm lint` - ESLint 检查
- 提交前必用

### 3. `/add-api` ✅
创建新的 API 端点
- 文件位置：`apps/api/src/*.ts`
- 使用 `VercelRequest`/`VercelResponse` 类型
- 使用 `logger(__SOURCE_FILE__)` 记录日志
- 错误响应使用 `ApiErrorResponse` 格式
- 参考：[apps/api/src/health.ts](../../apps/api/src/health.ts)

### 4. `/add-i18n` ✅
添加国际化文本
- 更新 `packages/shared/src/i18n/type.ts` 类型
- 添加中英文翻译
- 使用 `satisfies I18nConfigType` 确保类型安全
- 修改后需构建 shared 包

### 5. `/lint-fix` ✅
自动修复代码风格问题
- 运行 `pnpm lint:fix` - ESLint 自动修复
- 运行 `pnpm format` - Prettier 格式化
- 自动修复后验证

## 使用方式

在 Claude Code 中直接输入命令：

```
/技能名称
```

例如：
```
/create-test
/check-all
/add-api
/add-i18n
/lint-fix
```

## 技能规范

所有技能都遵循项目的编码规范：

- TypeScript strict mode
- ESLint + Prettier 代码风格
- Vitest 测试框架
- i18next 国际化
- 统一的错误处理格式
- 结构化日志

## 添加新技能

在 `.claude/skills/` 目录创建：

1. `<skill-name>.md` - 技能定义文件
2. `<skill-name>.json` - 技能配置文件

JSON 格式：
```json
{
  "title": "技能标题",
  "description": "技能描述",
  "command": "skill-name"
}
```

## 相关文档

- [CLAUDE.md](../../CLAUDE.md) - 详细项目指南
- [README.md](../../README.md) - 项目概览
- [rules/test-rule.md](../../rules/test-rule.md) - 测试构建规范
