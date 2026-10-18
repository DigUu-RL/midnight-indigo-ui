// Contrast pairs that the token set must satisfy (WCAG 2.2 AA) and an audit with explanatory failures.
import {
	compositeOver,
	contrastRatio,
	formatContrastRatio,
	isHexColor,
	isTranslucentColor,
} from '#src/tokens/color.ts';
import { listTokenEntries } from '#src/tokens/css-variables.ts';
import type { DesignTokens } from '#src/tokens/design-tokens.ts';
import { semanticIntents } from '#src/tokens/intents.ts';
import type { IntentTokens, SemanticIntent } from '#src/tokens/intents.ts';
import { supportColorNames } from '#src/tokens/support-colors.ts';
import type { SupportColor } from '#src/tokens/support-colors.ts';

/** Minimum ratios: 4.5:1 for normal text; 3:1 for large text (headings) and required non-text indicators. */
export const contrastMinimums = {
	text: 4.5,
	largeText: 3,
	nonText: 3,
} as const;

export type ContrastRequirement = keyof typeof contrastMinimums;

/** A foreground/background combination that is rendered by components, identified by token paths. */
export interface ContrastPair {
	foreground: string;
	background: string;
	/** Surface below a translucent `background` (`support.*.soft`), which is composited over it. */
	backdrop?: string;
	requirement: ContrastRequirement;
	usage: string;
}

/** A pair the design accepts below its WCAG minimum, with the lowest ratio it may reach and why. */
export interface ContrastException extends Omit<ContrastPair, 'backdrop'> {
	/** Lowest accepted ratio: the pair still fails below it, so a token change cannot lower it silently. */
	minimum: number;
	justification: string;
}

export interface ContrastResult extends ContrastPair {
	foregroundColor: string;
	backgroundColor: string;
	ratio: number;
	/** The WCAG minimum, or the lowest ratio accepted by an exception. */
	minimum: number;
	passes: boolean;
	/** Justification of the accepted exception that applies to the pair, if any. */
	exception: string | undefined;
	message: string;
}

/**
 * Pairs of the v2 design below the WCAG minimums, accepted on purpose. Each one is kept in the audit with the
 * lowest ratio it may reach, and documented in the accessibility page of the wiki.
 */
export const contrastExceptions: readonly ContrastException[] = [
	{
		foreground: 'border.default',
		background: 'surface.field',
		usage: 'Outline of a text field',
		requirement: 'nonText',
		minimum: 1.4,
		justification:
			'Outline of the v2 text fields. The field is identified by its visible label and its own background, and the focused field gets the pink focus border, which meets 3:1.',
	},
	{
		foreground: 'border.strong',
		background: 'surface.field',
		usage: 'Outline of a hovered text field',
		requirement: 'nonText',
		minimum: 2,
		justification:
			'Outline of a hovered v2 text field: hover is extra feedback, never the only way to find the field.',
	},
	{
		foreground: 'text.placeholder',
		background: 'surface.field',
		usage: 'Placeholder of a text field',
		requirement: 'text',
		minimum: 3.7,
		justification:
			'Placeholder of the v2 text fields: an example of the expected value, never the only instruction, since every field has a visible label.',
	},
	{
		foreground: 'border.default',
		background: 'surface.canvas',
		usage: 'Thumb of the page scrollbar',
		requirement: 'nonText',
		minimum: 1.4,
		justification:
			'Thumb of the page scrollbar (revises the 3:1 of F20): scrolling does not depend on it, and the high contrast modes give the scrollbar back to the system.',
	},
];

/**
 * Color tokens left out of the pairs on purpose, by token path (`*` matches one segment), with the reason. Any other
 * color token missing from the pairs makes `findUnauditedColorTokens` report it.
 */
