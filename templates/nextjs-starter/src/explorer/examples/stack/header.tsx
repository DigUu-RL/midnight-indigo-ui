import { Button } from '@midnight-indigo/ui/buttons';
import { Stack } from '@midnight-indigo/ui/layout';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { ReactElement } from 'react';

export const HangarHeader = (): ReactElement => {
	return (
		<Stack
			direction={{ compact: 'column', medium: 'row' }}
			justify='between'
			align='center'
			gap='3'
			style={{ width: '100%' }}
		>
			<Stack gap='1'>
				<strong style={themeVariables.typography.headingSmall}>Hangar 7</strong>
				<span style={{ color: themeVariables.text.secondary }}>3 ships ready for launch</span>
			</Stack>

			<Stack direction='row' gap='2' wrap>
				<Button variant='ghost'>Schedule</Button>

				<Button intent='official' variant='solid'>
					Launch all
				</Button>
			</Stack>
		</Stack>
	);
};
