// Contrast pairs that the token set must satisfy (WCAG 2.2 AA) and an audit with explanatory failures.
import { contrastRatio, formatContrastRatio } from './color.ts';
import type { DesignTokens, SurfaceTokens } from './design-tokens.ts';
import { semanticIntents } from './intents.ts';
import type { IntentTokens, SemanticIntent } from './intents.ts';

/** Minimum ratios: 4.5:1 for normal text; 3:1 for large text and required non-text indicators. */
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
	requirement: ContrastRequirement;
	usage: string;
}

export interface ContrastResult extends ContrastPair {
	foregroundColor: string;
	backgroundColor: string;
	ratio: number;
	minimum: number;
	passes: boolean;
	message: string;
}

const surfaceNames: readonly (keyof SurfaceTokens)[] = [
	'canvas',
	'sunken',
	'base',
	'raised',
	'overlay',
];

const onEverySurface = (
	foreground: string,
	requirement: ContrastRequirement,
	usage: string,
): ContrastPair[] => {
	return surfaceNames.map((surface: keyof SurfaceTokens): ContrastPair => {
		return { foreground, background: `surface.${surface}`, requirement, usage };
	});
};

const intentPairs = (intent: SemanticIntent): ContrastPair[] => {
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
		...onEverySurface(path('text'), 'text', `${intent} text, ghost and outline labels`),
		...onEverySurface(path('border'), 'nonText', `Boundary of an outlined ${intent} control`),
		...onEverySurface(path('main'), 'nonText', `Boundary of a filled ${intent} control`),
	];
};

/** Every pair the official design system commits to; derived from the token structure, not from values. */
export const createContrastPairs = (tokens: Readonly<DesignTokens>): ContrastPair[] => {
	const seriesPairs: ContrastPair[] = tokens.chart.series.flatMap(
		(_: string, index: number): ContrastPair[] => {
			const foreground: string = `chart.series.${String(index + 1)}`;

			return (['canvas', 'raised'] as const).map((surface: keyof SurfaceTokens): ContrastPair => {
				return {
					foreground,
					background: `surface.${surface}`,
					requirement: 'nonText',
					usage: 'Chart series mark',
				};
			});
		},
	);

	return [
		...onEverySurface('text.primary', 'text', 'Body text and headings'),
		...onEverySurface('text.secondary', 'text', 'Supporting text'),
		...onEverySurface('text.muted', 'text', 'Placeholders, hints and captions'),
		...onEverySurface('border.strong', 'nonText', 'Boundary of inputs and interactive controls'),
		...onEverySurface('focus.ring', 'nonText', 'Focus indicator'),
		...onEverySurface('accent.link', 'text', 'Links'),
		...onEverySurface('accent.linkHover', 'text', 'Hovered links'),
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
		...semanticIntents.flatMap(intentPairs),
		...seriesPairs,
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

const describeResult = (
	pair: ContrastPair,
	ratio: number,
	minimum: number,
	passes: boolean,
): string => {
	const verdict: string = passes ? 'meets' : 'FAILS';
	const measured: string = formatContrastRatio(ratio);
	const required: string = formatContrastRatio(minimum);
	const summary: string = `${pair.foreground} on ${pair.background} ${verdict} ${required} (${pair.requirement}): ${measured}`;
	return passes ? summary : `${summary}. Used for: ${pair.usage}. Adjust one of the two tokens.`;
};

export const evaluateContrastPair = (
	tokens: Readonly<DesignTokens>,
	pair: ContrastPair,
): ContrastResult => {
	const foregroundColor: string = resolveTokenPath(tokens, pair.foreground);
	const backgroundColor: string = resolveTokenPath(tokens, pair.background);
	const ratio: number = contrastRatio(foregroundColor, backgroundColor);
	const minimum: number = contrastMinimums[pair.requirement];
	const passes: boolean = ratio >= minimum;

	return {
		...pair,
		foregroundColor,
		backgroundColor,
		ratio,
		minimum,
		passes,
		message: describeResult(pair, ratio, minimum, passes),
	};
};

/** Evaluates every committed pair; failures carry a message naming the tokens, the ratio and the usage. */
export const auditContrast = (tokens: Readonly<DesignTokens>): ContrastResult[] => {
	return createContrastPairs(tokens).map((pair: ContrastPair): ContrastResult => {
		return evaluateContrastPair(tokens, pair);
	});
};
