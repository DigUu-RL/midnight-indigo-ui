import { Avatar } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { ReactElement } from 'react';

export const PilotProfile = (): ReactElement => {
	return (
		<Stack direction='row' gap='3' align='center'>
			<Avatar name='Spike Spiegel' size='large' intent='brand' decorative />

			<Stack gap='1'>
				<strong style={themeVariables.typography.headingSmall}>Spike Spiegel</strong>
				<span style={{ color: themeVariables.text.secondary }}>Bounty hunter, Bebop</span>
			</Stack>
		</Stack>
	);
};
