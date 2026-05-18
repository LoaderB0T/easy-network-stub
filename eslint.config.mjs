import awdwareNode from '@awdware/eslint-config-nodejs';

export default [
  {
    ignores: ['test/**/*', '**/vitest.config.ts', 'eslint.config.mjs'],
  },
  ...awdwareNode,
  {
    rules: {},
  },
];
