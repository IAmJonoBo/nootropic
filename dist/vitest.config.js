import { defineConfig } from 'vitest/config';
import path from 'path';
// Canonical Vitest config for ESM/TypeScript best practices
export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        coverage: {
            reporter: ['text', 'html'],
        },
        globals: true, // for describe/it/expect
        // Extend as needed for custom setup, reporters, etc.
        // NOTE: If .js extension imports fail in source mode, run tests on built output.
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'src': path.resolve(__dirname, 'src'),
        },
        extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
    },
    esbuild: {
        target: 'esnext',
        format: 'esm',
    },
});
