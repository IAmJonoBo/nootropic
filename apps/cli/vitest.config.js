import { defineConfig } from "vitest/config";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
export default defineConfig({
  cacheDir: "../../node_modules/.vitest/cli",
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest/cli",
    },
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/cli",
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.config.ts",
        "**/types.ts",
      ],
    },
  },
});
//# sourceMappingURL=vitest.config.js.map
