// The code of the samples the explorer gives to the props that take an element, an object or a function (the `slots`
// of the catalog), e.g. the icon of an `IconButton`, the children of a `Stack`, the `change` of a `StatCard` or the
// columns of a `DataTable`: the playground writes it into its snippet, which a test type-checks. `samples.tsx` renders
// the same values; a test of the pages checks that they match. Plain data, so the scripts and the tests of the starter
// read it too.

export interface SampleCode {
	/** Names each sample imports, by public subpath (after `@midnight-indigo/ui/`). */
	imports: Readonly<Record<string, readonly string[]>>;
	/** Types each sample imports, by public subpath. */
	typeImports?: Readonly<Record<string, readonly string[]>>;
	/**
	 * Declarations the code refers to, written once before the component even when several samples share them, e.g.
	 * the type of the rows of a `DataTable`.
	 */
	declarations?: readonly string[];
	/** JSX, one element per line or across lines, indented with tabs; an object literal; or a name it declares. */
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

export interface SampleBounty {
	name: string;
	planet: string;
	/** In woolongs. */
	reward: number;
}

export const sampleBounties: readonly SampleBounty[] = [
	{ name: 'Asimov Solensan', planet: 'Mars', reward: 2500000 },
	{ name: 'Abdul Hakim', planet: 'Ganymede', reward: 2500000 },
	{ name: 'Mad Pierrot', planet: 'Earth', reward: 12000000 },
	{ name: 'Teddy Bomber', planet: 'Mars', reward: 30000000 },
	{ name: 'Rocco Bonnaro', planet: 'Callisto', reward: 15000 },
	{ name: 'Vincent Volaju', planet: 'Titan', reward: 300000000 },
];

const bountyType: string = [
	'interface Bounty {',
	'\tname: string;',
	'\tplanet: string;',
	'\treward: number;',
	'}',
].join('\n');

const bountyColumns: string = [
	'const bountyColumns: readonly DataTableColumn<Bounty>[] = [',
	'\t{',
	"\t\tid: 'name',",
	"\t\theader: 'Name',",
	'\t\tcell: (bounty: Bounty): string => bounty.name,',
	'\t\tsortValue: (bounty: Bounty): string => bounty.name,',
	'\t\tfilterValue: (bounty: Bounty): string => bounty.name,',
	'\t\trowHeader: true,',
	'\t},',
	'\t{',
	"\t\tid: 'planet',",
	"\t\theader: 'Last seen',",
	'\t\tcell: (bounty: Bounty): string => bounty.planet,',
	'\t\tfilterValue: (bounty: Bounty): string => bounty.planet,',
	'\t},',
	'\t{',
	"\t\tid: 'reward',",
	"\t\theader: 'Reward',",
	"\t\tcell: (bounty: Bounty): string => `${bounty.reward.toLocaleString('en-US')} woolongs`,",
	'\t\tsortValue: (bounty: Bounty): number => bounty.reward,',
	"\t\talign: 'end',",
	'\t},',
	'];',
].join('\n');

const bountyRows: string = [
	'const bounties: readonly Bounty[] = [',
	...sampleBounties.map((bounty: SampleBounty): string => {
		return `\t{ name: '${bounty.name}', planet: '${bounty.planet}', reward: ${String(bounty.reward)} },`;
	}),
	'];',
].join('\n');

/** The source a `CodeBlock` of the playground shows. */
export const sampleJumpSource: string = [
	'const parsecsOfKesselRun: number = 12;',
	'',
	'export const boast = (pilot: string): string => {',
	"\treturn pilot.concat(' made the Kessel Run in ', String(parsecsOfKesselRun), ' parsecs.');",
	'};',
].join('\n');

/** A line of code as a string literal: single-quoted, unless the line has a quote of its own. */
const stringLiteralOf = (line: string): string => {
	return line.includes("'") ? JSON.stringify(line) : `'${line.replaceAll('\t', '\\t')}'`;
};

const jumpSource: string = [
	'const jumpSource: string = [',
	...sampleJumpSource.split('\n').map((line: string): string => `\t${stringLiteralOf(line)},`),
	"].join('\\n');",
].join('\n');

/** An entry of a menu, as `MenuEntry` types it. */
export type SampleMenuEntry =
	| { id: string; label: string; shortcut?: string; destructive?: boolean }
	| { id: string; separator: true };

/** The entries of a menu: plain data, without the `onSelect` the examples give them. */
export const sampleCrewMenuItems: readonly SampleMenuEntry[] = [
	{ id: 'message', label: 'Send a message' },
	{ id: 'assign', label: 'Assign a bounty', shortcut: 'Control+B' },
	{ id: 'separator', separator: true },
	{ id: 'remove', label: 'Remove from the crew', destructive: true },
];

/** An entry of a list of plain texts and flags as an object literal, e.g. an item of a menu or an option. */
const entryLiteralOf = (entry: object): string => {
	const fields: string = Object.entries(entry)
		.map(([field, value]: [string, string | boolean]): string => {
			return `${field}: ${typeof value === 'string' ? `'${value}'` : String(value)}`;
		})
		.join(', ');

	return `{ ${fields} }`;
};

/** A list as a constant of the given type, one entry per line. */
const listDeclarationOf = (name: string, type: string, entries: readonly object[]): string => {
	return [
		`const ${name}: readonly ${type}[] = [`,
		...entries.map((entry: object): string => `\t${entryLiteralOf(entry)},`),
		'];',
	].join('\n');
};

const crewMenuItems: string = listDeclarationOf('crewMenuItems', 'MenuEntry', sampleCrewMenuItems);

/** An option of a choice, as `ChoiceOption`, `SelectOption` and `ComboboxOption` type it. */
export interface SampleChoice {
	value: string;
	label: string;
	description?: string;
}

export const sampleCrewOptions: readonly SampleChoice[] = [
	{ value: 'spike', label: 'Spike Spiegel' },
	{ value: 'jet', label: 'Jet Black' },
	{ value: 'faye', label: 'Faye Valentine' },
	{ value: 'ed', label: 'Edward Wong' },
];

/** The crew checked from the start. */
export const sampleCheckedCrew: readonly string[] = ['spike', 'jet'];

export const sampleShipOptions: readonly SampleChoice[] = [
	{ value: 'bebop', label: 'Bebop', description: 'Fishing trawler turned home of the crew.' },
	{ value: 'swordfish', label: 'Swordfish II', description: 'Fast, one seat, no cargo.' },
	{ value: 'redtail', label: 'Red Tail', description: 'Two seats, long range.' },
];

export const samplePlanetOptions: readonly SampleChoice[] = [
	{ value: 'mars', label: 'Mars' },
	{ value: 'venus', label: 'Venus' },
	{ value: 'ganymede', label: 'Ganymede' },
	{ value: 'callisto', label: 'Callisto' },
	{ value: 'titan', label: 'Titan' },
];

export const sampleBountyOptions: readonly SampleChoice[] = sampleBounties.map(
	(bounty: SampleBounty): SampleChoice => {
		return { value: bounty.name.toLowerCase().replaceAll(' ', '-'), label: bounty.name };
	},
);

/** An error of a form, as `ErrorSummaryItem` types it, with a text for its message. */
export interface SampleFormError {
	name: string;
	message: string;
}

export const sampleMissionErrors: readonly SampleFormError[] = [
	{ name: 'callsign', message: 'Enter the callsign of the hunter.' },
	{ name: 'ship', message: 'Choose the ship of the mission.' },
];

const plusIcon: string = [
	'<Icon decorative>',
	'\t<path',
	"\t\td='M12 5v14m-7-7h14'",
	"\t\tfill='none'",
	"\t\tstroke='currentColor'",
	'\t\tstrokeWidth={2}',
	"\t\tstrokeLinecap='round'",
	'\t/>',
	'</Icon>',
].join('\n');

export const sampleCodes = {
	plusIcon: {
		imports: { icons: ['Icon'] },
		code: plusIcon,
	},
	addCrewButton: {
		imports: { buttons: ['IconButton'], icons: ['Icon'] },
		code: [
			"<IconButton label='Add crew member'>",
			...plusIcon.split('\n').map((line: string): string => `\t${line}`),
			'</IconButton>',
		].join('\n'),
	},
	jumpSource: {
		imports: {},
		declarations: [jumpSource],
		code: 'jumpSource',
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
	newBountyButton: {
		imports: { buttons: ['Button'] },
		code: '<Button>Post a bounty</Button>',
	},
	retryButton: {
		imports: { buttons: ['Button'] },
		code: "<Button variant='soft'>Scan again</Button>",
	},
	bountyTableRows: {
		imports: {
			'data-display': ['TableBody', 'TableCell', 'TableHead', 'TableHeaderCell', 'TableRow'],
		},
		code: [
			'<TableHead>',
			'\t<TableRow>',
			'\t\t<TableHeaderCell>Name</TableHeaderCell>',
			'\t\t<TableHeaderCell>Last seen</TableHeaderCell>',
			"\t\t<TableHeaderCell align='end'>Reward</TableHeaderCell>",
			'\t</TableRow>',
			'</TableHead>',
			'',
			'<TableBody>',
			...sampleBounties.slice(0, 3).flatMap((bounty: SampleBounty): string[] => {
				return [
					'\t<TableRow>',
					`\t\t<TableHeaderCell scope='row'>${bounty.name}</TableHeaderCell>`,
					`\t\t<TableCell>${bounty.planet}</TableCell>`,
					`\t\t<TableCell align='end'>${bounty.reward.toLocaleString('en-US')} woolongs</TableCell>`,
					'\t</TableRow>',
				];
			}),
			'</TableBody>',
		].join('\n'),
	},
	bountyColumns: {
		imports: {},
		typeImports: { 'data-display': ['DataTableColumn'] },
		declarations: [bountyType, bountyColumns],
		code: 'bountyColumns',
	},
	bounties: {
		imports: {},
		declarations: [bountyType, bountyRows],
		code: 'bounties',
	},
	bountyRowId: {
		imports: {},
		declarations: [bountyType],
		code: '(bounty: Bounty): string => bounty.name',
	},
	plotJumpButton: {
		imports: { buttons: ['Button'] },
		code: "<Button variant='outline'>Plot the jump</Button>",
	},
	crewActionsButton: {
		imports: { buttons: ['Button'] },
		code: "<Button variant='outline'>Crew actions</Button>",
	},
	crewMenuItems: {
		imports: {},
		typeImports: { feedback: ['MenuEntry'] },
		declarations: [crewMenuItems],
		code: 'crewMenuItems',
	},
	crewMemberCard: {
		imports: { 'data-display': ['Card', 'CardHeader'] },
		code: [
			'<Card tabIndex={0}>',
			"\t<CardHeader title='Spike Spiegel' subtitle='Right click, or focus and press Shift+F10' />",
			'</Card>',
		].join('\n'),
	},
	crewOptions: {
		imports: {},
		typeImports: { forms: ['ChoiceOption'] },
		declarations: [listDeclarationOf('crewOptions', 'ChoiceOption', sampleCrewOptions)],
		code: 'crewOptions',
	},
	checkedCrew: {
		imports: {},
		code: `[${sampleCheckedCrew.map((value: string): string => `'${value}'`).join(', ')}]`,
	},
	shipOptions: {
		imports: {},
		typeImports: { forms: ['ChoiceOption'] },
		declarations: [listDeclarationOf('shipOptions', 'ChoiceOption', sampleShipOptions)],
		code: 'shipOptions',
	},
	planetOptions: {
		imports: {},
		typeImports: { forms: ['SelectOption'] },
		declarations: [listDeclarationOf('planetOptions', 'SelectOption', samplePlanetOptions)],
		code: 'planetOptions',
	},
	bountyOptions: {
		imports: {},
		typeImports: { forms: ['ComboboxOption'] },
		declarations: [listDeclarationOf('bountyOptions', 'ComboboxOption', sampleBountyOptions)],
		code: 'bountyOptions',
	},
	hunterFields: {
		imports: { forms: ['FormActions', 'SubmitButton', 'TextField'] },
		code: [
			"<TextField label='Callsign' name='callsign' required minLength={3} />",
			"<TextField label='Email' name='email' type='email' autoComplete='email' />",
			'',
			'<FormActions>',
			'\t<SubmitButton>Register the hunter</SubmitButton>',
			'</FormActions>',
		].join('\n'),
	},
	departureControl: {
		imports: {},
		typeImports: { forms: ['FormFieldControlProps'] },
		code: "{(control: FormFieldControlProps): ReactElement => <input {...control} type='time' />}",
	},
	landingFields: {
		imports: { forms: ['TextField'] },
		code: [
			"<TextField label='Planet' name='planet' />",
			"<TextField label='Dock' name='dock' />",
		].join('\n'),
	},
	routeButtons: {
		imports: { buttons: ['Button'] },
		code: [
			"<Button variant='solid'>Save the route</Button>",
			"<Button variant='ghost'>Cancel</Button>",
		].join('\n'),
	},
	missionErrors: {
		imports: {},
		typeImports: { forms: ['ErrorSummaryItem'] },
		declarations: [listDeclarationOf('missionErrors', 'ErrorSummaryItem', sampleMissionErrors)],
		code: 'missionErrors',
	},
	noFocusKey: {
		imports: {},
		code: 'null',
	},
} as const satisfies Readonly<Record<string, SampleCode>>;

export type SampleName = keyof typeof sampleCodes;
