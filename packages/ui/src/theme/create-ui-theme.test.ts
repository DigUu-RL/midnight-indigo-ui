import { describe, expect, it, vi } from 'vitest';

import { tokens } from '../tokens/index.ts';
import type { HexColor } from '../tokens/index.ts';
import { createThemeStylesheet, createUiTheme, defaultUiTheme } from './create-ui-theme.ts';
import type { UiTheme } from './create-ui-theme.ts';
import { UiThemeConfigError } from './theme-config.ts';
import type { UiThemeConfig } from './theme-config.ts';

const silent = { onWarning: (): void => undefined };
const customPink: HexColor = '#E0409F';

describe('createUiTheme', (): void => {
	it('produces the official tokens without configuration', (): void => {
		expect(defaultUiTheme.tokens).toEqual(tokens);
		expect(defaultUiTheme.warnings).toEqual([]);
	});

	it('applies a configured official.main and derives the rest of the intent from it', (): void => {
		const theme: UiTheme = createUiTheme({ palette: { official: { main: customPink } } }, silent);

		expect(theme.tokens.intent.official.main).toBe(customPink);
		expect(theme.tokens.intent.official.container).not.toBe(tokens.intent.official.container);
		expect(theme.tokens.accent.link).toBe(theme.tokens.intent.official.text);
	});

	it('normalizes colors', (): void => {
		const theme: UiTheme = createUiTheme({ palette: { info: { main: '#5af' } } }, silent);
		expect(theme.tokens.intent.info.main).toBe('#55AAFF');
	});

	it('keeps the defaults of omitted intents', (): void => {
		const theme: UiTheme = createUiTheme({ palette: { official: { main: customPink } } }, silent);
		expect(theme.tokens.intent.success).toEqual(tokens.intent.success);
		expect(theme.tokens.surface).toEqual(tokens.surface);
	});

	it('falls back to the default main when an intent omits it', (): void => {
		const theme: UiTheme = createUiTheme({ palette: { warning: { border: '#ABCDEF' } } }, silent);

		expect(theme.tokens.intent.warning.main).toBe(tokens.intent.warning.main);
		expect(theme.tokens.intent.warning.border).toBe('#ABCDEF');
	});

	it('throws a descriptive error for an invalid configuration', (): void => {
		// JSON loaded without `parseUiThemeConfig`: `createUiTheme` still validates it at runtime.
		const unvalidated: UiThemeConfig = JSON.parse(
			'{ "palette": { "official": { "main": "rosa" } } }',
		) as UiThemeConfig;

		const create = (): UiTheme => createUiTheme(unvalidated);

		expect(create).toThrow(UiThemeConfigError);
		expect(create).toThrow(/palette\.official\.main: invalid color "rosa"/);
	});

	it('reports contrast failures through onWarning and theme.warnings', (): void => {
		const onWarning = vi.fn<(message: string) => void>();

		const theme: UiTheme = createUiTheme(
			{ palette: { official: { main: '#2A2A2A' } } },
			{ onWarning },
		);

		expect(theme.warnings.length).toBeGreaterThan(0);
		expect(onWarning).toHaveBeenCalledTimes(theme.warnings.length);

		expect(theme.warnings[0]).toMatch(
			/^[\w.]+ on [\w.]+ FAILS [\d.]+:1 \(\w+\): [\d.]+:1\. Used for: /,
		);
	});

	it('warns in the console by default', (): void => {
		const consoleWarning = vi.spyOn(console, 'warn').mockImplementation((): void => undefined);
		createUiTheme({ palette: { official: { main: '#2A2A2A' } } });

		expect(consoleWarning).toHaveBeenCalledWith(
			expect.stringMatching(/^\[Midnight Indigo: UI\] Theme contrast warning: /),
		);

		consoleWarning.mockRestore();
	});

	it('is plain frozen data that survives serialization to a Client Component', (): void => {
		const theme: UiTheme = createUiTheme({ palette: { official: { main: customPink } } }, silent);

		expect(Object.isFrozen(theme)).toBe(true);
		expect(JSON.parse(JSON.stringify(theme))).toEqual(theme);
	});
});

describe('createThemeStylesheet', (): void => {
	it('declares the configured values inside the theme layer', (): void => {
		const theme: UiTheme = createUiTheme({ palette: { official: { main: customPink } } }, silent);
		const stylesheet: string = createThemeStylesheet(theme);

		expect(stylesheet).toContain('@layer midnight-indigo.theme {');
		expect(stylesheet).toContain(`--mi-intent-official-main: ${customPink};`);
	});

	it('accepts a custom selector', (): void => {
		expect(createThemeStylesheet(defaultUiTheme, '.preview')).toContain('  .preview {');
	});
});
