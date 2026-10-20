import { Container, Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

export const CaptainsLog = (): ReactElement => {
	return (
		<Container as='article' size='small' aria-label="Captain's log">
			<Stack gap='3'>
				<p>
					Day 23. The Bebop drifts past Ganymede with an empty fridge and a full tank. Spike says
					the next bounty is easy money; he says that every time.
				</p>

				<p>
					Ein found the data chip under the couch. Faye wants a share of it already, and Ed is
					decoding it while hanging from the ceiling.
				</p>
			</Stack>
		</Container>
	);
};
