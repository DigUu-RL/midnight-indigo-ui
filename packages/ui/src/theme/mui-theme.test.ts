import type { Theme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { createUiTheme, defaultUiTheme } from './create-ui-theme.ts';
import { toMuiTheme } from './mui-theme.ts';

describe('toMuiTheme', (): void => {
	const muiTheme: Theme = toMuiTheme(defaultUiTheme);
	const { intent, surface, text } = defaultUiTheme.tokens;

	it('is dark', (): void => {
		expect(muiTheme.palette.mode).toBe('dark');
	});

	it('maps every intent to the Material UI palette', (): void => {
		expect(muiTheme.palette.primary).toMatchObject({
			main: intent.official.main,
			light: intent.official.light,
			dark: intent.official.dark,
			contrastText: intent.official.contrastText,
		});
		expect(muiTheme.palette.secondary.main).toBe(intent.default.main);
		expect(muiTheme.palette.success.main).toBe(intent.success.main);
		expect(muiTheme.palette.warning.main).toBe(intent.warning.main);
		expect(muiTheme.palette.error.main).toBe(intent.error.main);
		expect(muiTheme.palette.info.main).toBe(intent.info.main);
	});

	it('maps surfaces, text and shape', (): void => {
		expect(muiTheme.palette.background).toEqual({ default: surface.canvas, paper: surface.raised });
		expect(muiTheme.palette.text.primary).toBe(text.primary);
		expect(muiTheme.shape.borderRadius).toBe(8);
	});

	it('follows a configured official.main', (): void => {
		const theme = createUiTheme(
			{ palette: { official: { main: '#3D8BFF' } } },
			{ onWarning: (): void => undefined },
		);

		expect(toMuiTheme(theme).palette.primary.main).toBe('#3D8BFF');
	});
});
