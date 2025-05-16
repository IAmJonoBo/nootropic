// @ts-expect-error TS(2305): Module '"vite"' has no exported member 'defineConf... Remove this comment to see the full error message
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