export const contrastExemptTokens: Readonly<Record<string, string>> = {
	'color.*.*': 'Raw scales: they are audited through the semantic tokens that take their values.',
	'text.disabled': 'Disabled controls are exempt from WCAG 1.4.3 and 1.4.11.',
	'text.inverse': 'Dark ink of filled controls, audited as `intent.*.contrastText`.',
	'border.subtle': 'Decorative separation inside containers; grouping never depends on it alone.',
	'state.disabledSurface': 'Disabled controls are exempt from WCAG 1.4.3 and 1.4.11.',
	'state.disabledText': 'Disabled controls are exempt from WCAG 1.4.3 and 1.4.11.',
	'state.disabledBorder': 'Disabled controls are exempt from WCAG 1.4.3 and 1.4.11.',
	'intent.*.light': 'Tint of the intent, audited where it is used: `accent.linkHover`.',
	'intent.*.dark':
		'Shade of the intent for decoration; it never carries text or a required indicator.',
	'chart.grid': 'Decorative gridlines; values are read from the labels and the tooltip.',
	'chart.axis': 'Decorative axis line; values are read from the labels and the tooltip.',
	'backdrop.scrim': 'Scrim behind dialogs; nothing is read on it.',
};

const surfacesOf = (tokens: Readonly<DesignTokens>): string[] => {
	return Object.keys(tokens.surface).map((surface: string): string => `surface.${surface}`);
};

const onEverySurface = (
	tokens: Readonly<DesignTokens>,
	foreground: string,
	requirement: ContrastRequirement,
	usage: string,
): ContrastPair[] => {
	return surfacesOf(tokens).map((background: string): ContrastPair => {
		return { foreground, background, requirement, usage };
	});
};

const intentPairs = (tokens: Readonly<DesignTokens>, intent: SemanticIntent): ContrastPair[] => {
	const path = (field: keyof IntentTokens): string => `intent.${intent}.${field}`;

	const filledStates: ContrastPair[] = (['main', 'hover', 'pressed'] as const).map(
		(state: keyof IntentTokens): ContrastPair => {
			const usage: string = `Label of a filled ${intent} control (${state})`;
			return {
				foreground: path('contrastText'),
				background: path(state),
				requirement: 'text',
				usage,
			};
		},
	);

	const containerStates: ContrastPair[] = (
		['container', 'containerHover', 'containerPressed'] as const
	).map((state: keyof IntentTokens): ContrastPair => {
		const usage: string = `Text on a soft ${intent} container (${state})`;
		return { foreground: path('onContainer'), background: path(state), requirement: 'text', usage };
	});

	return [
		...filledStates,
		...containerStates,
		...onEverySurface(tokens, path('text'), 'text', `${intent} text, ghost and outline labels`),
		// Filled controls are bounded by `border` too, so `main` alone never has to stand out from the surface.
		...onEverySurface(
			tokens,
			path('border'),
			'nonText',
			`Boundary of an outlined or filled ${intent} control, and ${intent} indicators`,
		),
		{
			foreground: path('main'),
			background: path('container'),
			requirement: 'nonText',
			usage: `${intent} progress indicator on its track`,
		},
	];
};

// A support color is drawn on its tonal background over any surface, and on the bare surface as a dot or a mark.
const supportPairs = (tokens: Readonly<DesignTokens>, color: SupportColor): ContrastPair[] => {
	const path = (field: string): string => `support.${color}.${field}`;

	return surfacesOf(tokens).flatMap((backdrop: string): ContrastPair[] => {
		return [
			{
				foreground: path('text'),
				background: path('soft'),
				backdrop,
				requirement: 'text',
				usage: `Label of a ${color} tag, chip or avatar`,
			},
			{
				foreground: path('main'),
				background: path('soft'),
				backdrop,
				requirement: 'nonText',
				usage: `Icon on a ${color} tonal background`,
			},
			{
				foreground: path('main'),
				background: backdrop,
				requirement: 'nonText',
				usage: `${color} dot, marker or chart mark`,
			},
		];
	});
};

