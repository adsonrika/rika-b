<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { computed } from 'vue'
import { useI18n } from './i18n'

const { t, locale, changeLanguage } = useI18n()

const nextLocale = computed(() => (locale.value === 'zh-CN' ? 'en' : 'zh-CN'))

function toggleLocale(): void {
  void changeLanguage(nextLocale.value)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>

    <div class="flex items-center justify-center gap-3">
      <div class="text-lg font-semibold">{{ t('app.title') }}</div>
      <button
        type="button"
        class="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 hover:bg-slate-50"
        @click="toggleLocale"
      >
        {{ t('app.language') }}: {{ nextLocale }}
      </button>
    </div>

    <HelloWorld :msg="t('app.hello')" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
