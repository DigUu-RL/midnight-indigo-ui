'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Popover } from '@midnight-indigo/ui/feedback';
import { Select, Switch } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const planets: readonly SelectOption[] = [
	{ value: 'any', label: 'Any planet' },
	{ value: 'Mars', label: 'Mars' },
	{ value: 'Ganymede', label: 'Ganymede' },
	{ value: 'Titan', label: 'Titan' },
];

interface BountyFilter {
	planet: string;
	aliveOnly: boolean;
}

const summaryOf = (filter: BountyFilter): string => {
	const place: string = filter.planet === 'any' ? 'on any planet' : `on ${filter.planet}`;
	return `Bounties ${place}${filter.aliveOnly ? ', wanted alive' : ''}.`;
};

// The parent owns `open`, so applying the filters closes the popover; a click outside keeps the fields as they are.
export const BountyFilters = (): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);
	const [draft, setDraft] = useState<BountyFilter>({ planet: 'any', aliveOnly: false });
	const [applied, setApplied] = useState<BountyFilter>(draft);

	return (
		<Stack gap='3' align='start'>
			<Popover
				title='Bounty filters'
				trigger={<Button variant='outline'>Filters</Button>}
				open={open}
				onOpenChange={setOpen}
				closeOnOutsideClick={false}
			>
				<Stack gap='3'>
					<Select
						label='Last seen on'
						options={planets}
						value={draft.planet}
						onValueChange={(planet: string): void => {
							setDraft({ ...draft, planet });
						}}
					/>

					<Switch
						label='Wanted alive only'
						checked={draft.aliveOnly}
						onCheckedChange={(aliveOnly: boolean): void => {
							setDraft({ ...draft, aliveOnly });
						}}
					/>

					<Button
						onClick={(): void => {
							setApplied(draft);
							setOpen(false);
						}}
					>
						Apply filters
					</Button>
				</Stack>
			</Popover>

			<p style={{ margin: 0 }}>{summaryOf(applied)}</p>
		</Stack>
	);
};
