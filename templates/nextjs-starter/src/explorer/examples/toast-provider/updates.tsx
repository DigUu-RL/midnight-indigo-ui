'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { useToast } from '@midnight-indigo/ui/feedback';
import type { ToastApi } from '@midnight-indigo/ui/feedback';
import { useState } from 'react';
import type { ReactElement } from 'react';

const transmissionId: string = 'logbook-transmission';
const transmissionDelay: number = 2000;

// One `id` for the whole transmission: each step updates the same toast in place instead of stacking another one.
export const LogbookTransmission = (): ReactElement => {
	const toast: ToastApi = useToast();
	const [sending, setSending] = useState<boolean>(false);

	const send = async (): Promise<void> => {
		setSending(true);

		// Kept until the transmission ends, whatever the default duration of its intent.
		toast.show({
			id: transmissionId,
			intent: 'info',
			message: 'Sending the logbook of the Bebop to the ISSP…',
			duration: null,
		});

		await new Promise((resolve: (value: unknown) => void): void => {
			setTimeout(resolve, transmissionDelay);
		});

		toast.show({
			id: transmissionId,
			intent: 'success',
			title: 'Logbook sent',
			message: 'The ISSP received 12 entries from the Bebop.',
		});

		setSending(false);
	};

	return (
		<Button
			loading={sending}
			onClick={(): void => {
				void send();
			}}
		>
			Send the logbook
		</Button>
	);
};
