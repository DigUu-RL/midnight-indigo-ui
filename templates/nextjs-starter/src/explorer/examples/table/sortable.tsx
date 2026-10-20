'use client';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import type { SortDirection } from '@midnight-indigo/ui/data-display';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface Racer {
	name: string;
	ship: string;
	/** In seconds. */
	lapTime: number;
}

const racers: readonly Racer[] = [
	{ name: 'Anakin Skywalker', ship: 'Radon-Ulzer 620C', lapTime: 312 },
	{ name: 'Sebulba', ship: 'Collor Pondrat Plug-F', lapTime: 309 },
	{ name: 'Gasgano', ship: 'Ord Pedrovia', lapTime: 327 },
	{ name: 'Ben Quadinaros', ship: 'Balta-Trabaat BT310', lapTime: 351 },
];

const lapTimeOf = (seconds: number): string => {
	return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, '0')}`;
};

export const PodraceTimes = (): ReactElement => {
	const [direction, setDirection] = useState<SortDirection>('ascending');

	const sorted: Racer[] = [...racers].sort((first: Racer, second: Racer): number => {
		const difference: number = first.lapTime - second.lapTime;
		return direction === 'ascending' ? difference : -difference;
	});

	return (
		<Table caption='Boonta Eve Classic, best laps' density='compact'>
			<TableHead>
				<TableRow>
					<TableHeaderCell>Pilot</TableHeaderCell>
					<TableHeaderCell>Podracer</TableHeaderCell>

					<TableHeaderCell
						align='end'
						sortDirection={direction}
						onSort={(): void => {
							setDirection((current: SortDirection): SortDirection => {
								return current === 'ascending' ? 'descending' : 'ascending';
							});
						}}
					>
						Best lap
					</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{sorted.map((racer: Racer): ReactElement => {
					return (
						<TableRow key={racer.name}>
							<TableHeaderCell scope='row'>{racer.name}</TableHeaderCell>
							<TableCell>{racer.ship}</TableCell>
							<TableCell align='end'>{lapTimeOf(racer.lapTime)}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};
