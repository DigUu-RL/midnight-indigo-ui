import { Code } from '@midnight-indigo/ui/code';
import type { ReactElement } from 'react';

export const JumpInstructions = (): ReactElement => {
	return (
		<p style={{ maxWidth: '32rem', margin: 0 }}>
			Before the jump, run <Code>navicomputer --plot Kessel</Code> and wait until the console prints{' '}
			<Code>route ready</Code>. Add <Code>--safe</Code> to keep the route away from the Maw.
		</p>
	);
};
