'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { EmptyState, List, ListItem } from '@midnight-indigo/ui/data-display';
import { SearchField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor', 'Naboo'];

export const PlanetSearch = (): ReactElement => {
	const [query, setQuery] = useState<string>('Kessel');

	const matches: string[] = planets.filter((planet: string): boolean => {
		return planet.toLowerCase().includes(query.trim().toLowerCase());
	});

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '28rem' }}>
			<search>
				<SearchField label='Search planets' value={query} onValueChange={setQuery} />
			</search>

			<p role='status' style={{ margin: 0 }}>
				{matches.length === 1 ? '1 planet' : `${String(matches.length)} planets`}
			</p>

			{matches.length === 0 ? (
				<EmptyState
					title={`No planet matches “${query.trim()}”`}
					description='Check the spelling, or search the whole galaxy.'
					action={
						<Button
							variant='soft'
							onClick={(): void => {
								setQuery('');
							}}
						>
							Clear the search
						</Button>
					}
				/>
			) : (
				<List aria-label='Planets'>
					{matches.map((planet: string): ReactElement => {
						return <ListItem key={planet} title={planet} />;
					})}
				</List>
			)}
		</Stack>
	);
};
