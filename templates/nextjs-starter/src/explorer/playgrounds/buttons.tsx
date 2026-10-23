'use client';
// The playground of the components of `@midnight-indigo/ui/buttons`.
import { Button, CopyButton, IconButton } from '@midnight-indigo/ui/buttons';

import { createPlayground } from '@/src/explorer/playground';
import type { PlaygroundComponent } from '@/src/explorer/playground';

export const ButtonsPlayground: PlaygroundComponent = createPlayground({
	Button,
	CopyButton,
	IconButton,
});
