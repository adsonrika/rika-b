import type { I18nConfigType } from "./type.ts";

export const zhCNTranslation = {
  app: {
    title: 'Rika',
    hello: '你好',
    language: '语言',
  },
  error: {
    internal: '系统异常',
    badRequest: '请求参数错误',
  },
} satisfies I18nConfigType
