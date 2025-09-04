// vitest.config.mjs
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'tests/**/*.spec.mjs',
      'packages/**/__tests__/**/*.spec.mjs',
    ],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',                 // c8/v8 provider
      reporter: ['text', 'html'],
      include: ['server.js', 'packages/auth/src/**', 'lib/**'], // focus on backend + package
      exclude: ['public/**', 'scripts/**', 'packages/**/__tests__/**'], // ignore tests
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 75 },
    },
  },
})
