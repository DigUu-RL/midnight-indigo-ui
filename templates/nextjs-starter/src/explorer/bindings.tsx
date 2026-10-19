// What the page of each component renders besides its texts: the component itself (in the grid of variants), the
// playground of its subpath and its examples. The examples are typed by the catalog, so an example missing here, or
// one the catalog does not list, fails the type check.
import { Button } from '@midnight-indigo/ui/buttons';
import { Chip } from '@midnight-indigo/ui/data-display';
import type { ComponentType, ReactElement } from 'react';

import type { ComponentName, ExampleId } from '#src/explorer/catalog.ts';
import { MissionActions } from '#src/explorer/examples/button/actions.tsx';
import { SaveLogbook } from '#src/explorer/examples/button/loading.tsx';
import { PlanetFilters } from '#src/explorer/examples/chip/filters.tsx';
import { CrewStatuses } from '#src/explorer/examples/chip/statuses.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';
import { ButtonsPlayground } from '#src/explorer/playgrounds/buttons.tsx';
import { DataDisplayPlayground } from '#src/explorer/playgrounds/data-display.tsx';

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
	Chip: {
		component: Chip,
		playground: DataDisplayPlayground,
		examples: { statuses: CrewStatuses, filters: PlanetFilters },
	},
};

const bindings: Readonly<Record<string, PageBinding>> = componentBindings;

export const bindingOf = (name: string): PageBinding | undefined => bindings[name];
