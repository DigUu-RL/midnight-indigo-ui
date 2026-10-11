// Adapter from the library theme to Material UI, which provides behavior (focus, keyboard, overlays) underneath.
import { createTheme } from '@mui/material/styles';
import type { SimplePaletteColorOptions, Theme } from '@mui/material/styles';

import type { IntentTokens } from '../tokens/index.ts';
import type { UiTheme } from './create-ui-theme.ts';

const toPaletteColor = (intent: IntentTokens): SimplePaletteColorOptions => {
	return {
		main: intent.main,
		light: intent.light,
		dark: intent.dark,
		contrastText: intent.contrastText,
	};
};

/**
 * Material UI theme equivalent to `theme`. `UiProvider` applies it already; call it only to style Material UI
 * components that you render directly. `official` maps to `primary` and `default` to `secondary`.
 */
export const toMuiTheme = (theme: UiTheme): Theme => {
	const { intent, surface, text, border, state, radius }: UiTheme['tokens'] = theme.tokens;

	return createTheme({
		palette: {
			mode: 'dark',
			primary: toPaletteColor(intent.official),
			secondary: toPaletteColor(intent.default),
			success: toPaletteColor(intent.success),
			warning: toPaletteColor(intent.warning),
			error: toPaletteColor(intent.error),
			info: toPaletteColor(intent.info),
			background: { default: surface.canvas, paper: surface.raised },
			text: { primary: text.primary, secondary: text.secondary, disabled: text.disabled },
			divider: border.default,
			action: {
				hover: state.hover,
				selected: state.selected,
				disabled: state.disabledText,
				disabledBackground: state.disabledSurface,
			},
		},
		shape: { borderRadius: Number.parseFloat(radius.medium) },
	});
};
