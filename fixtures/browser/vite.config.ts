// Production build of the performance scenarios: the library is consumed from its compiled output, as an application
// would, and React runs its production build, so the browser suite times what users get.
import { defineConfig } from 'vite';
import type { Rollup, UserConfig } from 'vite';

const scenariosConfiguration: UserConfig = defineConfig({
	build: {
		outDir: 'dist',
		sourcemap: true,
		rolldownOptions: {
			// `'use client'` marks modules for React Server Components; this is a client-only application.
			onwarn: (warning: Rollup.RollupLog, warn: (log: Rollup.RollupLog) => void): void => {
				if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
			},
		},
	},
	preview: { port: 4173, strictPort: true },
});

export default scenariosConfiguration;
