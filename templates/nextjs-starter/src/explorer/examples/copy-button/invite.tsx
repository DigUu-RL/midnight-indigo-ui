import { CopyButton } from '@midnight-indigo/ui/buttons';
import { TextField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const inviteLink: string = 'https://bebop.example/crew/invite/swordfish-2';

export const CrewInvite = (): ReactElement => {
	return (
		<Stack direction='row' gap='2' align='end' wrap>
			<TextField label='Invite link' type='url' value={inviteLink} readOnly />

			<CopyButton
				value={inviteLink}
				label='Copy invite link'
				showLabel
				variant='soft'
				size='medium'
			/>
		</Stack>
	);
};
