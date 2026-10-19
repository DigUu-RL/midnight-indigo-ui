import { Button } from '@midnight-indigo/ui/buttons';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const MissionActions = (): ReactElement => {
	return (
		<Stack direction='row' gap='2' wrap>
			<Button variant='ghost'>Cancel</Button>
			<Button>Save draft</Button>

			<Button intent='official' variant='solid'>
				Launch mission
			</Button>
		</Stack>
	);
};
