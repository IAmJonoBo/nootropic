import { defineConfig } from "vitest/config";
import { resolve } from "path";
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "**/libs/agents/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/libs/adapters/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/libs/shared/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/libs/runtime/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/libs/context/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/libs/ui/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/apps/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
  },
  resolve: {
    alias: {
      "@nootropic/cli": resolve(__dirname, "./apps/cli/src/index.ts"),
      "@nootropic/electron": resolve(__dirname, "./apps/electron/src/index.ts"),
      "@nootropic/vscode": resolve(__dirname, "./apps/vscode/src/index.ts"),
      "@nootropic/api": resolve(__dirname, "./apps/api/src/index.ts"),
      "@nootropic/temporal": resolve(__dirname, "./apps/temporal/src/index.ts"),
      "@nootropic/shared": resolve(__dirname, "./libs/shared/src/index.ts"),
      "@nootropic/ui": resolve(__dirname, "./libs/ui/src/index.ts"),
      "@nootropic/runtime": resolve(__dirname, "./libs/runtime/src/index.ts"),
      "@nootropic/context": resolve(__dirname, "./libs/context/src/index.ts"),
    },
  },
});
//# sourceMappingURL=vitest.config.js.map
