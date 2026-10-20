'use client';
// The playground of the components of `@midnight-indigo/ui/data-display`.
import {
	Avatar,
	Badge,
	Card,
	Carousel,
	Chip,
	DataTable,
	Divider,
	EmptyState,
	ErrorState,
	List,
	Skeleton,
	SkeletonList,
	SkeletonText,
	StatCard,
	Table,
} from '@midnight-indigo/ui/data-display';

import { createPlayground } from '#src/explorer/playground.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';

export const DataDisplayPlayground: PlaygroundComponent = createPlayground({
	Avatar,
	Badge,
	Card,
	Carousel,
	Chip,
	DataTable,
	Divider,
	EmptyState,
	ErrorState,
	List,
	Skeleton,
	SkeletonList,
	SkeletonText,
	StatCard,
	Table,
});
