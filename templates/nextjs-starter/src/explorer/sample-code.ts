// The code of the samples the explorer gives to the props that take an element (the `slots` of the catalog), e.g. the
// icon of an `IconButton` or the children of a `Stack`: the playground writes it into its snippet, which a test
// type-checks. `samples.tsx` renders the same elements; a test of the pages checks that they match. Plain data, so the
// scripts and the tests of the starter read it too.

export interface SampleCode {
	/** Names each sample imports, by public subpath (after `@midnight-indigo/ui/`). */
	imports: Readonly<Record<string, readonly string[]>>;
	/** JSX, one element per line or across lines, indented with tabs. */
	code: string;
}

export const sampleCodes = {
	plusIcon: {
		imports: { icons: ['Icon'] },
		code: [
			'<Icon decorative>',
			'\t<path',
			"\t\td='M12 5v14m-7-7h14'",
			"\t\tfill='none'",
			"\t\tstroke='currentColor'",
			'\t\tstrokeWidth={2}',
			"\t\tstrokeLinecap='round'",
			'\t/>',
			'</Icon>',
		].join('\n'),
	},
	missionBrief: {
		imports: { 'data-display': ['Card', 'CardContent', 'CardHeader'] },
		code: [
			'<Card>',
			"\t<CardHeader title='Mission brief' subtitle='Leia Organa' />",
			'\t<CardContent>Reach Hoth before the Imperial fleet and evacuate Echo Base.</CardContent>',
			'</Card>',
		].join('\n'),
	},
	crewAvatars: {
		imports: { 'data-display': ['Avatar'] },
		code: [
			"<Avatar name='Spike Spiegel' size='small' />",
			"<Avatar name='Faye Valentine' size='medium' intent='brand' />",
			"<Avatar name='Jet Black' size='large' intent='info' />",
		].join('\n'),
	},
	planetCards: {
		imports: { 'data-display': ['Card', 'CardContent'] },
		code: ['Tatooine', 'Hoth', 'Dagobah', 'Endor']
			.map((planet: string): string => `<Card>\n\t<CardContent>${planet}</CardContent>\n</Card>`)
			.join('\n\n'),
	},
} as const satisfies Readonly<Record<string, SampleCode>>;

export type SampleName = keyof typeof sampleCodes;
