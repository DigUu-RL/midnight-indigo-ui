// The components of the explorer, grouped by the public subpath that exports them. Each one has a page at
// `/[locale]/components/<slug>`, its texts in `messages/*.json` (`explorer.components.<key>`), its examples in
// `explorer/examples/<slug>/` and its props in `component-api.json`, generated from the types of the library
// (`node scripts/generate-explorer-api.ts`). Plain data, so the scripts and the tests of the starter read it too.
import type { SampleName } from '#src/explorer/sample-code.ts';

/** A value the playground can give to a prop. */
export type PlaygroundValue = string | number | boolean;

/** How the samples of the grid of variants are laid out: side by side, or one per line across the page. */
export type SampleWidth = 'content' | 'full';

export interface ExplorerComponent {
	/** Name exported by the subpath. */
	name: string;
	/** Public subpath, after `@midnight-indigo/ui/`. */
	subpath: string;
	/** Components the page documents with this one, each with its props, e.g. `GridItem` with `Grid`. */
	parts: readonly string[];
	/** Ids of the examples in page order; each one is the file `examples/<slug>/<kebab-case id>.tsx`. */
	examples: readonly string[];
	/** Props of every rendering on the page, e.g. the label the component requires. */
	baseProps: Readonly<Record<string, PlaygroundValue>>;
	/** Props of every rendering that take an element, e.g. the icon of an `IconButton`: a sample of `sample-code.ts`. */
	slots: Readonly<Record<string, SampleName>>;
	sampleWidth: SampleWidth;
	/** Props the playground lets the reader change. */
	controls: readonly string[];
	/** Props with a union of values, each one shown with every value. */
	variants: readonly string[];
	/** Boolean props shown one at a time, in a row of states. */
	states: readonly string[];
	/** Attributes of the native element documented with the props of the library, e.g. `disabled`. */
	nativeProps: readonly string[];
	/** Accessibility notes, keys of `explorer.components.<key>.accessibility`. */
	accessibility: readonly string[];
}

