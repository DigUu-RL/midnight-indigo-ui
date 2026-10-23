// The components of `@midnight-indigo/ui/layout` in the explorer: see `explorer/bindings.ts`.
import { Container, Grid, Stack } from '@midnight-indigo/ui/layout';

import type { SubpathBindings } from '@/src/explorer/bindings';
import { CaptainsLog } from '@/src/explorer/examples/container/article';
import { FleetDashboard } from '@/src/explorer/examples/grid/dashboard';
import { PlanetGallery } from '@/src/explorer/examples/grid/gallery';
import { HangarHeader } from '@/src/explorer/examples/stack/header';
import { CrewList } from '@/src/explorer/examples/stack/list';
import { LayoutPlayground } from '@/src/explorer/playgrounds/layout';
import { layoutSamples } from '@/src/explorer/samples/layout';

export const layoutBindings: SubpathBindings<'layout'> = {
	playground: LayoutPlayground,
	samples: layoutSamples,
	components: {
		Container: { component: Container, examples: { article: CaptainsLog } },
		Stack: { component: Stack, examples: { header: HangarHeader, list: CrewList } },
		Grid: { component: Grid, examples: { dashboard: FleetDashboard, gallery: PlanetGallery } },
	},
};
