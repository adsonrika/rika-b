import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import './i18n'
import { routes } from './router'
import { createPinia } from 'pinia'

// Create Pinia instance
const pinia = createPinia()

// vite-ssg 28.x 配置
export const createApp = ViteSSG(
  App,
  { routes },
  (ctx) => {
    // Install plugins
    ctx.app.use(pinia)
  }
)
