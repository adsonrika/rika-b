# add-i18n 技能

添加国际化文本到项目中，遵循 i18next 规范。

## 使用场景

需要添加新的国际化文本或错误消息时使用此技能。

## 技能执行指令

1. **确定翻译 key 的位置**
   - App UI 文本：放在 `app.*` 下
   - 错误消息：放在 `error.*` 下
   - 按功能模块组织，使用嵌套结构（如 `user.profile.title`）

2. **更新类型定义**

   在 `packages/shared/src/i18n/type.ts` 的 `I18nConfigType` 中添加类型：

   ```typescript
   export type I18nConfigType = {
     app: {
       title: string
       hello: string
       language: string
       // 添加新的 app 文本
       newFeature: string
     }
     error: {
       internal: string
       badRequest: string
       // 添加新的错误消息
       unauthorized: string
     }
     // 可以添加新的顶层分类
     user: {
       profile: {
         title: string
         edit: string
       }
     }
   }
   ```

3. **添加中文翻译**

   在 `packages/shared/src/i18n/zh-cn.ts` 中添加翻译：

   ```typescript
   export const zhCNTranslation = {
     app: {
       // ...existing
       newFeature: '新功能',
     }
     error: {
       // ...existing
       unauthorized: '未授权访问',
     }
     user: {
       profile: {
         title: '用户资料',
         edit: '编辑',
       }
     }
   } satisfies I18nConfigType;
   ```

4. **添加英文翻译**

   在 `packages/shared/src/i18n/en.ts` 中添加翻译：

   ```typescript
   export const enTranslation = {
     app: {
       // ...existing
       newFeature: 'New Feature',
     }
     error: {
       // ...existing
       unauthorized: 'Unauthorized',
     }
     user: {
       profile: {
         title: 'User Profile',
         edit: 'Edit',
       }
     }
   } satisfies I18nConfigType;
   ```

5. **构建 shared 包**

   ```bash
   pnpm -C packages/shared build
   ```

6. **在前端使用**

   在 Vue 组件中使用 `useI18n()`：

   ```typescript
   import { useI18n } from '@/i18n';

   const { t } = useI18n();

   // 使用翻译
   const title = t('app.newFeature');
   const error = t('error.unauthorized');
   const profileTitle = t('user.profile.title');
   ```

7. **在 API 中使用**

   API 返回错误码，前端根据 code 翻译：

   ```typescript
   // API 侧
   const errorResponse: ApiErrorResponse = {
     ok: false,
     error: {
       code: 'error.unauthorized',  // i18n key
       message: 'Unauthorized access'
     }
   };

   // 前端侧
   const message = t(apiError.error.code);
   ```

## 约束规则

- ✅ 必须在 `I18nConfigType` 中添加类型定义
- ✅ 中文和英文翻译必须保持相同的结构
- ✅ 使用 `satisfies I18nConfigType` 确保类型安全
- ✅ 翻译 key 使用点分隔的路径（如 `app.title`）
- ✅ 错误码放在 `error.*` 下，API 直接返回 code
- ✅ 修改后必须构建 shared 包

## 类型系统

项目使用类型安全的 i18n 系统：

- `I18nKey` - 所有翻译 key 的联合类型
- `I18nAppKey` - 仅 `app.*` 开头的 key
- `I18nErrorKey` - 仅 `error.*` 开头的 key
- `LeafPaths<T>` - 自动生成嵌套类型的所有叶子路径

## 示例

### 添加新的错误消息

1. 更新 `packages/shared/src/i18n/type.ts`：
```typescript
error: {
  // ...existing
  userNotFound: string
}
```

2. 更新 `packages/shared/src/i18n/zh-cn.ts`：
```typescript
error: {
  userNotFound: '用户不存在'
}
```

3. 更新 `packages/shared/src/i18n/en.ts`：
```typescript
error: {
  userNotFound: 'User not found'
}
```

4. 在 API 中使用：
```typescript
const errorResponse: ApiErrorResponse = {
  ok: false,
  error: {
    code: 'error.userNotFound',
    message: 'User not found'
  }
};
```

5. 在前端显示：
```typescript
const { t } = useI18n();
const errorMessage = t('error.userNotFound');
```

## 命名规范

- 使用 camelCase 命名
- 错误消息：描述性的简短文本
- UI 文本：用户友好的语言
- 保持 key 简短但有意义
- 使用嵌套结构组织相关翻译

## 注意事项

- 修改 shared 包后必须重新构建
- 类型系统会在编译时捕获翻译 key 的拼写错误
- 前端初始化 i18next 时会加载 shared 中的翻译资源
- API 错误码直接对应 i18n key，前端负责翻译
