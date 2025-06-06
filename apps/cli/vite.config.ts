/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/cli',

  plugins: [nxViteTsPaths()],

  // Uncomment this if you are using workers and want to use the Vite dev server
  // worker: {
  //   plugins: [nxViteTsPaths()],
  // },

  // Configuration for all your test environments
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: '../../dist/apps/cli',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: 'apps/cli/src/main.ts',
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },

  // Server configuration
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },

  // Preview configuration
  preview: {
    port: 4300,
    host: 'localhost',
  },
}); 