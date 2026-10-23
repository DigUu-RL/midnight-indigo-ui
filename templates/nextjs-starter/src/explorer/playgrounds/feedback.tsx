'use client';
// The playground of the components of `@midnight-indigo/ui/feedback`.
import {
	Alert,
	ConfirmDialog,
	ContextMenu,
	Dialog,
	Drawer,
	Menu,
	Popover,
	ProgressBar,
	Tooltip,
	useToast,
} from '@midnight-indigo/ui/feedback';

import { createPlayground } from '@/src/explorer/playground';
import type { PlaygroundComponent } from '@/src/explorer/playground';

export const FeedbackPlayground: PlaygroundComponent = createPlayground(
	{
		Alert,
		ProgressBar,
		Tooltip,
		Popover,
		Menu,
		ContextMenu,
		Dialog,
		ConfirmDialog,
		Drawer,
	},
	{ useToast },
);
