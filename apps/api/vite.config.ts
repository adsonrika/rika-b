import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import nodeExternals from 'rollup-plugin-node-externals';
import { sourceFilePlugin } from '@rika/shared/vite-plugins';


const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(packageRoot, 'src');
const distApiDir = path.join(packageRoot, 'dist', 'api');

// 确保输出目录存在
if (!fs.existsSync(distApiDir)) {
  fs.mkdirSync(distApiDir, { recursive: true });
}

// 为每个 API 文件构建入口
const entries: Record<string, string> = (() => {
  // 获取所有 API 文件
  function processDirectory(currentDir: string, basePath: string) {
    const res = new Map<string, string>();
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const relativePath = path.join(basePath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // 如果是目录，递归处理
        processDirectory(fullPath, relativePath).forEach((k, v) => {
          res.set(k, v);
        });
      } else if (file.endsWith('.ts')) {
        const normalizedPath = relativePath.replace(/\\/g, '/');
        const key = normalizedPath.replace(/\.ts$/, '');
        res.set(key, fullPath);
      }
    }
    return res;
  }

  const apiFiles = processDirectory(apiDir, 'api');

  if (apiFiles.size == 0) {
    console.log('⚠️  No API files found in api/ directory');
    process.exit(0);
  }
  console.log('API files found:', apiFiles);
  return Object.fromEntries(apiFiles.entries());
})();

// API 专用 Vite 配置
export default defineConfig({
  plugins:[sourceFilePlugin()],
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    ssr: true,
    target: 'node20',
    outDir: distApiDir,
    rollupOptions: {
      plugins:[
        nodeExternals({ deps: true, peerDeps: true })
      ],
      preserveEntrySignatures: 'strict',
      input: entries,
      external: [
        '@vercel/node',
      ],
      treeshake: false,
      output: {
        entryFileNames: '[name].js',
        format: 'cjs',
      }
    },
  },
});
