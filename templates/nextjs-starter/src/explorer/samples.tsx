// The values of the samples of `sample-code.ts`, as its code writes them: the grid of variants and the playground give
// them to the props that take an element, an object or a function. A sample missing here fails the type check.
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import {
	Avatar,
	Card,
	CardContent,
	CardHeader,
	ListItem,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, StatChange } from '@midnight-indigo/ui/data-display';
import { Icon } from '@midnight-indigo/ui/icons';
import type { ReactElement } from 'react';

import { bountyColumns, bountyRowId } from '#src/explorer/client-samples.tsx';
import {
	sampleBounties,
	sampleCrew,
	sampleJumpSource,
	samplePlanets,
} from '#src/explorer/sample-code.ts';
import type {
	SampleBounty,
	SampleCrewMember,
	SampleName,
	SamplePlanet,
} from '#src/explorer/sample-code.ts';

/**
 * An element, a list of them (each one a child of its own, e.g. a slide of a `Carousel`, which a fragment would merge
 * into one), a text or an object a Server Component can pass to a Client Component, or what a client module exports
 * (the columns of a `DataTable` and its function of the row ids, which hold functions).
 */
export type SampleValue =
	| string
	| ReactElement
	| readonly ReactElement[]
	| StatChange
	| readonly SampleBounty[]
	| readonly DataTableColumn<SampleBounty>[]
	| ((bounty: SampleBounty) => string);

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor'];

const plusIcon: ReactElement = (
	<Icon decorative>
		<path
			d='M12 5v14m-7-7h14'
			fill='none'
			stroke='currentColor'
			strokeWidth={2}
			strokeLinecap='round'
		/>
	</Icon>
);

export const sampleElements: Readonly<Record<SampleName, SampleValue>> = {
	plusIcon,
	addCrewButton: <IconButton label='Add crew member'>{plusIcon}</IconButton>,
	jumpSource: sampleJumpSource,
	missionBrief: (
		<Card>
			<CardHeader title='Mission brief' subtitle='Leia Organa' />
			<CardContent>Reach Hoth before the Imperial fleet and evacuate Echo Base.</CardContent>
		</Card>
	),
	crewAvatars: (
		<>
			<Avatar name='Spike Spiegel' size='small' />
			<Avatar name='Faye Valentine' size='medium' intent='brand' />
			<Avatar name='Jet Black' size='large' intent='info' />
		</>
	),
	planetCards: (
		<>
			{planets.map((planet: string): ReactElement => {
				return (
					<Card key={planet}>
						<CardContent>{planet}</CardContent>
					</Card>
				);
			})}
		</>
	),
	pilotAvatar: <Avatar name='Spike Spiegel' />,
	briefSections: (
		<>
			<CardHeader title='Mission brief' subtitle='Leia Organa' />
			<CardContent>Reach Hoth before the Imperial fleet and evacuate Echo Base.</CardContent>
		</>
	),
	planetSlides: samplePlanets.map((planet: SamplePlanet): ReactElement => {
		return (
			<Card key={planet.name}>
				<CardHeader title={planet.name} subtitle={planet.region} />
				<CardContent>{planet.description}</CardContent>
			</Card>
		);
	}),
	crewItems: (
		<>
			{sampleCrew.map((member: SampleCrewMember): ReactElement => {
				return <ListItem key={member.name} title={member.name} description={member.role} />;
			})}
		</>
	),
	bountyChange: { value: '12%', trend: 'up' },
	newBountyButton: <Button>Post a bounty</Button>,
	retryButton: <Button variant='soft'>Scan again</Button>,
	bountyTableRows: (
		<>
			<TableHead>
				<TableRow>
					<TableHeaderCell>Name</TableHeaderCell>
					<TableHeaderCell>Last seen</TableHeaderCell>
					<TableHeaderCell align='end'>Reward</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{sampleBounties.slice(0, 3).map((bounty: SampleBounty): ReactElement => {
					return (
						<TableRow key={bounty.name}>
							<TableHeaderCell scope='row'>{bounty.name}</TableHeaderCell>
							<TableCell>{bounty.planet}</TableCell>
							<TableCell align='end'>{bounty.reward.toLocaleString('en-US')} woolongs</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</>
	),
	bountyColumns,
	bounties: sampleBounties,
	bountyRowId,
};
