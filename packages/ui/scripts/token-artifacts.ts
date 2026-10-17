// Renders the files generated from the tokens: the public stylesheet and the token reference document.
import {
	auditContrast,
	breakpointMediaQuery,
	breakpointNames,
	breakpoints,
	createTokenStylesheet,
	cssVariableName,
	formatContrastRatio,
	listTokenEntries,
	semanticIntents,
	tokenDescriptions,
	tokens,
	typographyRoles,
} from '#src/tokens/index.ts';
import type {
	Breakpoint,
	ColorTokens,
	ContrastResult,
	DesignTokens,
	IntentTokens,
	SemanticIntent,
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
	focus: tokenDescriptions.focus,
	accent: tokenDescriptions.accent,
	state: tokenDescriptions.state,
	chart: tokenDescriptions.chart,
	radius: tokenDescriptions.radius,
	elevation: tokenDescriptions.elevation,
	layer: tokenDescriptions.layer,
	backdrop: tokenDescriptions.backdrop,
	fontFamily: tokenDescriptions.fontFamily,
	fontWeight: tokenDescriptions.fontWeight,
	iconSize: tokenDescriptions.iconSize,
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
			tokenDescriptions.typography[role],
		];
	});

	return [
		`### ${code('typography')}`,
		'',
		tokenDescriptions.groups.typography,
		'',
		'Every role has the fields `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` and `letterSpacing`, declared as',
		`${code(cssVariableName(['typography', '<role>', '<field>']))}, e.g. ${code(cssVariableName(['typography', 'body', 'fontSize']))}.`,
		'',
		...renderTable(
			['Role', 'Font', 'Size', 'Line height', 'Weight', 'Letter spacing', 'Usage'],
			rows,
		),
		'',
	];
};

const renderContrast = (): string[] => {
	const results: ContrastResult[] = auditContrast(tokens);

	const rows: string[][] = results.map((result: ContrastResult): string[] => {
		return [
			code(result.foreground),
			code(result.background),
			formatContrastRatio(result.ratio),
			formatContrastRatio(result.minimum),
			result.usage,
			result.passes ? 'Pass' : '**Fail**',
		];
	});

	return [
		'## Contrast pairs',
		'',
		'Every pair below is checked in CI against WCAG 2.2 AA: 4.5:1 for text, 3:1 for non-text indicators.',
		'Ratios are truncated, never rounded up. All colors are opaque, so the ratio is that of the rendered pair.',
		'',
		...renderTable(['Foreground', 'Background', 'Ratio', 'Minimum', 'Usage', 'Result'], rows),
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

const documentedGroups: readonly TokenGroup[] = [
	'surface',
	'text',
	'border',
	'focus',
	'accent',
	'state',
	'chart',
	'radius',
	'spacing',
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
		'scales: [palette.md](./palette.md).',
		'',
		'## Tokens',
		'',
		...renderColorScales(),
		...documentedGroups.slice(0, 6).flatMap(renderGroup),
		...renderIntents(),
		...documentedGroups.slice(6).flatMap(renderGroup),
		...renderTypography(),
		...renderGroup('iconSize'),
		...renderBreakpoints(),
		...renderContrast(),
	].join('\n');
};
