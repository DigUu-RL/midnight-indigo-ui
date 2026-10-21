import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';

const testFiles: string[] = ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'];

// Timed tests run on their own (`vitest.performance.config.ts`), away from the parallel functional suite.
const performanceTestFiles: string = '**/*.performance.test.{ts,tsx}';

// Tests that stream React from the server need the Web Streams of Node (`ReadableStream`), which the context of a VM
// does not have.
const nodeStreamTestFiles: string[] = ['src/theme/ui-provider.test.tsx'];

const testConfiguration: ViteUserConfig = defineConfig({
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'functional',
					include: testFiles,
					exclude: [performanceTestFiles, ...nodeStreamTestFiles],
					// Each file still runs in a context of its own, in a VM inside a worker thread instead of a fresh process:
					// about a third of the time of the default pool, where setting up jsdom and importing the modules took
					// four fifths of the run.
					pool: 'vmThreads',
				},
			},
			{
				extends: true,
				test: { name: 'node-streams', include: nodeStreamTestFiles },
			},
		],
	},
});

export default testConfiguration;
