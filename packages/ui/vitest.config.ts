import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';

const testConfiguration: ViteUserConfig = defineConfig({
	test: {
		include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.ts'],
	},
});

export default testConfiguration;
