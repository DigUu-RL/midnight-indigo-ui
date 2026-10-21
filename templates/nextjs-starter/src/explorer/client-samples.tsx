'use client';
// The samples that hold functions, e.g. the columns of a `DataTable`: a Server Component cannot pass a function to a
// Client Component, but it can pass what a client module exports. The page imports them through the samples of their
// subpath (`samples/<subpath>.tsx`) and only hands them on, so they run in the browser.
import type { DataTableColumn } from '@midnight-indigo/ui/data-display';
import type { FormFieldControlProps } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

import type { SampleBounty } from '#src/explorer/sample-code.ts';

export const bountyColumns: readonly DataTableColumn<SampleBounty>[] = [
	{
		id: 'name',
		header: 'Name',
		cell: (bounty: SampleBounty): string => bounty.name,
		sortValue: (bounty: SampleBounty): string => bounty.name,
		filterValue: (bounty: SampleBounty): string => bounty.name,
		rowHeader: true,
	},
	{
		id: 'planet',
		header: 'Last seen',
		cell: (bounty: SampleBounty): string => bounty.planet,
		filterValue: (bounty: SampleBounty): string => bounty.planet,
	},
	{
		id: 'reward',
		header: 'Reward',
		cell: (bounty: SampleBounty): string => `${bounty.reward.toLocaleString('en-US')} woolongs`,
		sortValue: (bounty: SampleBounty): number => bounty.reward,
		align: 'end',
	},
];

export const bountyRowId = (bounty: SampleBounty): string => bounty.name;

export const departureControl = (control: FormFieldControlProps): ReactElement => {
	return <input {...control} type='time' />;
};