const chartPairs = (tokens: Readonly<DesignTokens>): ContrastPair[] => {
	const chartSurfaces: string[] = ['surface.canvas', 'surface.raised', 'chart.tooltipSurface'];

	const seriesPairs: ContrastPair[] = tokens.chart.series.flatMap(
		(_: string, index: number): ContrastPair[] => {
			const foreground: string = `chart.series.${String(index + 1)}`;

			return chartSurfaces.map((background: string): ContrastPair => {
				return { foreground, background, requirement: 'nonText', usage: 'Chart series mark' };
			});
		},
	);

	const labelPairs: ContrastPair[] = chartSurfaces.map((background: string): ContrastPair => {
		return { foreground: 'chart.label', background, requirement: 'text', usage: 'Chart labels' };
	});

	return [...seriesPairs, ...labelPairs];
};

const exceptionPairs = (): ContrastPair[] => {
	return contrastExceptions.map((exception: ContrastException): ContrastPair => {
		const { foreground, background, requirement, usage }: ContrastException = exception;
		return { foreground, background, requirement, usage };
	});
};

/**
 * Every pair the official design system commits to: text × surfaces × intents × support colors. Derived from the
 * token structure, not from values, so a new surface, intent, support color or chart series is audited by itself.
 */
export const createContrastPairs = (tokens: Readonly<DesignTokens>): ContrastPair[] => {
	return [
		...onEverySurface(tokens, 'text.primary', 'text', 'Body text and headings'),
		...onEverySurface(tokens, 'text.secondary', 'text', 'Supporting text'),
		...onEverySurface(tokens, 'text.muted', 'text', 'Placeholders, hints and captions'),
		...onEverySurface(
			tokens,
			'border.control',
			'nonText',
			'Boundary of inputs and interactive controls',
		),
		...onEverySurface(tokens, 'focus.ring', 'nonText', 'Focus indicator'),
		...onEverySurface(tokens, 'accent.link', 'text', 'Links'),
		...onEverySurface(tokens, 'accent.linkHover', 'text', 'Hovered links'),
		{
			foreground: 'accent.onSelection',
			background: 'accent.selection',
			requirement: 'text',
			usage: 'Selected text',
		},
		...(['hover', 'pressed', 'selected'] as const).map((state: string): ContrastPair => {
			const usage: string = `Text on a ${state} neutral item`;
			return {
				foreground: 'text.primary',
				background: `state.${state}`,
				requirement: 'text',
				usage,
			};
		}),
		...semanticIntents.flatMap((intent: SemanticIntent): ContrastPair[] => {
			return intentPairs(tokens, intent);
		}),
		...supportColorNames.flatMap((color: SupportColor): ContrastPair[] => {
			return supportPairs(tokens, color);
		}),
		...chartPairs(tokens),
		...exceptionPairs(),
	];
};

/** Resolves a dotted token path (`intent.official.main`, `chart.series.1`) to its value. */
export const resolveTokenPath = (tokens: Readonly<DesignTokens>, path: string): string => {
	const resolved: unknown = path.split('.').reduce((node: unknown, segment: string): unknown => {
		if (Array.isArray(node)) return node[Number(segment) - 1];
		return typeof node === 'object' && node !== null
			? (node as Record<string, unknown>)[segment]
			: undefined;
	}, tokens);

	if (typeof resolved !== 'string') throw new RangeError(`Unknown token path "${path}".`);
	return resolved;
};

/** The accepted exception for a pair, if any; a pair over a backdrop is never an exception. */
export const findContrastException = (pair: ContrastPair): ContrastException | undefined => {
	return pair.backdrop === undefined
		? contrastExceptions.find((exception: ContrastException): boolean => {
				return (
					exception.foreground === pair.foreground &&
					exception.background === pair.background &&
					exception.requirement === pair.requirement
				);
			})
		: undefined;
};

/** Names the pair as `foreground on background`, plus `over backdrop` for a translucent background. */
export const describeContrastPair = (pair: ContrastPair): string => {
	const pairName: string = `${pair.foreground} on ${pair.background}`;
	return pair.backdrop === undefined ? pairName : `${pairName} over ${pair.backdrop}`;
};

