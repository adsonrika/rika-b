import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__test/**/*.test.ts'],
    passWithNoTests: true,
    clearMocks: true,
  },
});
