'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { TextArea } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// Read only, the log can still be focused, selected and copied, and it is submitted with a form; editing unlocks it.
export const ShipLog = (): ReactElement => {
	const [editing, setEditing] = useState<boolean>(false);

	const [log, setLog] = useState<string>(
		'Left Mars at dawn. Jet repaired the hyperdrive of the Swordfish II; Ein is asleep on the bridge.',
	);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '28rem' }}>
			<TextArea
				label='Captain’s log'
				rows={4}
				readOnly={!editing}
				resize={editing ? 'vertical' : 'none'}
				value={log}
				onValueChange={setLog}
				style={{ alignSelf: 'stretch' }}
			/>

			<Button
				variant={editing ? 'solid' : 'outline'}
				onClick={(): void => {
					setEditing(!editing);
				}}
			>
				{editing ? 'Save the log' : 'Edit the log'}
			</Button>
		</Stack>
	);
};
