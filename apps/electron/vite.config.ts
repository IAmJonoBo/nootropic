import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/electron',
  plugins: [nxViteTsPaths()],
  build: {
    outDir: '../../dist/apps/electron',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),
        preload: resolve(__dirname, 'src/preload.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
}); 