import { Divider } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { ReactElement } from 'react';

export const ShipSpecifications = (): ReactElement => {
	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '28rem' }}>
			<Stack gap='1'>
				<strong style={themeVariables.typography.headingSmall}>Normandy SR-2</strong>
				<span style={{ color: themeVariables.text.secondary }}>Frigate, commanded by Shepard</span>
			</Stack>

			<Divider />
			<span>Crew of 30, stealth system and a Thanix cannon.</span>
			<Divider decorative />
			<span style={{ color: themeVariables.text.secondary }}>Last refit at the Citadel.</span>
		</Stack>
	);
};
