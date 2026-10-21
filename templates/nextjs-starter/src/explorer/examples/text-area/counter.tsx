'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { TextArea } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const limit: number = 140;

// `maxLength` stops the typing at the limit, and the counter, read with the field, tells how much room is left.
export const Transmission = (): ReactElement => {
	const [message, setMessage] = useState<string>('');
	const [sent, setSent] = useState<string | null>(null);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '28rem' }}>
			<TextArea
				label='Message to the Bebop'
				description='The relay of Ganymede cuts longer transmissions.'
				maxLength={limit}
				showCount
				value={message}
				onValueChange={setMessage}
				style={{ alignSelf: 'stretch' }}
			/>

			<Button
				disabled={message.trim() === ''}
				onClick={(): void => {
					setSent(message.trim());
					setMessage('');
				}}
			>
				Send the transmission
			</Button>

			{sent === null ? null : <p style={{ margin: 0 }}>Sent: {sent}</p>}
		</Stack>
	);
};
