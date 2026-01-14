# lint-fix 技能

自动修复代码风格问题，确保代码符合项目规范。

## 使用场景

代码 lint 检查失败时，或者希望统一代码风格时使用此技能。

## 技能执行指令

1. **运行 ESLint 自动修复**
   ```bash
   pnpm lint:fix
   ```
   这会自动修复所有可以自动修复的 ESLint 问题

2. **运行 Prettier 格式化**
   ```bash
   pnpm format
   ```
   这会使用 Prettier 格式化所有代码文件

3. **验证修复结果**
   ```bash
   pnpm lint
   ```
   确保所有问题已解决

4. **处理剩余问题**
   - ESLint 和 Prettier 无法自动修复的问题会显示出来
   - 需要手动修复这些剩余问题

## 自动修复的内容

ESLint 可以自动修复：
- 缺失的分号
- 不一致的引号
- 不必要的括号
- 声明但未使用的变量（部分情况）
- 代码格式问题
- 简单的代码质量问题

Prettier 会处理：
- 代码格式化（缩进、换行）
- 引号风格统一
- 尾随逗号
- 对象和数组的格式
- 行宽限制

## 无法自动修复的问题

以下问题需要手动修复：
- 未使用的导入和变量
- 潜在的运行时错误
- 类型错误
- 复杂的代码逻辑问题
- 命名规范问题
- React/Vue 特定的问题

## 输出说明

- ✅ **自动修复成功** - 显示修复的文件和问题数量
- ⚠️ **部分修复** - 列出已修复和需要手动修复的问题
- ❌ **无法修复** - 显示需要手动处理的问题

## 常见问题

### 未使用的变量

```typescript
// ❌ Lint 错误
const unused = 'value';

// ✅ 手动修复：删除或使用
```

### 未使用的导入

```typescript
// ❌ Lint 错误
import { unused, used } from './module';

// ✅ 手动修复：删除未使用的导入
import { used } from './module';
```

### 类型错误

```typescript
// ❌ 类型错误
const num: string = 123;

// ✅ 手动修复：修正类型
const num: number = 123;
```

## 约束规则

- ✅ 优先使用 `pnpm lint:fix` 而非手动修改
- ✅ 格式化后运行 `pnpm lint` 验证
- ✅ 提交前确保所有 lint 问题已解决
- ✅ 不要忽略 lint 错误

## 与其他技能的配合

- 在运行 `/check-all` 之前使用此技能
- 在提交代码前运行：`/lint-fix` + `/check-all`
- 在创建 PR 前运行以确保代码质量

## 配置文件

项目使用以下配置：
- ESLint: `eslint.config.mjs`
- Prettier: `.prettierrc`
- 忽略文件: `.prettierignore`

## 注意事项

- ESLint 和 Prettier 的配置已协调，不会冲突
- 某些文件可能被忽略（如 `dist/`、`node_modules/`）
- 自动修复是安全的，不会改变代码逻辑
- 建议在保存文件时配置编辑器自动运行格式化
