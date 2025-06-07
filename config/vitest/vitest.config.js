import { defineConfig } from "vitest/config";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
export default defineConfig({
  cacheDir: "../../node_modules/.vitest",
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest",
    },
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default", "html"],
    coverage: {
      reportsDirectory: "../../coverage",
      provider: "v8",
      reporter: ["text", "lcov", "clover", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.config.ts",
        "**/types.ts",
      ],
    },
  },
});
//# sourceMappingURL=vitest.config.js.map
