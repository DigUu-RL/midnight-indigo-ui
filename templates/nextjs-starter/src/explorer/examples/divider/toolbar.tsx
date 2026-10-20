import { Button } from '@midnight-indigo/ui/buttons';
import { Divider } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const LogbookToolbar = (): ReactElement => {
	return (
		<Stack direction='row' gap='2' role='group' aria-label='Logbook entry'>
			<Button variant='ghost' size='small'>
				Undo
			</Button>

			<Button variant='ghost' size='small'>
				Redo
			</Button>

			<Divider orientation='vertical' />

			<Button variant='ghost' size='small'>
				Attach star map
			</Button>
		</Stack>
	);
};
