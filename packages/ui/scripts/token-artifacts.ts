// Renders the files generated from the tokens: the public stylesheet and the token reference document.
import {
	auditContrast,
	breakpointMediaQuery,
	breakpointNames,
	breakpoints,
	contrastExceptions,
	contrastExemptTokens,
	contrastMinimums,
	createTokenStylesheet,
	cssVariableName,
	formatContrastRatio,
	listTokenEntries,
	measureSupportContrast,
	measureSurfaceLayers,
	semanticIntents,
	surfaceLayers,
	tokenDescriptions,
	tokens,
	typographyRoles,
} from '#src/tokens/index.ts';
import type {
	Breakpoint,
	ColorTokens,
	ContrastException,
	ContrastResult,
	DesignTokens,
	HexColor,
	IntentTokens,
	SemanticIntent,
	SupportColorTokens,
	SupportContrastMeasure,
	SurfaceLayerMeasure,
	SurfaceTokens,
	TypographyRole,
	TypographyStyle,
} from '#src/tokens/index.ts';

export const generationCommand: string = 'pnpm --filter @midnight-indigo/ui generate:tokens';

const generatedNotice: string = `Generated from \`src/tokens\` by \`${generationCommand}\`. Do not edit by hand.`;

export const renderStylesheet = (): string => {
	return [
		`/* Public styles of \`@midnight-indigo/ui/styles.css\`. ${generatedNotice} */`,
		'',
		createTokenStylesheet(tokens),
	].join('\n');
};

const escapeCell = (value: string): string => value.replaceAll('|', '\\|');

const renderTable = (header: readonly string[], rows: readonly (readonly string[])[]): string[] => {
	return [
		`| ${header.join(' | ')} |`,
		`| ${header.map((): string => '---').join(' | ')} |`,
		...rows.map((row: readonly string[]): string => `| ${row.map(escapeCell).join(' | ')} |`),
	];
};

const code = (value: string): string => `\`${value}\``;

type TokenGroup = keyof DesignTokens;

// Scale groups (spacing, motion) are described at group level only.
const tokenPurposes: Partial<Record<TokenGroup, Readonly<Record<string, string>>>> = {
	surface: tokenDescriptions.surface,
	text: tokenDescriptions.text,
	border: tokenDescriptions.border,
	stroke: tokenDescriptions.stroke,
	focus: tokenDescriptions.focus,
	accent: tokenDescriptions.accent,
	state: tokenDescriptions.state,
	chart: tokenDescriptions.chart,
	radius: tokenDescriptions.radius,
	controlHeight: tokenDescriptions.controlHeight,
	card: tokenDescriptions.card,
	elevation: tokenDescriptions.elevation,
	layer: tokenDescriptions.layer,
	backdrop: tokenDescriptions.backdrop,
	fontFamily: tokenDescriptions.fontFamily,
	fontWeight: tokenDescriptions.fontWeight,
	iconSize: tokenDescriptions.iconSize,
	tonalIcon: tokenDescriptions.tonalIcon,
};

const describeToken = (group: TokenGroup, name: string): string => {
	return tokenPurposes[group]?.[name] ?? '';
};

const renderGroup = (group: TokenGroup): string[] => {
	const rows: string[][] = listTokenEntries(tokens)
		.filter(([path]: [string[], string]): boolean => path[0] === group)
		.map(([path, value]: [string[], string]): string[] => {
			return [
				code(path.join('.')),
				code(cssVariableName(path)),
				code(value),
				describeToken(group, path[1] ?? ''),
			];
		});

	return [
		`### ${code(group)}`,
		'',
		tokenDescriptions.groups[group],
		'',
		...renderTable(['Token', 'CSS variable', 'Value', 'Purpose'], rows),
		'',
	];
};

const renderIntents = (): string[] => {
	const fields: (keyof IntentTokens)[] = Object.keys(
		tokenDescriptions.intentFields,
	) as (keyof IntentTokens)[];

	const roleRows: string[][] = semanticIntents.map((intent: SemanticIntent): string[] => {
		return [code(intent), tokenDescriptions.intents[intent]];
	});

	const fieldRows: string[][] = fields.map((field: keyof IntentTokens): string[] => {
		return [
			code(field),
			code(cssVariableName(['intent', '<intent>', field])),
			tokenDescriptions.intentFields[field],
		];
	});

	const valueRows: string[][] = fields.map((field: keyof IntentTokens): string[] => {
		const values: string[] = semanticIntents.map((intent: SemanticIntent): string => {
			return code(tokens.intent[intent][field]);
		});

		return [code(field), ...values];
	});

	return [
		`### ${code('intent')}`,
		'',
		tokenDescriptions.groups.intent,
		'',
		...renderTable(['Intent', 'Role'], roleRows),
		'',
		'Fields shared by every intent. Only `main` is required in a source; the other fields are derived from it',
		'deterministically (`deriveIntentTokens`) unless provided explicitly.',
		'',
		...renderTable(['Field', 'CSS variable', 'Purpose'], fieldRows),
		'',
		...renderTable(['Field', ...semanticIntents.map(code)], valueRows),
		'',
	];
};

