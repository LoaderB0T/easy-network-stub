import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    include: ['test/**/*.spec.ts'],
    testTimeout: 90000,
    alias: {
      'easy-network-stub/stream': './src/stream/index.ts',
      'easy-network-stub/ws': './src/ws/index.ts',
      'easy-network-stub': './src/lib/index.ts',
    },
  },
});
