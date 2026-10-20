'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Alert } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

export const FlightPlanSaved = (): ReactElement => {
	const [saved, setSaved] = useState<boolean>(false);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '28rem' }}>
			<Button
				intent='official'
				onClick={(): void => {
					setSaved(true);
				}}
			>
				Save the flight plan
			</Button>

			{saved ? (
				<Alert
					intent='success'
					announce='polite'
					title='Flight plan saved'
					style={{ alignSelf: 'stretch' }}
					onDismiss={(): void => {
						setSaved(false);
					}}
				>
					Jet Black can review the route to Ganymede before the jump.
				</Alert>
			) : null}
		</Stack>
	);
};
