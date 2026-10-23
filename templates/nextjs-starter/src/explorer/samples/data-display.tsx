// The samples of the components of `@midnight-indigo/ui/data-display`: see `explorer/samples.tsx`.
import { Button } from '@midnight-indigo/ui/buttons';
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
import type { ReactElement } from 'react';

import { bountyColumns, bountyRowId } from '@/src/explorer/client-samples';
import { sampleBounties, sampleCrew, samplePlanets } from '@/src/explorer/sample-code';
import type { SampleBounty, SampleCrewMember, SamplePlanet } from '@/src/explorer/sample-code';
import type { SubpathSamples } from '@/src/explorer/samples';

export const dataDisplaySamples: SubpathSamples<'data-display'> = {
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
