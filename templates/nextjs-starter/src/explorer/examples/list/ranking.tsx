import { List, ListItem } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

interface Racer {
	pilot: string;
	machine: string;
	time: string;
}

const results: readonly Racer[] = [
	{ pilot: 'Captain Falcon', machine: 'Blue Falcon', time: '1:52.40' },
	{ pilot: 'Samurai Goroh', machine: 'Fire Stingray', time: '1:53.18' },
	{ pilot: 'Jody Summer', machine: 'White Cat', time: '1:55.02' },
];

export const GrandPrixResults = (): ReactElement => {
	return (
		<List ordered aria-label='Mute City Grand Prix' style={{ width: '100%', maxWidth: '28rem' }}>
			{results.map((racer: Racer, index: number): ReactElement => {
				return (
					<ListItem
						key={racer.pilot}
						title={`${String(index + 1)}. ${racer.pilot}`}
						description={racer.machine}
						trailing={<span style={{ fontVariantNumeric: 'tabular-nums' }}>{racer.time}</span>}
					/>
				);
			})}
		</List>
	);
};
