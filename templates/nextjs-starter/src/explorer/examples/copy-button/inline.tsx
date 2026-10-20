import { CopyButton } from '@midnight-indigo/ui/buttons';
import { Code } from '@midnight-indigo/ui/code';
import { Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const route: string = 'KESSEL-RUN-12-PARSECS';

export const HyperspaceRoute = (): ReactElement => {
	return (
		<Stack direction='row' gap='1' align='center'>
			<Code>{route}</Code>
			<CopyButton value={route} label='Copy route' />
		</Stack>
	);
};
