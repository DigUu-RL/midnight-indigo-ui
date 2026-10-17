// Styles shared by every component: one resolver for `intent` × `variant`, the focus ring and the disabled look.
import type { CSSObject } from '@mui/material/styles';

import { themeVariables } from '#src/theme/theme-variables.ts';
import type { ThemeVariables } from '#src/theme/theme-variables.ts';
import { reducedMotionMediaQuery } from '#src/tokens/index.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';

/**
 * How strongly a component shows its intent: `solid` fills with `main`, `soft` with the tinted `container`,
 * `outline` draws the `border` and `ghost` colors only the content. The intent keeps its meaning in every variant.
 */
export type Appearance = 'solid' | 'soft' | 'outline' | 'ghost';

/** Sizes shared by controls. */
export type ControlSize = 'small' | 'medium' | 'large';

type IntentVariables = ThemeVariables['intent'][SemanticIntent];

/** Matches an element that can be interacted with: not disabled, nor marked `aria-disabled`. */
export const enabledSelector: string = ':not(:disabled):not([aria-disabled="true"])';

/**
 * Every pair below is part of the contrast audit (`auditContrast`), for each intent. A solid fill is bounded by
 * `border`, which equals `main` unless `main` is below 3:1 on some surface (as `brand.main` on the lighter ones).
 */
const restingColors = (colors: IntentVariables): Record<Appearance, CSSObject> => {
	return {
		solid: { backgroundColor: colors.main, borderColor: colors.border, color: colors.contrastText },
		soft: {
			backgroundColor: colors.container,
			borderColor: 'transparent',
			color: colors.onContainer,
		},
		outline: { backgroundColor: 'transparent', borderColor: colors.border, color: colors.text },
		ghost: { backgroundColor: 'transparent', borderColor: 'transparent', color: colors.text },
	};
};

const hoveredColors = (colors: IntentVariables): Record<Appearance, CSSObject> => {
	return {
		solid: { backgroundColor: colors.hover, borderColor: colors.hover },
		soft: { backgroundColor: colors.containerHover },
		outline: { backgroundColor: colors.containerHover, color: colors.onContainer },
		ghost: { backgroundColor: colors.containerHover, color: colors.onContainer },
	};
};

const pressedColors = (colors: IntentVariables): Record<Appearance, CSSObject> => {
	return {
		solid: { backgroundColor: colors.pressed, borderColor: colors.pressed },
		soft: { backgroundColor: colors.containerPressed },
		outline: { backgroundColor: colors.containerPressed, color: colors.onContainer },
		ghost: { backgroundColor: colors.containerPressed, color: colors.onContainer },
	};
};

/** Colors of a component at rest. */
export const appearanceStyles = (intent: SemanticIntent, appearance: Appearance): CSSObject => {
	return restingColors(themeVariables.intent[intent])[appearance];
};

/** Hover and pressed colors of an interactive component; a disabled one keeps its disabled look. */
export const interactionStyles = (intent: SemanticIntent, appearance: Appearance): CSSObject => {
	const colors: IntentVariables = themeVariables.intent[intent];

	return {
		[`&:hover${enabledSelector}`]: hoveredColors(colors)[appearance],
		[`&:active${enabledSelector}`]: pressedColors(colors)[appearance],
	};
};

/**
 * Disabled look: the state tokens, whatever the intent, plus `not-allowed`. Disabled content is exempt from the
 * contrast minimums (WCAG 1.4.3), and this look is never used for loading, which has its own state.
 */
export const disabledStyles = (appearance: Appearance): CSSObject => {
	const filled: boolean = appearance === 'solid' || appearance === 'soft';

	return {
		backgroundColor: filled ? themeVariables.state.disabledSurface : 'transparent',
		borderColor: appearance === 'ghost' ? 'transparent' : themeVariables.state.disabledBorder,
		color: themeVariables.state.disabledText,
		cursor: 'not-allowed',
	};
};

/** Visible focus indicator for keyboard users: an outline in `focus.ring`, which meets 3:1 on every surface. */
export const focusRingStyles: CSSObject = {
	'&:focus-visible': {
		outline: `${themeVariables.focus.width} solid ${themeVariables.focus.ring}`,
		outlineOffset: themeVariables.focus.offset,
	},
};

/** Color transitions of interactive components, which stop under reduced motion with the duration tokens. */
export const colorTransitionStyles: CSSObject = {
	transitionProperty: 'background-color, border-color, color, box-shadow',
	transitionDuration: themeVariables.motion.duration.fast,
	transitionTimingFunction: themeVariables.motion.easing.standard,
};

/** Media query of the reduced motion preference, as a style object key. */
export const reducedMotion: string = `@media ${reducedMotionMediaQuery}`;

/** Hides content visually while keeping it in the accessibility tree. */
export const visuallyHiddenStyles: CSSObject = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	margin: '-1px',
	padding: 0,
	overflow: 'hidden',
	clip: 'rect(0 0 0 0)',
	whiteSpace: 'nowrap',
	border: 0,
};

/** Accessible names are never blank: an empty name hides a control as effectively as no name at all. */
export const assertLabel = (label: string, description: string): string => {
	if (label.trim() !== '') return label;
	throw new TypeError(`${description} cannot be blank.`);
};

/** Removes the styling props from the attributes forwarded to the DOM. */
export const forwardAllBut = (
	...styleProperties: readonly string[]
): ((property: PropertyKey) => boolean) => {
	return (property: PropertyKey): boolean => {
		// s stays with Emotion, which renders the element it names.
		return (
			typeof property !== 'string' || (property !== 'as' && !styleProperties.includes(property))
		);
	};
};
