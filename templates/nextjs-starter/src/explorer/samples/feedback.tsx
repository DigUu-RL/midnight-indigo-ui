// The samples of the components of `@midnight-indigo/ui/feedback`: see `explorer/samples.tsx`.
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import { Card, CardHeader } from '@midnight-indigo/ui/data-display';

import { sampleCrewMenuItems } from '#src/explorer/sample-code.ts';
import { plusIcon } from '#src/explorer/samples.tsx';
import type { SubpathSamples } from '#src/explorer/samples.tsx';

export const feedbackSamples: SubpathSamples<'feedback'> = {
	addCrewButton: <IconButton label='Add crew member'>{plusIcon}</IconButton>,
	plotJumpButton: <Button variant='outline'>Plot the jump</Button>,
	crewActionsButton: <Button variant='outline'>Crew actions</Button>,
	crewMenuItems: sampleCrewMenuItems,
	crewMemberCard: (
		<Card tabIndex={0}>
			<CardHeader title='Spike Spiegel' subtitle='Right click, or focus and press Shift+F10' />
		</Card>
	),
};
