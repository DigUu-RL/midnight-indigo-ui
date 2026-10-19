import { Chip } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const CrewStatuses = (): ReactElement => {
	return (
		<Stack direction='row' gap='2' wrap>
			<Chip label='Leia Organa: on duty' intent='success' />
			<Chip label='Han Solo: delayed' intent='warning' />
			<Chip label='Luke Skywalker: in training' intent='info' />
			<Chip label='Boba Fett: hostile' intent='error' />
		</Stack>
	);
};
