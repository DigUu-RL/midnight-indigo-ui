'use client';
import { Chip } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const planets: readonly string[] = ['Tatooine', 'Hoth', 'Dagobah', 'Endor'];

export const PlanetFilters = (): ReactElement => {
	const [selected, setSelected] = useState<readonly string[]>(['Hoth']);

	const toggle = (planet: string): void => {
		setSelected((current: readonly string[]): readonly string[] => {
			return current.includes(planet)
				? current.filter((name: string): boolean => name !== planet)
				: [...current, planet];
		});
	};

	return (
		<Stack direction='row' gap='2' wrap role='group' aria-label='Planets'>
			{planets.map((planet: string): ReactElement => {
				return (
					<Chip
						key={planet}
						label={planet}
						selected={selected.includes(planet)}
						onClick={(): void => {
							toggle(planet);
						}}
					/>
				);
			})}
		</Stack>
	);
};
