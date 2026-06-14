// @ts-check
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const baseConfig = require('@portfolio-cms/eslint-config');

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
