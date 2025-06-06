import { defineConfig } from 'vite';
import { resolve } from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  cacheDir: '../../node_modules/.vite',

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

  // Shared build options
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  // Shared server options
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },

  // Shared preview options
  preview: {
    port: 4300,
    host: 'localhost',
  },
}); 