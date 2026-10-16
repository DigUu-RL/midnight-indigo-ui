// Renders the module of glyph data from the Tabler collection.
import { getIconData } from '#src/icons/icon-data/index.ts';
import type { IconifyCollection, IconifyIconData } from '#src/icons/icon-data/index.ts';

export const generationCommand: string = 'pnpm --filter @midnight-indigo/ui generate:glyphs';

/** Tabler icon drawn for each glyph of the components. */
export const glyphSources: Readonly<Record<string, string>> = {
	alert: 'alert-circle',
	arrowDown: 'arrow-down',
	arrowUp: 'arrow-up',
	check: 'check',
	checkCircle: 'circle-check',
	chevronDown: 'chevron-down',
	chevronLeft: 'chevron-left',
	chevronRight: 'chevron-right',
	close: 'x',
	externalLink: 'external-link',
	eye: 'eye',
	eyeOff: 'eye-off',
	inbox: 'inbox',
	info: 'info-circle',
	menu: 'menu-2',
	minus: 'minus',
	plus: 'plus',
	search: 'search',
	sortable: 'selector',
	star: 'star',
	upload: 'upload',
	warning: 'alert-triangle',
};

/** Data of each glyph, as the generated module holds it. */
export const resolveGlyphs = (
	collection: IconifyCollection,
	sources: Readonly<Record<string, string>>,
): Record<string, IconifyIconData> => {
	return Object.fromEntries(
		Object.entries(sources).map(
			([glyph, iconName]: [string, string]): [string, IconifyIconData] => {
				const icon: IconifyIconData | undefined = getIconData(collection, iconName);

				if (icon === undefined) {
					throw new Error(`Tabler has no icon "${iconName}" for the glyph ${glyph}.`);
				}

				return [glyph, { width: icon.width ?? 24, height: icon.height ?? 24, body: icon.body }];
			},
		),
	);
};

export const renderGlyphModule = (
	collection: IconifyCollection,
	sources: Readonly<Record<string, string>>,
): string => {
	const glyphs: Record<string, IconifyIconData> = resolveGlyphs(collection, sources);
	const names: string[] = Object.keys(glyphs);

	const entries: string[] = names.map((glyph: string): string => {
		return `\t// tabler:${sources[glyph] ?? ''}\n\t${glyph}: ${JSON.stringify(glyphs[glyph])},`;
	});

	return [
		`// Generated from Tabler Icons (MIT, https://tabler.io/icons) by \`${generationCommand}\`. Do not edit by hand.`,
		"import type { IconifyIconData } from '#src/icons/icon-data/index.ts';",
		'',
		`export type GlyphName = ${names.map((glyph: string): string => `'${glyph}'`).join(' | ')};`,
		'',
		'export const glyphData: Readonly<Record<GlyphName, IconifyIconData>> = {',
		...entries,
		'};',
		'',
	].join('\n');
};
