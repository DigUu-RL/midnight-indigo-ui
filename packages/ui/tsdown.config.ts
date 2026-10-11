import { defineConfig } from 'tsdown';
import type { UserConfig } from 'tsdown';

const buildConfiguration: UserConfig = defineConfig({
	// Each `src/<domain>/index.ts` becomes a public subpath, plus the optional form integrations, whose dependencies
	// stay out of `forms`; keep it in sync with `exports`.
	entry: [
		'src/index.ts',
		'src/*/index.ts',
		'src/forms/date-pickers/index.ts',
		'src/forms/react-hook-form/index.ts',
	],
	outDir: 'dist',
	format: 'esm',
	platform: 'neutral',
	tsconfig: 'tsconfig.build.json',
	// Per-module output preserves granularity for tree-shaking in consumer bundles.
	unbundle: true,
	dts: true,
	sourcemap: true,
	clean: true,
	copy: [{ from: 'src/styles.css', to: 'dist' }],
	// With `unbundle` each module keeps its own file, so `'use client'` survives; a consumer test asserts it.
	checks: { moduleLevelDirective: false },
});

export default buildConfiguration;
