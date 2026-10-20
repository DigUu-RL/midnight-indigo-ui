'use client';
// The playground of the components of `@midnight-indigo/ui/data-display`.
import {
	Avatar,
	Badge,
	Card,
	Carousel,
	Chip,
	Divider,
	List,
	StatCard,
} from '@midnight-indigo/ui/data-display';

import { createPlayground } from '#src/explorer/playground.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';

export const DataDisplayPlayground: PlaygroundComponent = createPlayground({
	Avatar,
	Badge,
	Card,
	Carousel,
	Chip,
	Divider,
	List,
	StatCard,
});
