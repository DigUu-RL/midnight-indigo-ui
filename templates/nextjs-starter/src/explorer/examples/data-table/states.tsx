'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { DataTable, EmptyState } from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, DataTableStatus } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface Shipment {
	id: string;
	cargo: string;
	destination: string;
}

type Scenario = DataTableStatus | 'empty';

const shipments: readonly Shipment[] = [
	{ id: 'KS-1138', cargo: 'Coaxium', destination: 'Kessel' },
	{ id: 'HT-0451', cargo: 'Tauntaun feed', destination: 'Hoth' },
	{ id: 'DG-2187', cargo: 'Medical supplies', destination: 'Dagobah' },
];

const columns: readonly DataTableColumn<Shipment>[] = [
	{
		id: 'id',
		header: 'Shipment',
		cell: (shipment: Shipment): string => shipment.id,
		rowHeader: true,
	},
	{ id: 'cargo', header: 'Cargo', cell: (shipment: Shipment): string => shipment.cargo },
	{
		id: 'destination',
		header: 'Destination',
		cell: (shipment: Shipment): string => shipment.destination,
	},
];

const scenarios: readonly Scenario[] = ['ready', 'loading', 'error', 'empty'];

export const ShipmentStates = (): ReactElement => {
	const [scenario, setScenario] = useState<Scenario>('loading');

	return (
		<Stack gap='3' style={{ width: '100%' }}>
			<Stack direction='row' gap='2' wrap role='group' aria-label='Scenario'>
				{scenarios.map((option: Scenario): ReactElement => {
					return (
						<Button
							key={option}
							size='small'
							variant={option === scenario ? 'solid' : 'soft'}
							aria-pressed={option === scenario}
							onClick={(): void => {
								setScenario(option);
							}}
						>
							{option}
						</Button>
					);
				})}
			</Stack>

			<DataTable
				caption='Shipments of the Millennium Falcon'
				columns={columns}
				rows={scenario === 'empty' ? [] : shipments}
				getRowId={(shipment: Shipment): string => shipment.id}
				status={scenario === 'empty' ? 'ready' : scenario}
				errorDescription='The manifest is encrypted with an Imperial code.'
				onRetry={(): void => {
					setScenario('ready');
				}}
				emptyState={
					<EmptyState
						title='No shipments yet'
						description='Chewbacca has not loaded the hold.'
						action={
							<Button
								variant='soft'
								onClick={(): void => {
									setScenario('ready');
								}}
							>
								Load the hold
							</Button>
						}
					/>
				}
			/>
		</Stack>
	);
};
