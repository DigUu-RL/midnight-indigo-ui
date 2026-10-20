import { Avatar, Chip, List, ListItem } from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

export const BebopCrew = (): ReactElement => {
	return (
		<List aria-label='Crew of the Bebop' style={{ width: '100%', maxWidth: '28rem' }}>
			<ListItem
				title='Spike Spiegel'
				description='Bounty hunter'
				leading={<Avatar name='Spike Spiegel' intent='brand' decorative />}
				trailing={<Chip label='On a hunt' intent='info' size='small' />}
			/>

			<ListItem
				title='Faye Valentine'
				description='Gambler'
				leading={<Avatar name='Faye Valentine' intent='info' decorative />}
				trailing={<Chip label='In debt' intent='warning' size='small' />}
			/>

			<ListItem
				title='Jet Black'
				description='Captain of the Bebop'
				leading={<Avatar name='Jet Black' intent='success' decorative />}
				trailing={<Chip label='Aboard' intent='success' size='small' />}
			/>
		</List>
	);
};
