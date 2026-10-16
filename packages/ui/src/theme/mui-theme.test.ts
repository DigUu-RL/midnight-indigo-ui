import type { Theme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { createUiTheme, defaultUiTheme } from '#src/theme/create-ui-theme.ts';
import { toMuiTheme } from '#src/theme/mui-theme.ts';

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

	it('maps the typographic roles to the Material UI variants', (): void => {
		const { typography, fontFamily } = defaultUiTheme.tokens;

		expect(muiTheme.typography.fontFamily).toBe(fontFamily.sans);
		expect(muiTheme.typography.h1).toMatchObject(typography.display);
		expect(muiTheme.typography.h2).toMatchObject(typography.headingLarge);
		expect(muiTheme.typography.h3).toMatchObject(typography.headingMedium);
		expect(muiTheme.typography.body1).toMatchObject(typography.body);
		expect(muiTheme.typography.body2).toMatchObject(typography.bodySmall);
		expect(muiTheme.typography.caption).toMatchObject(typography.caption);

		expect(muiTheme.typography.button).toMatchObject({
			...typography.label,
			textTransform: 'none',
		});
	});

	it('maps the layer tokens to the Material UI stacking order', (): void => {
		expect(muiTheme.zIndex).toMatchObject({
			appBar: 1100,
			drawer: 1200,
			modal: 1300,
			snackbar: 1500,
			tooltip: 1600,
		});
	});

	it('maps the breakpoints to the Material UI breakpoints', (): void => {
		expect(muiTheme.breakpoints.values).toEqual({ xs: 0, sm: 600, md: 840, lg: 1200, xl: 1600 });
	});

	// The global styles of the library are applied by `UiProvider` (`nativeBaselineStyles`), not by the Material UI theme.
	it('leaves the Material UI baseline unchanged', (): void => {
		expect(muiTheme.components?.MuiCssBaseline).toBeUndefined();
	});

	it('maps the motion tokens to the transitions', (): void => {
		expect(muiTheme.transitions.duration).toMatchObject({
			shortest: 120,
			standard: 320,
			enteringScreen: 200,
			leavingScreen: 120,
		});

		expect(muiTheme.transitions.easing.easeOut).toBe(defaultUiTheme.tokens.motion.easing.enter);
		expect(muiTheme.components?.MuiButtonBase?.defaultProps?.disableRipple).toBe(false);
	});

	it('removes every transition and the ripple under reduced motion', (): void => {
		const reducedMotionTheme: Theme = toMuiTheme(defaultUiTheme, { reducedMotion: true });

		expect(Object.values(reducedMotionTheme.transitions.duration)).toEqual(
			Object.values(reducedMotionTheme.transitions.duration).map((): number => 0),
		);

		expect(reducedMotionTheme.transitions.create('opacity')).toMatch(/^opacity 0ms /);
		expect(reducedMotionTheme.components?.MuiButtonBase?.defaultProps?.disableRipple).toBe(true);
	});

	it('follows a configured official.main', (): void => {
		const theme = createUiTheme(
			{ palette: { official: { main: '#3D8BFF' } } },
			{ onWarning: (): void => undefined },
		);

		expect(toMuiTheme(theme).palette.primary.main).toBe('#3D8BFF');
	});
});
