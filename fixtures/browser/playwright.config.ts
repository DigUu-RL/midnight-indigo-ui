// Browser suite. Run `pnpm build` first: the starter is served from its production build (`next start`) and the
// performance scenarios from theirs (`vite preview`).
//
// - starter: end-to-end flows and accessibility (axe-core, contrast included) of the starter in Chromium.
// - components: library components in the scenarios app, driven in Chromium (charts drawn by the real engine).
// - visual: screenshots of the starter compared with the committed baselines, one set per operating system, since
//   font rasterization differs between them (CI compares the Linux set).
// - performance: interaction latency and rendering of large datasets. Its scripts run it alone, with one worker, so that
//   no other test competes for the processor while it measures.
import { defineConfig, devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const starterPort: number = 3100;
const scenariosPort: number = 4173;
const continuousIntegration: boolean = process.env.CI !== undefined;

const starterUrl: string = `http://localhost:${String(starterPort)}`;
const scenariosUrl: string = `http://localhost:${String(scenariosPort)}`;

const browserConfiguration: PlaywrightTestConfig = defineConfig({
	testDir: 'test',
	forbidOnly: continuousIntegration,
	retries: 0,
	reporter: continuousIntegration
		? [['list'], ['html', { open: 'never' }], ['github']]
		: [['list'], ['html', { open: 'never' }]],
	use: {
		...devices['Desktop Chrome'],
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	expect: {
		toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css' },
	},
	snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{testFileName}/{arg}{ext}',
	projects: [
		{
			name: 'starter',
			testMatch: 'starter/**/*.test.ts',
			use: { baseURL: starterUrl },
		},
		{
			name: 'components',
			testMatch: 'components/**/*.test.ts',
			use: { baseURL: scenariosUrl },
		},
		{
			name: 'visual',
			testMatch: 'visual/**/*.test.ts',
			use: {
				baseURL: starterUrl,
				viewport: { width: 1280, height: 800 },
				deviceScaleFactor: 1,
				contextOptions: { reducedMotion: 'reduce' },
			},
		},
		{
			name: 'performance',
			testMatch: 'performance/**/*.test.ts',
			fullyParallel: false,
			use: { baseURL: scenariosUrl },
		},
	],
	webServer: [
		{
			command: `pnpm exec next start --port ${String(starterPort)}`,
			cwd: fileURLToPath(new URL('../../templates/nextjs-starter', import.meta.url)),
			url: starterUrl,
			env: { NEXT_TELEMETRY_DISABLED: '1' },
			reuseExistingServer: !continuousIntegration,
			timeout: 60_000,
		},
		{
			command: `pnpm exec vite preview --port ${String(scenariosPort)} --strictPort`,
			url: scenariosUrl,
			reuseExistingServer: !continuousIntegration,
			timeout: 60_000,
		},
	],
});

export default browserConfiguration;
