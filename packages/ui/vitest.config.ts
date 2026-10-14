import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';

const testConfiguration: ViteUserConfig = defineConfig({
	test: {
		include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
		// Timed tests run on their own (`vitest.performance.config.ts`), away from the parallel functional suite.
		exclude: ['**/*.performance.test.{ts,tsx}'],
	},
});

export default testConfiguration;
