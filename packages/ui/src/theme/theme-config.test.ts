import { describe, expect, it } from 'vitest';

import { parseUiThemeConfig, UiThemeConfigError } from './theme-config.ts';
import type { ThemeConfigIssue } from './theme-config.ts';

const issuesOf = (value: unknown): ThemeConfigIssue[] => {
	try {
		parseUiThemeConfig(value);
		return [];
	} catch (error: unknown) {
		if (error instanceof UiThemeConfigError) return [...error.issues];
		throw error;
	}
};

const pathsOf = (value: unknown): string[] => {
	return issuesOf(value).map((issue: ThemeConfigIssue): string => issue.path);
};

describe('parseUiThemeConfig', (): void => {
	it('accepts an empty configuration', (): void => {
		expect(parseUiThemeConfig({})).toEqual({});
	});

	it('accepts a parsed JSON object and returns it unchanged', (): void => {
		const config: unknown = {
			palette: { official: { main: '#FF6AC1' }, info: { main: '#5af', border: '#5AF' } },
		};

		expect(parseUiThemeConfig(config)).toEqual(config);
	});

	it('accepts JSON text', (): void => {
		expect(parseUiThemeConfig('{ "palette": { "success": { "main": "#36C995" } } }')).toEqual({
			palette: { success: { main: '#36C995' } },
		});
	});

	it('accepts an intent without main, which falls back later', (): void => {
		expect(pathsOf({ palette: { warning: { border: '#F2B84B' } } })).toEqual([]);
	});

	it('rejects malformed JSON text', (): void => {
		expect(() => parseUiThemeConfig('{ "palette": ')).toThrow(/\(root\): malformed JSON/);
	});

	it('rejects values that are not objects', (): void => {
		expect(pathsOf(null)).toEqual(['(root)']);
		expect(pathsOf([])).toEqual(['(root)']);
		expect(pathsOf({ palette: '#FF6AC1' })).toEqual(['palette']);
		expect(pathsOf({ palette: { official: '#FF6AC1' } })).toEqual(['palette.official']);
	});

	it('rejects invalid colors with the offending path and value', (): void => {
		const issues: ThemeConfigIssue[] = issuesOf({ palette: { official: { main: 'pink' } } });

		expect(issues).toEqual([
			{
				path: 'palette.official.main',
				message: 'invalid color "pink": expected a hexadecimal color in the form #RRGGBB or #RGB.',
			},
		]);
	});

	it('rejects colors that are not strings', (): void => {
		expect(pathsOf({ palette: { error: { main: 0xf2545b } } })).toEqual(['palette.error.main']);
	});

	it('rejects unknown keys at every level, listing the accepted ones', (): void => {
		const issues: ThemeConfigIssue[] = issuesOf({
			colors: {},
			palette: { primary: { main: '#FF6AC1' }, info: { mian: '#65BDEB' } },
		});

		expect(issues.map((issue: ThemeConfigIssue): string => issue.path)).toEqual([
			'colors',
			'palette.primary',
			'palette.info.mian',
		]);
		expect(issues[1]?.message).toContain('official, default, success, warning, error, info');
		expect(issues[2]?.message).toContain('main, light, dark');
	});

	it('reports every problem in one error message', (): void => {
		const parse = (): unknown => {
			return parseUiThemeConfig({
				palette: { official: { main: '#GG0000' }, success: { text: 'green' } },
			});
		};

		expect(parse).toThrow(UiThemeConfigError);
		expect(parse).toThrow(/palette\.official\.main[\s\S]*palette\.success\.text/);
	});
});
