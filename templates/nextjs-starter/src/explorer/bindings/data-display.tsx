// The components of `@midnight-indigo/ui/data-display` in the explorer: see `explorer/bindings.ts`.
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

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { CrewAvatars } from '#src/explorer/examples/avatar/crew.tsx';
import { PilotProfile } from '#src/explorer/examples/avatar/profile.tsx';
import { InboxNotifications } from '#src/explorer/examples/badge/notifications.tsx';
import { CrewPresence } from '#src/explorer/examples/badge/presence.tsx';
import { MissionLog } from '#src/explorer/examples/card/articles.tsx';
import { BountyCard } from '#src/explorer/examples/card/profile.tsx';
import { FlightRoute } from '#src/explorer/examples/carousel/controlled.tsx';
import { BountyReports } from '#src/explorer/examples/carousel/reports.tsx';
import { PlanetFilters } from '#src/explorer/examples/chip/filters.tsx';
import { CrewStatuses } from '#src/explorer/examples/chip/statuses.tsx';
import { BountySearch } from '#src/explorer/examples/data-table/filter.tsx';
import { ShipmentStates } from '#src/explorer/examples/data-table/states.tsx';
import { ShipSpecifications } from '#src/explorer/examples/divider/sections.tsx';
import { LogbookToolbar } from '#src/explorer/examples/divider/toolbar.tsx';
import { EmptyBountyBoard } from '#src/explorer/examples/empty-state/first-use.tsx';
import { PlanetSearch } from '#src/explorer/examples/empty-state/search.tsx';
import { NoSignal } from '#src/explorer/examples/error-state/offline.tsx';
import { BountyBoardError } from '#src/explorer/examples/error-state/retry.tsx';
import { BebopCrew } from '#src/explorer/examples/list/crew.tsx';
import { GrandPrixResults } from '#src/explorer/examples/list/ranking.tsx';
import { TransmissionsPlaceholder } from '#src/explorer/examples/skeleton-list/compact.tsx';
import { CrewRoster } from '#src/explorer/examples/skeleton-list/crew.tsx';
import { LogEntry } from '#src/explorer/examples/skeleton-text/article.tsx';
import { MissionBriefPlaceholder } from '#src/explorer/examples/skeleton-text/card.tsx';
import { PlanetGalleryPlaceholder } from '#src/explorer/examples/skeleton/gallery.tsx';
import { PilotProfilePlaceholder } from '#src/explorer/examples/skeleton/profile.tsx';
import { FleetIndicators } from '#src/explorer/examples/stat-card/indicators.tsx';
import { ShieldStatus } from '#src/explorer/examples/stat-card/loading.tsx';
import { WeeklyBounties } from '#src/explorer/examples/table/bounties.tsx';
import { PodraceTimes } from '#src/explorer/examples/table/sortable.tsx';
import { DataDisplayPlayground } from '#src/explorer/playgrounds/data-display.tsx';
import { dataDisplaySamples } from '#src/explorer/samples/data-display.tsx';

export const dataDisplayBindings: SubpathBindings<'data-display'> = {
	playground: DataDisplayPlayground,
	samples: dataDisplaySamples,
	components: {
		Avatar: { component: Avatar, examples: { profile: PilotProfile, crew: CrewAvatars } },
		Badge: {
			component: Badge,
			examples: { notifications: InboxNotifications, presence: CrewPresence },
		},
		Card: { component: Card, examples: { profile: BountyCard, articles: MissionLog } },
		Carousel: {
			component: Carousel,
			examples: { reports: BountyReports, controlled: FlightRoute },
		},
		Chip: { component: Chip, examples: { statuses: CrewStatuses, filters: PlanetFilters } },
		Divider: {
			component: Divider,
			examples: { toolbar: LogbookToolbar, sections: ShipSpecifications },
		},
		List: { component: List, examples: { crew: BebopCrew, ranking: GrandPrixResults } },
		StatCard: {
			component: StatCard,
			examples: { indicators: FleetIndicators, loading: ShieldStatus },
		},
		Skeleton: {
			component: Skeleton,
			examples: { profile: PilotProfilePlaceholder, gallery: PlanetGalleryPlaceholder },
		},
		SkeletonText: {
			component: SkeletonText,
			examples: { article: LogEntry, card: MissionBriefPlaceholder },
		},
		SkeletonList: {
			component: SkeletonList,
			examples: { crew: CrewRoster, compact: TransmissionsPlaceholder },
		},
		EmptyState: {
			component: EmptyState,
			examples: { firstUse: EmptyBountyBoard, search: PlanetSearch },
		},
		ErrorState: { component: ErrorState, examples: { retry: BountyBoardError, offline: NoSignal } },
		Table: { component: Table, examples: { bounties: WeeklyBounties, sortable: PodraceTimes } },
		DataTable: { component: DataTable, examples: { filter: BountySearch, states: ShipmentStates } },
	},
};
