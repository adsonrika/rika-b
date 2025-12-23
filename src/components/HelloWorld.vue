<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)

type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: unknown }
  | { status: 'error'; message: string }

const apiState = ref<ApiState>({ status: 'idle' })

async function callHealthApi(): Promise<void> {
  apiState.value = { status: 'loading' }

  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      headers: { accept: 'application/json' },
    })

    const data = (await res.json()) as unknown

    if (!res.ok) {
      apiState.value = {
        status: 'error',
        message: `HTTP ${res.status}: ${JSON.stringify(data)}`,
      }
      return
    }

    apiState.value = { status: 'success', data }
  } catch (e) {
    apiState.value = { status: 'error', message: e instanceof Error ? e.message : String(e) }
  }
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>, the
    official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>

  <div class="card space-y-3">
    <div class="flex items-center gap-3">
      <button type="button" @click="callHealthApi">调用 /api/health</button>
      <span v-if="apiState.status === 'loading'">请求中...</span>
    </div>

    <pre
      v-if="apiState.status === 'success'"
      class="max-h-64 overflow-auto rounded-md bg-slate-900 p-3 text-left text-xs text-slate-100"
    >{{ JSON.stringify(apiState.data, null, 2) }}</pre>

    <div v-else-if="apiState.status === 'error'" class="text-left text-sm text-red-600">
      {{ apiState.message }}
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
