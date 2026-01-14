import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { sourceFilePlugin } from '@rika/shared/vite-plugins';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), sourceFilePlugin()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    watch: {
      // 注意 pnpm 或 yarn workspace 会在 node_modules 创建 symlink
      // 需要监听 shared 源码
      ignored: ['!**/packages/shared/**']
    }
  },
});
