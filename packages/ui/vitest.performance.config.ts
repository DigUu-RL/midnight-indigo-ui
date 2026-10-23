// Performance suite: budgets of time and of work (renders, calls, DOM size) with large amounts of data. Files run one
// after the other, so that a measurement never shares the processor with another test file.
import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';

const performanceConfiguration: ViteUserConfig = defineConfig({
	// `@/src/...`: the alias of `paths` in tsconfig.json.
	resolve: { tsconfigPaths: true },
	test: {
		include: ['src/**/*.performance.test.{ts,tsx}'],
		fileParallelism: false,
		testTimeout: 60_000,
		hookTimeout: 60_000,
	},
});

export default performanceConfiguration;
