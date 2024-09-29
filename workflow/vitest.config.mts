import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    maxConcurrency: 3,
    testTimeout: 10000,
    retry: 2
  }
});