const renderSupport = (): string[] => {
	const fields: (keyof SupportColorTokens)[] = Object.keys(
		tokenDescriptions.supportFields,
	) as (keyof SupportColorTokens)[];

	const fieldRows: string[][] = fields.map((field: keyof SupportColorTokens): string[] => {
		return [
			code(field),
			code(cssVariableName(['support', '<color>', field])),
			tokenDescriptions.supportFields[field],
		];
	});

	const colorRows: string[][] = measureSupportContrast(
		tokens.support,
		surfaceLayers.map((surface: keyof SurfaceTokens): HexColor => tokens.surface[surface]),
	).map((measure: SupportContrastMeasure): string[] => {
		const { main, soft, text }: SupportColorTokens = tokens.support[measure.color];

		return [
			code(measure.color),
			code(main),
			code(text),
			code(soft),
			formatContrastRatio(measure.textRatio),
			formatContrastRatio(measure.iconRatio),
			tokenDescriptions.support[measure.color],
		];
	});

	return [
		`### ${code('support')}`,
		'',
		tokenDescriptions.groups.support,
		'',
		...renderTable(['Field', 'CSS variable', 'Purpose'], fieldRows),
		'',
		'The ratios are the lowest of `text` and `main` on `soft` at 14% and at 18%, over every surface (checked in CI).',
		'',
		...renderTable(
			['Color', '`main`', '`text`', '`soft`', 'Text on soft', 'Icon on soft', 'Notes'],
			colorRows,
		),
		'',
	];
};

const renderColorScales = (): string[] => {
	const scales: (keyof ColorTokens)[] = Object.keys(tokens.color) as (keyof ColorTokens)[];

	const renderScale = (scale: keyof ColorTokens): string[] => {
		const roles: Readonly<Record<string, string>> = tokenDescriptions.colorSteps[scale];

		const rows: string[][] = Object.entries(tokens.color[scale]).map(
			([step, value]: [string, string]): string[] => {
				return [
					code(step),
					code(cssVariableName(['color', scale, step])),
					code(value),
					roles[step] ?? '',
				];
			},
		);

		return [
			`#### ${code(`color.${scale}`)}`,
			'',
			tokenDescriptions.color[scale],
			'',
			...renderTable(['Step', 'CSS variable', 'Value', 'Role'], rows),
			'',
		];
	};

	return [
		`### ${code('color')}`,
		'',
		tokenDescriptions.groups.color,
		'',
		...scales.flatMap(renderScale),
	];
};

const renderSurfaceLayers = (): string[] => {
	const rows: string[][] = measureSurfaceLayers(tokens).map(
		(layer: SurfaceLayerMeasure): string[] => {
			return [
				code(`surface.${layer.surface}`),
				code(layer.color),
				layer.luminance.toFixed(5),
				layer.luminanceStep === undefined ? '—' : `+${layer.luminanceStep.toFixed(5)}`,
				layer.ratioToPrevious === undefined ? '—' : formatContrastRatio(layer.ratioToPrevious),
			];
		},
	);

	return [
		'#### Surface layers',
		'',
		'From the darkest to the lightest. Each layer is lighter than the one below it (checked in CI); the difference is',
		'small by design, so a layer that must stand out from its neighbor also takes a border or an elevation.',
		'',
		...renderTable(
			[
				'Layer',
				'Value',
				'Relative luminance',
				'Step over the layer below',
				'Ratio to the layer below',
			],
			rows,
		),
		'',
	];
};

const describeFontFamily = (fontFamily: string): string => {
	return fontFamily === tokens.fontFamily.mono ? code('mono') : code('sans');
};

const renderTypography = (): string[] => {
	const rows: string[][] = typographyRoles.map((role: TypographyRole): string[] => {
		const style: TypographyStyle = tokens.typography[role];

		return [
			code(role),
			describeFontFamily(style.fontFamily),
			code(style.fontSize),
			code(style.lineHeight),
			code(style.fontWeight),
			code(style.letterSpacing),
			code(style.textTransform),
			tokenDescriptions.typography[role],
		];
	});

	return [
		`### ${code('typography')}`,
		'',
		tokenDescriptions.groups.typography,
		'',
		'Every role has the fields `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` and',
		`${code('textTransform')}, declared as ${code(cssVariableName(['typography', '<role>', '<field>']))}, e.g.`,
		`${code(cssVariableName(['typography', 'body', 'fontSize']))}.`,
		'',
		...renderTable(
			['Role', 'Font', 'Size', 'Line height', 'Weight', 'Letter spacing', 'Transform', 'Usage'],
			rows,
		),
		'',
	];
};

