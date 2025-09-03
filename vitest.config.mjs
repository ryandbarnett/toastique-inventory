// vitest.config.mjs
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'tests/**/*.spec.mjs',
      'auth/**/__tests__/**/*.spec.mjs',
    ],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',                 // c8/v8 provider
      reporter: ['text', 'html'],
      include: ['server.js', 'auth/**', 'lib/**'],  // focus on backend
      exclude: ['public/**', 'scripts/**'],         // ignore frontend & scripts for now
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 75 },
    },
  },
})
