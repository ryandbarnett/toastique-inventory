// vitest.config.mjs
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Pick up your current integration tests…
    include: [
      'tests/**/*.spec.mjs',
      // …and any colocated unit tests under auth/**/__tests__/
      'auth/**/__tests__/**/*.spec.mjs',
    ],
    environment: 'node',
    globals: true, // you’re already using describe/it/expect globally
  },
})
