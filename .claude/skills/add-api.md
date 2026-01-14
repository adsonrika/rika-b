# add-api 技能

在 apps/api/src/ 中创建新的 API 端点，遵循项目规范。

## 使用场景

需要添加新的 API 端点时使用此技能。

## 技能执行指令

1. **确定 API 端点名称**
   - 文件名将映射为 `/api/{filename}` 路由
   - 例如：`user.ts` -> `/api/user`
   - 例如：`auth/login.ts` -> `/api/auth/login`

2. **创建 API 处理函数文件**
   - 在 `apps/api/src/` 中创建 TypeScript 文件
   - 使用 default export 导出 handler 函数
   - 函数签名：`async function handler(req: VercelRequest, res: VercelResponse)`

3. **遵循项目规范**

   **导入依赖：**
   ```typescript
   import type { VercelRequest, VercelResponse } from '@vercel/node';
   import { logger } from '@rika/shared/logger';
   ```

   **创建日志实例：**
   ```typescript
   const log = logger(__SOURCE_FILE__);
   ```

   **实现 handler：**
   ```typescript
   export default async function handler(req: VercelRequest, res: VercelResponse) {
     try {
       // 业务逻辑
       log.info('API called');

       // 成功响应
       res.status(200).json({ ok: true, data: ... });
     } catch (error) {
       // 错误处理
       log.error('API error', { error });

       // 使用统一的错误响应格式
       const errorResponse: ApiErrorResponse = {
         ok: false,
         error: {
           code: 'ERROR_CODE',
           message: 'Error description'
         }
       };
       res.status(400).json(errorResponse);
     }
   }
   ```

4. **定义类型（如果需要）**
   - 在 `packages/shared/src/api/type.ts` 中添加请求/响应类型
   - 使用 `ApiErrorResponse` 作为错误响应类型

5. **添加错误码（如果需要）**
   - 在 `packages/shared/src/i18n/` 中添加翻译
   - 在 `packages/shared/src/i18n/type.ts` 的 `I18nConfigType` 中添加错误码类型
   - 确保 API 返回的 `code` 与 i18n key 对应

6. **测试 API**
   - 重启本地 API server：`pnpm -C apps/api dev:local`
   - 使用 curl 或浏览器测试：`http://localhost:3000/api/{endpoint}`

## 约束规则

- ✅ API 文件必须使用 default export 导出 handler
- ✅ 必须使用 `VercelRequest` 和 `VercelResponse` 类型
- ✅ 必须使用 `logger(__SOURCE_FILE__)` 创建日志实例
- ✅ 错误响应必须使用 `ApiErrorResponse` 格式
- ✅ 错误响应中的 `code` 必须对应 i18n key
- ✅ 必须有适当的错误处理和日志记录

## 示例

参考 `apps/api/src/health.ts`：

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { nowIsoString, type ApiHealthResponse } from '@rika/shared/api';
import { logger } from '@rika/shared/logger';

const log = logger(__SOURCE_FILE__);

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  log.info('Health check requested');

  const body: ApiHealthResponse = {
    ok: true,
    now: nowIsoString(new Date()),
  };

  log.info('Health check response sent', { ok: body.ok });
  res.status(200).json(body);
}
```

## 部署说明

- 文件创建后会自动在 Vercel 上部署为 `/api/{filename}`
- 确保在 `vercel.json` 中正确配置 rewrites（如果需要）
- 本地开发时通过 Vite proxy 访问：`/api/{filename}`

## 注意事项

- API 端点会自动映射，无需手动配置路由
- 使用 subdirectory 可以创建嵌套路由（如 `auth/login.ts`）
- 所有 API 端点都会在 Vercel 上作为 serverless functions 部署
- 注意 serverless functions 的执行时间和内存限制
