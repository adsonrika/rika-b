import { enTranslation } from './en'
import { zhCNTranslation } from './zh-CN'

export const I18N_DEFAULT_LOCALE = 'zh-CN' as const
export type I18nLocale = typeof I18N_DEFAULT_LOCALE | 'en'

export const i18nResources = {
  en: { translation: enTranslation },
  'zh-CN': { translation: zhCNTranslation },
} as const

export type I18nTranslation = typeof enTranslation

export * from './type'
