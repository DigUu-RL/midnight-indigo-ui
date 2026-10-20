'use client';
import { Button, CopyButton } from '@midnight-indigo/ui/buttons';
import { Popover } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

// Without a heading, `label` names the popover: its text already says what it is about.
export const KesselRunRecord = (): ReactElement => {
	return (
		<Popover
			label='The Kessel Run record'
			placement='bottom-end'
			trigger={<Button variant='ghost'>Who holds the Kessel Run record?</Button>}
		>
			<Stack gap='3' align='start'>
				<p style={{ margin: 0 }}>
					Han Solo made the Kessel Run in less than 12 parsecs, flying the Millennium Falcon.
				</p>

				<CopyButton
					value='Kessel Run: 12 parsecs, Millennium Falcon'
					label='Copy the record'
					showLabel
				/>
			</Stack>
		</Popover>
	);
};
