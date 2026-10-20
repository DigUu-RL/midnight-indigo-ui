'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { ConfirmDialog } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const transferDelay: number = 1500;

// While the promise of `onConfirm` is pending, the confirm button is busy and the dialog cannot be dismissed.
export const CollectBounty = (): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);
	const [collected, setCollected] = useState<boolean>(false);

	const transferReward = async (): Promise<void> => {
		await new Promise((resolve: (value: unknown) => void): void => {
			setTimeout(resolve, transferDelay);
		});

		setCollected(true);
		setOpen(false);
	};

	const postNewBounty = (): void => {
		setCollected(false);
	};

	const confirm = (): void => {
		setOpen(true);
	};

	return (
		<Stack direction='row' gap='3' align='center'>
			<Button onClick={collected ? postNewBounty : confirm}>
				{collected ? 'Post a new bounty' : 'Collect the bounty'}
			</Button>

			<p role='status' style={{ margin: 0 }}>
				{collected
					? '2,500,000 woolongs transferred to the Bebop.'
					: 'Asimov Solensan is in custody.'}
			</p>

			<ConfirmDialog
				open={open}
				title='Collect the bounty on Asimov Solensan?'
				description='The ISSP transfers 2,500,000 woolongs to the account of the Bebop.'
				labels={{ confirm: 'Collect', cancel: 'Not yet' }}
				onConfirm={transferReward}
				onCancel={(): void => {
					setOpen(false);
				}}
			/>
		</Stack>
	);
};
