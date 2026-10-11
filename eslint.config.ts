import javascript from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

import { requireBracesForMultilineArrowBody } from './eslint-rules/require-braces-for-multiline-arrow-body.ts';

export default defineConfig(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '.roadmap/**'],
  },
  javascript.configs.recommended,
  typescriptEslint.configs.strictTypeChecked,
  typescriptEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      local: {
        rules: {
          'require-braces-for-multiline-arrow-body': requireBracesForMultilineArrowBody,
        },
      },
    },
    rules: {
      // Type usage: explicit types and type-only imports/exports.
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            { from: 'package', package: 'node:test', name: ['test', 'describe', 'it', 'suite'] },
          ],
        },
      ],

      // Functions: arrow functions by default; `function` only when strictly necessary.
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',

      // Control flow: avoid `else` (object calisthenics); braces unless the statement fits on one line.
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement[alternate]',
          message: 'Avoid `else`: prefer early returns or a ternary expression.',
        },
      ],
      curly: ['error', 'multi-line', 'consistent'],

      // Naming: full, descriptive identifiers instead of abbreviations.
      'id-length': [
        'error',
        { min: 3, properties: 'never', exceptions: ['_', 'id', 'to', 'x', 'y', 'z'] },
      ],

      // Braces for anything spanning more than one line, including arrow function bodies.
      'local/require-braces-for-multiline-arrow-body': 'error',

      // Readability: short related statements may stay together; multi-line constructs are set apart.
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: '*', next: ['multiline-block-like', 'multiline-const'] },
        { blankLine: 'always', prev: ['multiline-block-like', 'multiline-const'], next: '*' },
      ],
    },
  },
);
