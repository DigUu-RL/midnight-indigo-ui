// What the page of each component renders besides its texts: the component itself (in the grid of variants), the
// playground and the samples of its subpath and its examples. Each subpath binds them in `bindings/<subpath>.tsx`,
// which only the route of that subpath imports, so a page loads the client code of its own subpath alone. The bindings
// are typed by the catalog: a component, an example or a sample missing there, or one the catalog does not list, fails
// the type check.
import type { ComponentType, ReactElement } from 'react';

import type {
	ComponentName,
	ExampleId,
	ExplorerSubpath,
	SubpathComponentName,
} from '#src/explorer/catalog.ts';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';
import type { SampleName } from '#src/explorer/sample-code.ts';
import type { SampleValue, SubpathSamples } from '#src/explorer/samples.tsx';

/** Any component: the page gives it only props the catalog and the generated API describe. */
export type AnyComponent = (props: never) => ReactElement | null;

/** An example: a component, or a Server Component that awaits its data, e.g. code colored by `highlightCode`. */
export type ExampleComponent = ComponentType | (() => Promise<ReactElement>);

interface ComponentBinding<Name extends ComponentName> {
	component: AnyComponent;
	examples: Readonly<Record<ExampleId<Name>, ExampleComponent>>;
}

/** The playground of a subpath, the samples of its slots and, for each component, the component and its examples. */
export interface SubpathBindings<Subpath extends ExplorerSubpath> {
	playground: PlaygroundComponent;
	samples: SubpathSamples<Subpath>;
	components: { readonly [Name in SubpathComponentName<Subpath>]: ComponentBinding<Name> };
}

export interface PageBinding {
	component: AnyComponent;
	examples: Readonly<Record<string, ExampleComponent>>;
}

/** The bindings of any subpath, as the page reads them. */
export interface RouteBindings {
	playground: PlaygroundComponent;
	samples: Readonly<Partial<Record<SampleName, SampleValue>>>;
	components: Readonly<Record<string, PageBinding>>;
}
