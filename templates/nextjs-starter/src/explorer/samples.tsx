// The elements of the samples of `sample-code.ts`, as its code writes them: the grid of variants and the playground
// give them to the props that take an element. A sample missing here fails the type check.
import { Avatar, Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import { Icon } from '@midnight-indigo/ui/icons';
import type { ReactElement } from 'react';

import type { SampleName } from '#src/explorer/sample-code.ts';

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor'];

export const sampleElements: Readonly<Record<SampleName, ReactElement>> = {
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
};
