import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import type { ReactElement } from 'react';

interface Bounty {
	name: string;
	planet: string;
	reward: number;
}

const bounties: readonly Bounty[] = [
	{ name: 'Asimov Solensan', planet: 'Mars', reward: 2500000 },
	{ name: 'Abdul Hakim', planet: 'Ganymede', reward: 2500000 },
	{ name: 'Mad Pierrot', planet: 'Earth', reward: 12000000 },
];

const woolongs = (amount: number): string => `${amount.toLocaleString('en-US')} woolongs`;

export const WeeklyBounties = (): ReactElement => {
	const total: number = bounties.reduce((sum: number, bounty: Bounty): number => {
		return sum + bounty.reward;
	}, 0);

	return (
		<Table caption='Bounties of the week'>
			<TableHead>
				<TableRow>
					<TableHeaderCell>Name</TableHeaderCell>
					<TableHeaderCell>Last seen</TableHeaderCell>
					<TableHeaderCell align='end'>Reward</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{bounties.map((bounty: Bounty): ReactElement => {
					return (
						<TableRow key={bounty.name}>
							<TableHeaderCell scope='row'>{bounty.name}</TableHeaderCell>
							<TableCell>{bounty.planet}</TableCell>
							<TableCell align='end'>{woolongs(bounty.reward)}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableHeaderCell scope='row' colSpan={2}>
						Total
					</TableHeaderCell>

					<TableCell align='end'>{woolongs(total)}</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
};
