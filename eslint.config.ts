import javascript from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

import { jsxChildrenSpacing } from '@/eslint-rules/jsx-children-spacing';
import { requireBracesForMultilineArrowBody } from '@/eslint-rules/require-braces-for-multiline-arrow-body';

// Statements spanning more than one line are always set apart from their neighbors by blank lines.
const multilineStatements: string[] = [
	'multiline-block-like',
	'multiline-const',
	'multiline-let',
	'multiline-expression',
];

export default defineConfig(
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/coverage/**',
			'**/.next/**',
			'**/next-env.d.ts',
			'**/playwright-report/**',
			'**/test-results/**',
		],
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
					'jsx-children-spacing': jsxChildrenSpacing,
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
				{ blankLine: 'always', prev: '*', next: multilineStatements },
				{ blankLine: 'always', prev: multilineStatements, next: '*' },
			],

			// Imports: never relative paths, which break when files move or are renamed. `@/` is the root of the
			// workspace (`paths` in its tsconfig; tools/node-aliases for Node) and code files go without an extension;
			// another workspace is imported by its package name.
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['./*', '../*', '.', '..', '#*'],
							message:
								'Import through the `@/` alias of the workspace (`@/src/...`, `@/test/...`), or by package name.',
						},
						{
							regex: String.raw`^@/.*\.(ts|tsx)$`,
							message:
								'Leave the extension out of imports of code files (`@/src/shared/glyphs/index`).',
						},
					],
				},
			],

			// JSX children follow the rule of statements: a blank line around children spanning more than one line, none
			// between children that fit on one line.
			'local/jsx-children-spacing': 'error',
		},
	},
);
