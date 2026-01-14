import type { Plugin } from 'vite';

export function sourceFilePlugin(): Plugin {
  return {
    name: 'vite:source-file-inject',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules') || id.startsWith('transforming')) {
        return null;
      }
      if (!/\.(ts|tsx|js|jsx)$/.test(id.split('?')[0] ?? '')
          && !/\?vue&type=script&.*lang\.ts$/.test(id)) {
        return null;
      }
      if (code.includes('const __SOURCE_FILE__=')) {
        return null;
      }

      const normalizedId = id.replace(/\\/g, '/');
      const root = process.cwd().replace(/\\/g, '/');
      const relativePath = normalizedId.startsWith(root)
        ? normalizedId.slice(root.length + 1)
        : normalizedId;

      // 注入 __SOURCE_FILE__，兼容 ESM 和打包
      const source = JSON.stringify(relativePath);
      const inject = `const __SOURCE_FILE__=${source};\n`;
      console.log(`source-file-inject ${source}`);
      return {
        code: inject + code,
        map: null,
      };
    },
  };
}