const renderContrast = (): string[] => {
	const results: ContrastResult[] = auditContrast(tokens);

	const rows: string[][] = results.map((result: ContrastResult): string[] => {
		const background: string =
			result.backdrop === undefined
				? code(result.background)
				: `${code(result.background)} over ${code(result.backdrop)}`;

		const verdict: string = result.passes ? 'Pass' : '**Fail**';

		return [
			code(result.foreground),
			background,
			formatContrastRatio(result.ratio),
			formatContrastRatio(result.minimum),
			result.usage,
			result.exception === undefined ? verdict : `${verdict} (exception)`,
		];
	});

	const exceptionRows: string[][] = contrastExceptions.map(
		(exception: ContrastException): string[] => {
			return [
				code(exception.foreground),
				code(exception.background),
				formatContrastRatio(contrastMinimums[exception.requirement]),
				formatContrastRatio(exception.minimum),
				exception.justification,
			];
		},
	);

	const exemptRows: string[][] = Object.entries(contrastExemptTokens).map(
		([pattern, reason]: [string, string]): string[] => [code(pattern), reason],
	);

	return [
		'## Contrast pairs',
		'',
		'Every pair below is checked in CI against WCAG 2.2 AA: 4.5:1 for text, 3:1 for large text and non-text',
		'indicators. Ratios are truncated, never rounded up. A translucent background (`support.*.soft`) is composited',
		'over the surface named after "over", so the ratio is that of the rendered pair. Every color token is either in a',
		'pair or exempt below; a new color token in neither fails the audit.',
		'',
		...renderTable(['Foreground', 'Background', 'Ratio', 'Minimum', 'Usage', 'Result'], rows),
		'',
		'### Accepted exceptions',
		'',
		'Pairs of the v2 design accepted below the WCAG minimum. Each one keeps the lowest ratio it may reach: a token',
		'change that lowers it further still fails.',
		'',
		...renderTable(
			['Foreground', 'Background', 'WCAG minimum', 'Accepted minimum', 'Justification'],
			exceptionRows,
		),
		'',
		'### Tokens outside the pairs',
		'',
		...renderTable(['Token', 'Reason'], exemptRows),
		'',
	];
};

const breakpointUsages: Readonly<Record<Breakpoint, string>> = {
	compact: 'Phones in portrait',
	medium: 'Tablets in portrait, large phones in landscape',
	expanded: 'Tablets in landscape, small laptops',
	large: 'Desktops',
	extraLarge: 'Wide monitors',
};

const renderBreakpoints = (): string[] => {
	const rows: string[][] = breakpointNames.map((breakpoint: Breakpoint): string[] => {
		return [
			code(breakpoint),
			`${String(breakpoints[breakpoint])} px`,
			code(breakpointMediaQuery(breakpoint)),
			breakpointUsages[breakpoint],
		];
	});

	return [
		`### ${code('breakpoints')}`,
		'',
		'Viewport widths where layouts change, mobile first: each applies from its width up. They are plain values, not',
		'CSS custom properties, because media queries cannot read custom properties. The media queries are in `em`, so a',
		'larger default text size gets the layout of a narrower viewport. How the components use them:',
		'[navigation.md](./navigation.md#breakpoints).',
		'',
		...renderTable(['Name', 'From', 'Media query', 'Typical devices'], rows),
		'',
	];
};

// `surface` is rendered first, followed by its layers.
const documentedGroups: readonly TokenGroup[] = [
	'text',
	'border',
	'stroke',
	'focus',
	'accent',
	'state',
	'chart',
	'radius',
	'spacing',
	'controlHeight',
	'card',
	'elevation',
	'layer',
	'backdrop',
	'motion',
	'fontFamily',
	'fontWeight',
];

export const renderTokenDocument = (): string => {
	return [
		'# Design tokens',
		'',
		`<!-- ${generatedNotice} -->`,
		'',
		'Midnight Indigo: UI is dark-only: there is no light palette and no light/dark toggle.',
		'Every token is exported by `@midnight-indigo/ui/tokens` and declared as a CSS custom property in',
		'`@midnight-indigo/ui/styles.css`. Components reference tokens, never hexadecimal values.',
		'',
		'`intent.official.main` and `color.pink.400` are the exact Midnight Indigo keyword pink, `#FF6AC1`. The other',
		'intent `main` values are provisional proposals until the stable API.',
		'',
		'How to apply the typography, icon and motion tokens: [foundations.md](./foundations.md). How to use the color',
		'scales: [palette.md](./palette.md). Which radius, height and spacing each component takes:',
		'[components.md](./components.md#shape-and-scale).',
		'',
		'## Tokens',
		'',
		...renderColorScales(),
		...renderGroup('surface'),
		...renderSurfaceLayers(),
		...documentedGroups.slice(0, 6).flatMap(renderGroup),
		...renderIntents(),
		...renderSupport(),
		...documentedGroups.slice(6).flatMap(renderGroup),
		...renderTypography(),
		...renderGroup('iconSize'),
		...renderGroup('tonalIcon'),
		...renderBreakpoints(),
		...renderContrast(),
	].join('\n');
};
