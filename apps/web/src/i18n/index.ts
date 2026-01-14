import i18next, { type TFunction } from 'i18next';
import { onBeforeUnmount, readonly, ref } from 'vue';
import { I18N_DEFAULT_LOCALE, i18nResources, type I18nLocale } from '@rika/shared/i18n';
import { logger } from '@rika/shared/logger';

const log = logger(__SOURCE_FILE__);

i18next.init({
  lng: I18N_DEFAULT_LOCALE,
  fallbackLng: 'en',
  resources: i18nResources,
});

const currentLocale = ref(i18next.language);

i18next.on('languageChanged', (lng) => {
  currentLocale.value = lng;
});

export function useI18n(): {
  t: TFunction
  locale: Readonly<typeof currentLocale>
  changeLanguage: (lng: I18nLocale) => Promise<TFunction>
  } {
  const listener = (lng: string) => {
    currentLocale.value = lng;
  };

  i18next.on('languageChanged', listener);
  onBeforeUnmount(() => i18next.off('languageChanged', listener));
  log.info('i18n initialized', { locale: i18next.language });
  return {
    t: i18next.t.bind(i18next),
    locale: readonly(currentLocale),
    changeLanguage: (lng) => i18next.changeLanguage(lng),
  };
}
