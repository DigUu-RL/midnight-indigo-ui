// The values of the samples of `sample-code.ts`, as its code writes them: the grid of variants and the playground give
// them to the props that take an element, an object or a function. Each subpath renders the samples of its components
// in `samples/<subpath>.tsx`, which only the route of that subpath reaches; a sample missing there fails the type check.
import type { DataTableColumn, StatChange } from '@midnight-indigo/ui/data-display';
import { Icon } from '@midnight-indigo/ui/icons';
import type { ReactElement } from 'react';

import type { ExplorerSubpath, SubpathSampleName } from '#src/explorer/catalog.ts';
import type { SampleBounty, SampleChoice, SampleMenuEntry } from '#src/explorer/sample-code.ts';

/**
 * An element, a list of them (each one a child of its own, e.g. a slide of a `Carousel`, which a fragment would merge
 * into one), a text or an object a Server Component can pass to a Client Component, or what a client module exports
 * (the columns of a `DataTable` and its function of the row ids, which hold functions).
 */
export type SampleValue =
	| string
	| readonly string[]
	| ReactElement
	| readonly ReactElement[]
	| StatChange
	| readonly SampleBounty[]
	| readonly SampleMenuEntry[]
	| readonly SampleChoice[]
	| readonly DataTableColumn<SampleBounty>[]
	| ((bounty: SampleBounty) => string);

/** The samples of the components of a subpath. */
export type SubpathSamples<Subpath extends ExplorerSubpath> = Readonly<
	Record<SubpathSampleName<Subpath>, SampleValue>
>;

/** Shared by the samples of several subpaths. */
export const plusIcon: ReactElement = (
	<Icon decorative>
		<path
			d='M12 5v14m-7-7h14'
			fill='none'
			stroke='currentColor'
			strokeWidth={2}
			strokeLinecap='round'
		/>
	</Icon>
);
