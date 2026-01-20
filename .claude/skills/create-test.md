# create-test 技能

根据项目的测试构建规范创建测试文件。

## 使用场景

当你需要为项目中的功能创建测试时，使用此技能确保测试符合项目规范。

## 技能执行指令

1. **确定测试位置**
   - 测试文件必须放在 `__test` 文件夹内
   - 对于 packages/shared，测试放在 `packages/shared/__test/`
   - 对于 apps，测试放在对应 workspace 的 `__test/` 目录

2. **设计测试辅助方法**
   - 创建 `run_<功能>_test` 命名的测试辅助函数
   - 该函数封装测试执行逻辑，接收场景关注的参数
   - 返回测试所需的结果，降低测试代码阅读干扰

3. **创建数据工厂方法**
   - 使用 `make*` 前缀命名（如 `makeMarkdown`、`makeTestOptions`）
   - 提供合理的默认值
   - 仅需关注当前测试场景需要的参数

4. **编写测试用例**
   - 使用 `describe` 分组相关测试
   - 测试描述简单明了，清晰表达测试意图
   - 使用 `run_<功能>_test` 辅助方法执行测试

5. **验证测试**
   - 运行 `pnpm test` 确保测试通过
   - 如果是单个测试文件，使用 `pnpm test <test-file-path>`

## 约束规则

- ✅ 所有测试执行 helper 必须使用 `run_<功能>_test` 命名
- ✅ 构造测试数据的工厂使用 `make*` 前缀，必须提供默认值
- ✅ 测试文件位置：`**/__test/**/*.test.ts`
- ✅ 测试框架：Vitest（已启用 globals）
- ✅ 测试必须简洁易读，通过辅助方法降低干扰

## 示例

参考 `packages/shared/__test/parse-blog.test.ts`：

```typescript
// 数据工厂
function makeMarkdown(options: MarkdownOptions = {}): string {
  // 提供默认值，仅关注场景参数
}

// 测试辅助方法
async function run_extract_blog_it(options: MarkdownOptions = {}) {
  // 封装测试执行逻辑
}

// 测试用例
describe('功能描述', () => {
  it('场景描述', async () => {
    const result = await run_extract_blog_it({
      // 仅关注当前场景需要的参数
    });
    expect(result).toBe(...);
  });
});
```

## 注意事项

- 测试辅助方法应该隐藏复杂的设置逻辑（如临时文件创建、mock 配置等）
- 数据工厂的默认值应该让"正常场景"的测试最简单
- 每个测试用例应该专注于一个场景或边界条件