export const explorerComponents = [
	{
		name: 'Button',
		subpath: 'buttons',
		parts: [],
		examples: ['actions', 'loading'],
		baseProps: { children: 'Engage hyperdrive' },
		slots: {},
		sampleWidth: 'content',
		controls: ['children', 'intent', 'variant', 'size', 'loading', 'disabled', 'fullWidth'],
		variants: ['intent', 'variant', 'size'],
		states: ['loading', 'disabled'],
		nativeProps: ['disabled', 'type'],
		accessibility: ['name', 'type', 'loading'],
	},
	{
		name: 'IconButton',
		subpath: 'buttons',
		parts: [],
		examples: ['actions', 'playback'],
		baseProps: { label: 'Add crew member' },
		slots: { children: 'plusIcon' },
		sampleWidth: 'content',
		controls: ['label', 'intent', 'variant', 'size', 'loading', 'disabled'],
		variants: ['intent', 'variant', 'size'],
		states: ['loading', 'disabled'],
		nativeProps: ['disabled', 'type'],
		accessibility: ['name', 'icon', 'target'],
	},
	{
		name: 'CopyButton',
		subpath: 'buttons',
		parts: [],
		examples: ['inline', 'invite'],
		baseProps: { value: 'Hyperspace route 7-Kessel' },
		slots: {},
		sampleWidth: 'content',
		controls: ['label', 'showLabel', 'intent', 'variant', 'size', 'feedbackDuration', 'disabled'],
		variants: ['intent', 'variant', 'size'],
		states: ['showLabel', 'disabled'],
		nativeProps: ['disabled'],
		accessibility: ['name', 'announcement', 'clipboard'],
	},
	{
		name: 'Chip',
		subpath: 'data-display',
		parts: [],
		examples: ['statuses', 'filters'],
		baseProps: { label: 'Samus Aran' },
		slots: {},
		sampleWidth: 'content',
		controls: ['label', 'intent', 'variant', 'size', 'disabled'],
		variants: ['intent', 'variant', 'size'],
		// A chip of the grid is text, not a control, so it has no disabled state to show.
		states: [],
		nativeProps: [],
		accessibility: ['text', 'toggle', 'remove'],
	},
	{
		name: 'Container',
		subpath: 'layout',
		parts: [],
		examples: ['article'],
		baseProps: {},
		slots: { children: 'missionBrief' },
		sampleWidth: 'full',
		controls: ['size', 'gutters'],
		// Its sizes differ only on a page wider than the grid, so the playground shows them.
		variants: [],
		states: [],
		nativeProps: ['children'],
		accessibility: ['landmark'],
	},
	{
		name: 'Stack',
		subpath: 'layout',
		parts: [],
		examples: ['header', 'list'],
		baseProps: { direction: 'row' },
		slots: { children: 'crewAvatars' },
		sampleWidth: 'full',
		controls: ['direction', 'gap', 'align', 'justify', 'wrap'],
		variants: ['direction', 'align', 'justify'],
		states: [],
		nativeProps: ['children'],
		accessibility: ['order', 'list'],
	},
	{
		name: 'Grid',
		subpath: 'layout',
		parts: ['GridItem'],
		examples: ['dashboard', 'gallery'],
		baseProps: { columns: 3 },
		slots: { children: 'planetCards' },
		sampleWidth: 'full',
		// `minColumnWidth` excludes `columns`, so its example shows it.
		controls: ['columns', 'gap'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['order', 'list'],
	},
] as const satisfies readonly ExplorerComponent[];

export type ExplorerEntry = (typeof explorerComponents)[number];

export type ComponentName = ExplorerEntry['name'];

export type ExampleId<Name extends ComponentName> = Extract<
	ExplorerEntry,
	{ name: Name }
>['examples'][number];

export interface SubpathGroup {
	subpath: string;
	components: readonly ExplorerComponent[];
}

/** `IconButton` → `icon-button`; `withIcon` → `with-icon`. */
export const kebabCaseOf = (name: string): string => {
	return name.replaceAll(/(?<=[\da-z])(?=[A-Z])/g, '-').toLowerCase();
};

/** `data-display` → `dataDisplay`; `IconButton` → `iconButton`: the keys of the messages are camelCase. */
export const camelCaseOf = (name: string): string => {
	const words: string = name.replaceAll(/-([a-z\d])/g, (_match: string, letter: string): string => {
		return letter.toUpperCase();
	});

	return `${words.charAt(0).toLowerCase()}${words.slice(1)}`;
};

/** Segment of the URL of the page of a component. */
export const slugOf = (component: Pick<ExplorerComponent, 'name'>): string => {
	return kebabCaseOf(component.name);
};

export const findComponent = (slug: string): ExplorerComponent | undefined => {
	return explorerComponents.find(
		(component: ExplorerComponent): boolean => slugOf(component) === slug,
	);
};

/** The components by subpath, in the order of the catalog. */
export const subpathGroups = (): SubpathGroup[] => {
	const subpaths: string[] = [
		...new Set(explorerComponents.map((component: ExplorerComponent): string => component.subpath)),
	];

	return subpaths.map((subpath: string): SubpathGroup => {
		return {
			subpath,
			components: explorerComponents.filter((component: ExplorerComponent): boolean => {
				return component.subpath === subpath;
			}),
		};
	});
};

/** The components a page documents: the component, then its parts. */
export const documentedNamesOf = (
	component: Pick<ExplorerComponent, 'name' | 'parts'>,
): string[] => {
	return [component.name, ...component.parts];
};

/** File of an example, relative to `src/explorer/examples`. */
export const exampleFileOf = (component: Pick<ExplorerComponent, 'name'>, id: string): string => {
	return `${slugOf(component)}/${kebabCaseOf(id)}.tsx`;
};
