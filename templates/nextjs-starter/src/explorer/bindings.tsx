// What the page of each component renders besides its texts: the component itself (in the grid of variants), the
// playground of its subpath and its examples. The examples are typed by the catalog, so an example missing here, or
// one the catalog does not list, fails the type check.
import { Button, CopyButton, IconButton } from '@midnight-indigo/ui/buttons';
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
import { Container, Grid, Stack } from '@midnight-indigo/ui/layout';
import type { ComponentType, ReactElement } from 'react';

import type { ComponentName, ExampleId } from '#src/explorer/catalog.ts';
import { CrewAvatars } from '#src/explorer/examples/avatar/crew.tsx';
import { PilotProfile } from '#src/explorer/examples/avatar/profile.tsx';
import { InboxNotifications } from '#src/explorer/examples/badge/notifications.tsx';
import { CrewPresence } from '#src/explorer/examples/badge/presence.tsx';
import { MissionActions } from '#src/explorer/examples/button/actions.tsx';
import { SaveLogbook } from '#src/explorer/examples/button/loading.tsx';
import { MissionLog } from '#src/explorer/examples/card/articles.tsx';
import { BountyCard } from '#src/explorer/examples/card/profile.tsx';
import { FlightRoute } from '#src/explorer/examples/carousel/controlled.tsx';
import { BountyReports } from '#src/explorer/examples/carousel/reports.tsx';
import { PlanetFilters } from '#src/explorer/examples/chip/filters.tsx';
import { CrewStatuses } from '#src/explorer/examples/chip/statuses.tsx';
import { CaptainsLog } from '#src/explorer/examples/container/article.tsx';
import { HyperspaceRoute } from '#src/explorer/examples/copy-button/inline.tsx';
import { CrewInvite } from '#src/explorer/examples/copy-button/invite.tsx';
import { ShipSpecifications } from '#src/explorer/examples/divider/sections.tsx';
import { LogbookToolbar } from '#src/explorer/examples/divider/toolbar.tsx';
import { FleetDashboard } from '#src/explorer/examples/grid/dashboard.tsx';
import { PlanetGallery } from '#src/explorer/examples/grid/gallery.tsx';
import { CrewMemberActions } from '#src/explorer/examples/icon-button/actions.tsx';
import { PlaybackControls } from '#src/explorer/examples/icon-button/playback.tsx';
import { BebopCrew } from '#src/explorer/examples/list/crew.tsx';
import { GrandPrixResults } from '#src/explorer/examples/list/ranking.tsx';
import { HangarHeader } from '#src/explorer/examples/stack/header.tsx';
import { CrewList } from '#src/explorer/examples/stack/list.tsx';
import { FleetIndicators } from '#src/explorer/examples/stat-card/indicators.tsx';
import { ShieldStatus } from '#src/explorer/examples/stat-card/loading.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';
import { ButtonsPlayground } from '#src/explorer/playgrounds/buttons.tsx';
import { DataDisplayPlayground } from '#src/explorer/playgrounds/data-display.tsx';
import { LayoutPlayground } from '#src/explorer/playgrounds/layout.tsx';

/** Any component: the page gives it only props the catalog and the generated API describe. */
export type AnyComponent = (props: never) => ReactElement | null;

interface ComponentBinding<Name extends ComponentName> {
	component: AnyComponent;
	playground: PlaygroundComponent;
	examples: Readonly<Record<ExampleId<Name>, ComponentType>>;
}

export interface PageBinding {
	component: AnyComponent;
	playground: PlaygroundComponent;
	examples: Readonly<Record<string, ComponentType>>;
}

const componentBindings: { readonly [Name in ComponentName]: ComponentBinding<Name> } = {
	Button: {
		component: Button,
		playground: ButtonsPlayground,
		examples: { actions: MissionActions, loading: SaveLogbook },
	},
	IconButton: {
		component: IconButton,
		playground: ButtonsPlayground,
		examples: { actions: CrewMemberActions, playback: PlaybackControls },
	},
	CopyButton: {
		component: CopyButton,
		playground: ButtonsPlayground,
		examples: { inline: HyperspaceRoute, invite: CrewInvite },
	},
	Avatar: {
		component: Avatar,
		playground: DataDisplayPlayground,
		examples: { profile: PilotProfile, crew: CrewAvatars },
	},
	Badge: {
		component: Badge,
		playground: DataDisplayPlayground,
		examples: { notifications: InboxNotifications, presence: CrewPresence },
	},
	Card: {
		component: Card,
		playground: DataDisplayPlayground,
		examples: { profile: BountyCard, articles: MissionLog },
	},
	Carousel: {
		component: Carousel,
		playground: DataDisplayPlayground,
		examples: { reports: BountyReports, controlled: FlightRoute },
	},
	Chip: {
		component: Chip,
		playground: DataDisplayPlayground,
		examples: { statuses: CrewStatuses, filters: PlanetFilters },
	},
	Divider: {
		component: Divider,
		playground: DataDisplayPlayground,
		examples: { toolbar: LogbookToolbar, sections: ShipSpecifications },
	},
	List: {
		component: List,
		playground: DataDisplayPlayground,
		examples: { crew: BebopCrew, ranking: GrandPrixResults },
	},
	StatCard: {
		component: StatCard,
		playground: DataDisplayPlayground,
		examples: { indicators: FleetIndicators, loading: ShieldStatus },
	},
	Container: {
		component: Container,
		playground: LayoutPlayground,
		examples: { article: CaptainsLog },
	},
	Stack: {
		component: Stack,
		playground: LayoutPlayground,
		examples: { header: HangarHeader, list: CrewList },
	},
	Grid: {
		component: Grid,
		playground: LayoutPlayground,
		examples: { dashboard: FleetDashboard, gallery: PlanetGallery },
	},
};

const bindings: Readonly<Record<string, PageBinding>> = componentBindings;

export const bindingOf = (name: string): PageBinding | undefined => bindings[name];