const describeResult = (
	pair: ContrastPair,
	ratio: number,
	minimum: number,
	exception: ContrastException | undefined,
): string => {
	const passes: boolean = ratio >= minimum;
	const verdict: string = passes ? 'meets' : 'FAILS';
	const measured: string = formatContrastRatio(ratio);
	const required: string = formatContrastRatio(minimum);

	const wcagMinimum: string = formatContrastRatio(contrastMinimums[pair.requirement]);

	const accepted: string =
		exception === undefined ? '' : `, an accepted exception to ${wcagMinimum}`;

	const summary: string = `${describeContrastPair(pair)} ${verdict} ${required}${accepted} (${pair.requirement}): ${measured}`;
	return passes ? summary : `${summary}. Used for: ${pair.usage}. Adjust one of the two tokens.`;
};

export const evaluateContrastPair = (
	tokens: Readonly<DesignTokens>,
	pair: ContrastPair,
): ContrastResult => {
	const backdropColor: string | undefined =
		pair.backdrop === undefined ? undefined : resolveTokenPath(tokens, pair.backdrop);

	const foregroundColor: string = resolveTokenPath(tokens, pair.foreground);
	const declaredBackground: string = resolveTokenPath(tokens, pair.background);

	const backgroundColor: string =
		backdropColor === undefined
			? declaredBackground
			: compositeOver(declaredBackground, backdropColor);

	const exception: ContrastException | undefined = findContrastException(pair);
	const ratio: number = contrastRatio(foregroundColor, backgroundColor);
	const minimum: number = exception?.minimum ?? contrastMinimums[pair.requirement];

	return {
		...pair,
		foregroundColor,
		backgroundColor,
		ratio,
		minimum,
		passes: ratio >= minimum,
		exception: exception?.justification,
		message: describeResult(pair, ratio, minimum, exception),
	};
};

/** Evaluates every committed pair; failures carry a message naming the tokens, the ratio and the usage. */
export const auditContrast = (tokens: Readonly<DesignTokens>): ContrastResult[] => {
	return createContrastPairs(tokens).map((pair: ContrastPair): ContrastResult => {
		return evaluateContrastPair(tokens, pair);
	});
};

/** Report of the failing pairs, one per line; empty when every pair passes. */
export const formatContrastReport = (results: readonly ContrastResult[]): string => {
	const failures: ContrastResult[] = results.filter(
		(result: ContrastResult): boolean => !result.passes,
	);

	if (failures.length === 0) return '';

	return [
		`${String(failures.length)} contrast pair(s) fail:`,
		...failures.map((result: ContrastResult): string => `- ${result.message}`),
	].join('\n');
};

const matchesTokenPattern = (path: string, pattern: string): boolean => {
	const pathSegments: string[] = path.split('.');
	const patternSegments: string[] = pattern.split('.');

	return (
		pathSegments.length === patternSegments.length &&
		patternSegments.every((segment: string, index: number): boolean => {
			return segment === '*' || segment === pathSegments[index];
		})
	);
};

/** Paths of every token whose value is a color, opaque or translucent. */
export const listColorTokenPaths = (tokens: Readonly<DesignTokens>): string[] => {
	return listTokenEntries(tokens)
		.filter(
			([, value]: [string[], string]): boolean => isHexColor(value) || isTranslucentColor(value),
		)
		.map(([path]: [string[], string]): string => path.join('.'));
};

/** Color tokens that are neither in a contrast pair nor exempt in `contrastExemptTokens`. */
export const findUnauditedColorTokens = (tokens: Readonly<DesignTokens>): string[] => {
	const audited: Set<string> = new Set<string>(
		createContrastPairs(tokens).flatMap((pair: ContrastPair): string[] => {
			return [
				pair.foreground,
				pair.background,
				...(pair.backdrop === undefined ? [] : [pair.backdrop]),
			];
		}),
	);

	const exemptPatterns: string[] = Object.keys(contrastExemptTokens);

	return listColorTokenPaths(tokens).filter((path: string): boolean => {
		return (
			!audited.has(path) &&
			!exemptPatterns.some((pattern: string): boolean => matchesTokenPattern(path, pattern))
		);
	});
};
