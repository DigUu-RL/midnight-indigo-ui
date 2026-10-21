// The samples of the components of `@midnight-indigo/ui/layout`: see `explorer/samples.tsx`.
import { Avatar, Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

import type { SubpathSamples } from '#src/explorer/samples.tsx';

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor'];

export const layoutSamples: SubpathSamples<'layout'> = {
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
