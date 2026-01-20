import type { PluginOption } from 'vite'
import { parse } from '@vue/compiler-sfc'

export function sourceFilePlugin(): PluginOption {
  return {
    name: 'vite:source-file-inject',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules') || id.startsWith('transforming')) {
        return null
      }
      if (!/\.(ts|tsx|js|jsx|vue)$/.test(id)) {
        return null
      }
      if (code.includes('const __SOURCE_FILE__=')) {
        return null
      }

      const normalizedId = id.replace(/\\/g, '/')
      const root = process.cwd().replace(/\\/g, '/')
      const relativePath = normalizedId.startsWith(root)
        ? normalizedId.slice(root.length + 1)
        : normalizedId

      // 注入 __SOURCE_FILE__，兼容 ESM 和打包
      const source = JSON.stringify(relativePath)
      const newCode = (() => {
        const inject = `  const __SOURCE_FILE__=${source};\n`
        if (!id.endsWith('.vue')) {
          return inject + code
        }
        const { descriptor } = parse(code)
        if (descriptor.scriptSetup) {
          const start = descriptor.scriptSetup.loc.start.offset
          code = code.slice(0, start) + inject + code.slice(start)
        }
        return code
      })()
      console.log(`source-file-inject ${source}`)
      return {
        code: newCode,
        map: null,
      }
    },
  }
}
