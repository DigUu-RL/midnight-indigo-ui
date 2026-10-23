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

import type { SubpathBindings } from '@/src/explorer/bindings';
import { CrewAvatars } from '@/src/explorer/examples/avatar/crew';
import { PilotProfile } from '@/src/explorer/examples/avatar/profile';
import { InboxNotifications } from '@/src/explorer/examples/badge/notifications';
import { CrewPresence } from '@/src/explorer/examples/badge/presence';
import { MissionLog } from '@/src/explorer/examples/card/articles';
import { BountyCard } from '@/src/explorer/examples/card/profile';
import { FlightRoute } from '@/src/explorer/examples/carousel/controlled';
import { BountyReports } from '@/src/explorer/examples/carousel/reports';
import { PlanetFilters } from '@/src/explorer/examples/chip/filters';
import { CrewStatuses } from '@/src/explorer/examples/chip/statuses';
import { BountySearch } from '@/src/explorer/examples/data-table/filter';
import { ShipmentStates } from '@/src/explorer/examples/data-table/states';
import { ShipSpecifications } from '@/src/explorer/examples/divider/sections';
import { LogbookToolbar } from '@/src/explorer/examples/divider/toolbar';
import { EmptyBountyBoard } from '@/src/explorer/examples/empty-state/first-use';
import { PlanetSearch } from '@/src/explorer/examples/empty-state/search';
import { NoSignal } from '@/src/explorer/examples/error-state/offline';
import { BountyBoardError } from '@/src/explorer/examples/error-state/retry';
import { BebopCrew } from '@/src/explorer/examples/list/crew';
import { GrandPrixResults } from '@/src/explorer/examples/list/ranking';
import { TransmissionsPlaceholder } from '@/src/explorer/examples/skeleton-list/compact';
import { CrewRoster } from '@/src/explorer/examples/skeleton-list/crew';
import { LogEntry } from '@/src/explorer/examples/skeleton-text/article';
import { MissionBriefPlaceholder } from '@/src/explorer/examples/skeleton-text/card';
import { PlanetGalleryPlaceholder } from '@/src/explorer/examples/skeleton/gallery';
import { PilotProfilePlaceholder } from '@/src/explorer/examples/skeleton/profile';
import { FleetIndicators } from '@/src/explorer/examples/stat-card/indicators';
import { ShieldStatus } from '@/src/explorer/examples/stat-card/loading';
import { WeeklyBounties } from '@/src/explorer/examples/table/bounties';
import { PodraceTimes } from '@/src/explorer/examples/table/sortable';
import { DataDisplayPlayground } from '@/src/explorer/playgrounds/data-display';
import { dataDisplaySamples } from '@/src/explorer/samples/data-display';

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
