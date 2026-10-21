'use client';
import { Checkbox } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const crew: readonly string[] = ['Spike Spiegel', 'Jet Black', 'Faye Valentine', 'Edward Wong'];

// The first checkbox checks or unchecks every member, and shows a dash while only some are checked.
export const CrewSelection = (): ReactElement => {
	const [selected, setSelected] = useState<readonly string[]>(['Spike Spiegel']);

	const allSelected: boolean = selected.length === crew.length;
	const someSelected: boolean = selected.length > 0 && !allSelected;

	return (
		<Stack gap='1'>
			<Checkbox
				label='Whole crew'
				description={`${String(selected.length)} of ${String(crew.length)} on board`}
				checked={allSelected}
				indeterminate={someSelected}
				onCheckedChange={(checked: boolean): void => {
					setSelected(checked ? crew : []);
				}}
			/>

			<Stack gap='1' style={{ paddingInlineStart: '1.75rem' }}>
				{crew.map((member: string): ReactElement => {
					return (
						<Checkbox
							key={member}
							label={member}
							checked={selected.includes(member)}
							onCheckedChange={(checked: boolean): void => {
								setSelected(
									crew.filter((candidate: string): boolean => {
										return candidate === member ? checked : selected.includes(candidate);
									}),
								);
							}}
						/>
					);
				})}
			</Stack>
		</Stack>
	);
};
