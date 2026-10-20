'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Dialog } from '@midnight-indigo/ui/feedback';
import { TextField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useRef, useState } from 'react';
import type { ReactElement, RefObject } from 'react';

// Focus starts on the field (`initialFocus`), the only thing to do in the dialog; Escape and Cancel discard the draft.
export const RenameShip = (): ReactElement => {
	const nameField: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState<boolean>(false);
	const [name, setName] = useState<string>('Bebop');
	const [draft, setDraft] = useState<string>(name);

	const close = (): void => {
		setOpen(false);
	};

	return (
		<Stack direction='row' gap='3' align='center'>
			<Button
				variant='outline'
				onClick={(): void => {
					setDraft(name);
					setOpen(true);
				}}
			>
				Rename the ship
			</Button>

			<p style={{ margin: 0 }}>Ship: {name}</p>

			<Dialog
				open={open}
				onClose={close}
				title='Rename the ship'
				description='The new name shows on the crew roster and on every bounty report.'
				size='small'
				initialFocus={nameField}
				actions={
					<>
						<Button variant='outline' onClick={close}>
							Cancel
						</Button>

						<Button
							disabled={draft.trim() === ''}
							onClick={(): void => {
								setName(draft.trim());
								close();
							}}
						>
							Save name
						</Button>
					</>
				}
			>
				<TextField ref={nameField} label='Name' value={draft} onValueChange={setDraft} />
			</Dialog>
		</Stack>
	);
};
