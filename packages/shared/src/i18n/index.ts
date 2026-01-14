import { enTranslation } from './en.js';
import { zhCNTranslation } from './zh-cn.js';

export const I18N_DEFAULT_LOCALE = 'zh-cn' as const;
export type I18nLocale = typeof I18N_DEFAULT_LOCALE | 'en'

export const i18nResources = {
  en: { translation: enTranslation },
  'zh-cn': { translation: zhCNTranslation },
} as const;

export type I18nTranslation = typeof enTranslation

export * from './type.js';
