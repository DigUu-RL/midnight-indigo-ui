'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Drawer } from '@midnight-indigo/ui/feedback';
import { Select, Switch } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const shipClasses: readonly SelectOption[] = [
	{ value: 'any', label: 'Any class' },
	{ value: 'freighter', label: 'Light freighter' },
	{ value: 'starfighter', label: 'Starfighter' },
	{ value: 'cruiser', label: 'Cruiser' },
];

interface ShipFilter {
	shipClass: string;
	hyperdriveOnly: boolean;
}

const initialFilter: ShipFilter = { shipClass: 'any', hyperdriveOnly: false };

const summaryOf = (filter: ShipFilter): string => {
	const label: string =
		shipClasses.find((option: SelectOption): boolean => option.value === filter.shipClass)?.label ??
		'Any class';

	return `${label}${filter.hyperdriveOnly ? ', with a hyperdrive' : ''}.`;
};

// From the start edge, beside the list it filters. It holds fields, so a click outside does not close it.
export const ShipyardFilters = (): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);
	const [draft, setDraft] = useState<ShipFilter>(initialFilter);
	const [applied, setApplied] = useState<ShipFilter>(initialFilter);

	return (
		<Stack direction='row' gap='3' align='center'>
			<Button
				variant='outline'
				onClick={(): void => {
					setDraft(applied);
					setOpen(true);
				}}
			>
				Filter ships
			</Button>

			<p style={{ margin: 0 }}>Showing: {summaryOf(applied)}</p>

			<Drawer
				open={open}
				onClose={(): void => {
					setOpen(false);
				}}
				title='Filter ships'
				description='The shipyards of Corellia, by class.'
				placement='start'
				size='small'
				actions={
					<>
						<Button
							variant='outline'
							onClick={(): void => {
								setDraft(initialFilter);
							}}
						>
							Reset
						</Button>

						<Button
							onClick={(): void => {
								setApplied(draft);
								setOpen(false);
							}}
						>
							Apply filters
						</Button>
					</>
				}
			>
				<Stack gap='4'>
					<Select
						label='Class'
						options={shipClasses}
						value={draft.shipClass}
						onValueChange={(shipClass: string): void => {
							setDraft({ ...draft, shipClass });
						}}
					/>

					<Switch
						label='With a hyperdrive only'
						checked={draft.hyperdriveOnly}
						onCheckedChange={(hyperdriveOnly: boolean): void => {
							setDraft({ ...draft, hyperdriveOnly });
						}}
					/>
				</Stack>
			</Drawer>
		</Stack>
	);
};
