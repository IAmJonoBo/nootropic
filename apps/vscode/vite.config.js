import { defineConfig } from "vite";
import { resolve } from "path";
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/extension.ts"),
      formats: ["cjs"],
      fileName: "extension",
    },
    rollupOptions: {
      external: [
        "vscode",
        "@nootropic/shared",
        "@nootropic/runtime",
        "@nootropic/context",
      ],
      output: {
        globals: {
          vscode: "vscode",
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@nootropic/shared": resolve(__dirname, "../../libs/shared/src/index.ts"),
      "@nootropic/runtime": resolve(
        __dirname,
        "../../libs/runtime/src/index.ts",
      ),
      "@nootropic/context": resolve(
        __dirname,
        "../../libs/context/src/index.ts",
      ),
    },
  },
});
//# sourceMappingURL=vite.config.js.map
