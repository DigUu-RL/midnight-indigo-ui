// Look shared by `Tabs` (buttons that switch panels) and `TabNavigation` (links between pages), which differ in role only.
import type { CSSObject } from '@mui/material/styles';

import { colorTransitionStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, typography, radius, text, border, state, focus, intent }: typeof themeVariables =
	themeVariables;

/** A row that scrolls sideways when the tabs do not fit, e.g. on a phone, instead of wrapping or overflowing. */
export const tabRowStyles: CSSObject = {
	display: 'flex',
	gap: spacing[1],
	minWidth: 0,
	margin: 0,
	padding: 0,
	overflowX: 'auto',
	overscrollBehaviorX: 'contain',
	scrollbarWidth: 'thin',
	listStyle: 'none',
	borderBlockEnd: `1px solid ${border.subtle}`,
};

/**
 * The selected tab (or the link to the current page) has primary text and a 2 px bar in `intent.official.main`, a
 * shape besides the color. The focus ring is drawn inside, so the scrolling row never clips it.
 */
export const tabStyles: CSSObject = {
	position: 'relative',
	boxSizing: 'border-box',
	display: 'inline-flex',
	flexShrink: 0,
	alignItems: 'center',
	gap: spacing[2],
	minHeight: '2.75rem',
	margin: 0,
	paddingInline: spacing[3],
	border: 0,
	borderStartStartRadius: radius.small,
	borderStartEndRadius: radius.small,
	background: 'none',
	color: text.secondary,
	...typography.label,
	textDecoration: 'none',
	whiteSpace: 'nowrap',
	cursor: 'pointer',
	...colorTransitionStyles,
	'&::after': {
		content: '""',
		position: 'absolute',
		insetInline: 0,
		insetBlockEnd: 0,
		height: '2px',
		borderRadius: radius.pill,
		backgroundColor: 'transparent',
	},
	'&:hover:not([aria-disabled="true"])': { backgroundColor: state.hover, color: text.primary },
	'&[aria-selected="true"], &[aria-current="page"]': {
		color: text.primary,
		'&::after': { backgroundColor: intent.official.main },
	},
	'&[aria-disabled="true"]': { color: state.disabledText, cursor: 'not-allowed' },
	'&:focus-visible': {
		outline: `${focus.width} solid ${focus.ring}`,
		outlineOffset: `calc(-1 * ${focus.width})`,
	},
};

export const tabIconStyles: CSSObject = {
	display: 'inline-flex',
	flexShrink: 0,
	fontSize: themeVariables.iconSize.small,
};
