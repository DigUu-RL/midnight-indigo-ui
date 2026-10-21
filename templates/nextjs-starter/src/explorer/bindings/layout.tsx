// The components of `@midnight-indigo/ui/layout` in the explorer: see `explorer/bindings.ts`.
import { Container, Grid, Stack } from '@midnight-indigo/ui/layout';

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { CaptainsLog } from '#src/explorer/examples/container/article.tsx';
import { FleetDashboard } from '#src/explorer/examples/grid/dashboard.tsx';
import { PlanetGallery } from '#src/explorer/examples/grid/gallery.tsx';
import { HangarHeader } from '#src/explorer/examples/stack/header.tsx';
import { CrewList } from '#src/explorer/examples/stack/list.tsx';
import { LayoutPlayground } from '#src/explorer/playgrounds/layout.tsx';
import { layoutSamples } from '#src/explorer/samples/layout.tsx';

export const layoutBindings: SubpathBindings<'layout'> = {
	playground: LayoutPlayground,
	samples: layoutSamples,
	components: {
		Container: { component: Container, examples: { article: CaptainsLog } },
		Stack: { component: Stack, examples: { header: HangarHeader, list: CrewList } },
		Grid: { component: Grid, examples: { dashboard: FleetDashboard, gallery: PlanetGallery } },
	},
};
