'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { ConfirmDialog } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// `intent='error'` starts focus on the cancel button, and the labels name what each button does. Focus returns to the
// button that opened the dialog, which then restores the entry, so it stays enabled.
export const DeleteLogEntry = (): ReactElement => {
	const [open, setOpen] = useState<boolean>(false);
	const [deleted, setDeleted] = useState<boolean>(false);

	const restore = (): void => {
		setDeleted(false);
	};

	const confirm = (): void => {
		setOpen(true);
	};

	return (
		<Stack direction='row' gap='3' align='center'>
			<Button
				intent={deleted ? 'official' : 'error'}
				variant='outline'
				onClick={deleted ? restore : confirm}
			>
				{deleted ? 'Restore the log entry' : 'Delete the log entry'}
			</Button>

			<p role='status' style={{ margin: 0 }}>
				{deleted ? 'Log entry deleted.' : 'Log 2071-11-03: chasing Vicious on Mars.'}
			</p>

			<ConfirmDialog
				open={open}
				intent='error'
				title='Delete this log entry?'
				description='The entry of 2071-11-03 will be removed from the logbook. This cannot be undone.'
				labels={{ confirm: 'Delete entry', cancel: 'Keep entry' }}
				onConfirm={(): void => {
					setDeleted(true);
					setOpen(false);
				}}
				onCancel={(): void => {
					setOpen(false);
				}}
			/>
		</Stack>
	);
};
