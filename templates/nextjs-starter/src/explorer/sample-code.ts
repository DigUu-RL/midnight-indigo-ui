// The code of the samples the explorer gives to the props that take an element or an object (the `slots` of the
// catalog), e.g. the icon of an `IconButton`, the children of a `Stack` or the `change` of a `StatCard`: the playground
// writes it into its snippet, which a test type-checks. `samples.tsx` renders the same values; a test of the pages
// checks that they match. Plain data, so the scripts and the tests of the starter read it too.

export interface SampleCode {
	/** Names each sample imports, by public subpath (after `@midnight-indigo/ui/`). */
	imports: Readonly<Record<string, readonly string[]>>;
	/** JSX, one element per line or across lines, indented with tabs; or an object literal. */
	code: string;
}

export interface SamplePlanet {
	name: string;
	region: string;
	description: string;
}

export interface SampleCrewMember {
	name: string;
	role: string;
}

export const samplePlanets: readonly SamplePlanet[] = [
	{
		name: 'Tatooine',
		region: 'Outer Rim',
		description: 'A desert world under twin suns, far from the bright center of the galaxy.',
	},
	{
		name: 'Hoth',
		region: 'Anoat sector',
		description: 'A frozen planet where the Rebel Alliance hid Echo Base.',
	},
	{
		name: 'Dagobah',
		region: 'Sluis sector',
		description: 'A swamp world where Yoda lived in exile.',
	},
];

export const sampleCrew: readonly SampleCrewMember[] = [
	{ name: 'Spike Spiegel', role: 'Bounty hunter' },
	{ name: 'Faye Valentine', role: 'Gambler' },
	{ name: 'Jet Black', role: 'Captain of the Bebop' },
];

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
	pilotAvatar: {
		imports: { 'data-display': ['Avatar'] },
		code: "<Avatar name='Spike Spiegel' />",
	},
	briefSections: {
		imports: { 'data-display': ['CardContent', 'CardHeader'] },
		code: [
			"<CardHeader title='Mission brief' subtitle='Leia Organa' />",
			'<CardContent>Reach Hoth before the Imperial fleet and evacuate Echo Base.</CardContent>',
		].join('\n'),
	},
	planetSlides: {
		imports: { 'data-display': ['Card', 'CardContent', 'CardHeader'] },
		code: samplePlanets
			.map((planet: SamplePlanet): string => {
				return [
					'<Card>',
					`\t<CardHeader title='${planet.name}' subtitle='${planet.region}' />`,
					`\t<CardContent>${planet.description}</CardContent>`,
					'</Card>',
				].join('\n');
			})
			.join('\n\n'),
	},
	crewItems: {
		imports: { 'data-display': ['ListItem'] },
		code: sampleCrew
			.map((member: SampleCrewMember): string => {
				return `<ListItem title='${member.name}' description='${member.role}' />`;
			})
			.join('\n'),
	},
	bountyChange: {
		imports: {},
		code: "{ value: '12%', trend: 'up' }",
	},
} as const satisfies Readonly<Record<string, SampleCode>>;

export type SampleName = keyof typeof sampleCodes;
