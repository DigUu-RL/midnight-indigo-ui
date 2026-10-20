// The values of the samples of `sample-code.ts`, as its code writes them: the grid of variants and the playground give
// them to the props that take an element or an object. A sample missing here fails the type check.
import { Avatar, Card, CardContent, CardHeader, ListItem } from '@midnight-indigo/ui/data-display';
import type { StatChange } from '@midnight-indigo/ui/data-display';
import { Icon } from '@midnight-indigo/ui/icons';
import type { ReactElement } from 'react';

import { sampleCrew, samplePlanets } from '#src/explorer/sample-code.ts';
import type { SampleCrewMember, SampleName, SamplePlanet } from '#src/explorer/sample-code.ts';

/**
 * An element, a list of them (each one a child of its own, e.g. a slide of a `Carousel`, which a fragment would merge
 * into one) or an object a Server Component can pass to a Client Component.
 */
export type SampleValue = ReactElement | readonly ReactElement[] | StatChange;

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor'];

export const sampleElements: Readonly<Record<SampleName, SampleValue>> = {
	plusIcon: (
		<Icon decorative>
			<path
				d='M12 5v14m-7-7h14'
				fill='none'
				stroke='currentColor'
				strokeWidth={2}
				strokeLinecap='round'
			/>
		</Icon>
	),
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
};
