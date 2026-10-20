import { ProgressBar } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const SignalScan = (): ReactElement => {
	return (
		<Stack gap='4' style={{ width: '100%', maxWidth: '24rem' }}>
			<ProgressBar label='Scanning the asteroid field' />

			<Stack direction='row' gap='2' align='center'>
				<ProgressBar label='Decoding the transmission' shape='circular' size='small' />
				<span>Ein is decoding the transmission of Ganymede.</span>
			</Stack>
		</Stack>
	);
};
