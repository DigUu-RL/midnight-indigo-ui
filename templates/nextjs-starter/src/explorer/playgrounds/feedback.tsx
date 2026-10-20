'use client';
// The playground of the components of `@midnight-indigo/ui/feedback`.
import { Alert, ProgressBar, Tooltip } from '@midnight-indigo/ui/feedback';

import { createPlayground } from '#src/explorer/playground.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';

export const FeedbackPlayground: PlaygroundComponent = createPlayground({
	Alert,
	ProgressBar,
	Tooltip,
});
