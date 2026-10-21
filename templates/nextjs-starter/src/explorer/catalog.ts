// The components of the explorer, grouped by the public subpath that exports them. Each one has a page at
// `/[locale]/components/<slug>`, its texts in `messages/*.json` (`explorer.components.<key>`), its examples in
// `explorer/examples/<slug>/` and its props in `component-api.json`, generated from the types of the library
// (`node scripts/generate-explorer-api.ts`). Plain data, so the scripts and the tests of the starter read it too.
import type { SampleName } from '#src/explorer/sample-code.ts';

/** A value the playground can give to a prop. */
export type PlaygroundValue = string | number | boolean;

/** How the samples of the grid of variants are laid out: side by side, or one per line across the page. */
export type SampleWidth = 'content' | 'full';

/**
 * The button that opens a modal overlay, which the parent shows through `open`: the grid of variants leaves it out, and
 * the playground renders the button, opens the overlay with it and closes it from the props that ask to close.
 */
export interface Opener {
	/** Text of the button. */
	label: string;
	/** Props the overlay calls to close, e.g. `onClose`, or `onConfirm` and `onCancel`. */
	closeProps: readonly string[];
}

/**
 * The hook that drives a provider the application renders once, e.g. `useToast` over the `ToastProvider` of the root
 * layout: the playground renders a button that calls a method of the hook with the values of its controls, which are
 * the fields of the options of that method, not the props of the component.
 */
export interface HookTrigger {
	/** Name of the hook, exported by the subpath of the component. */
	hook: string;
	/** Type the hook returns, e.g. `ToastApi`. */
	api: string;
	/** Method the button calls, e.g. `show`. */
	method: string;
	/** Type of the options of the method, e.g. `ToastOptions`: the controls and the base props are its fields. */
	options: string;
	/** Text of the button. */
	label: string;
}

export interface ExplorerComponent {
	/** Name exported by the subpath. */
	name: string;
	/** Public subpath, after `@midnight-indigo/ui/`. */
	subpath: string;
	/** Components the page documents with this one, each with its props, e.g. `GridItem` with `Grid`. */
	parts: readonly string[];
	/** Types the page documents with their fields, e.g. `MenuItemOption`, the items of a `Menu`. None when absent. */
	types?: readonly string[];
	/** The button of the playground of a modal overlay. Absent for the other components. */
	opener?: Opener;
	/** The hook the playground calls in place of rendering the component. Absent for the other components. */
	trigger?: HookTrigger;
	/** Ids of the examples in page order; each one is the file `examples/<slug>/<kebab-case id>.tsx`. */
	examples: readonly string[];
	/** Props of every rendering on the page, e.g. the label the component requires. */
	baseProps: Readonly<Record<string, PlaygroundValue>>;
	/**
	 * Props of every rendering that take an element or an object, e.g. the icon of an `IconButton` or the `change` of a
	 * `StatCard`: a sample of `sample-code.ts`.
	 */
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
		name: 'Code',
		subpath: 'code',
		parts: [],
		examples: ['sentence', 'settings'],
		baseProps: { children: 'hyperdrive --jump Kessel' },
		slots: {},
		sampleWidth: 'content',
		controls: ['children'],
		variants: [],
		states: [],
		nativeProps: ['children'],
		accessibility: ['text', 'block', 'wrap'],
	},
	{
		name: 'CodeBlock',
		subpath: 'code',
		parts: [],
		examples: ['highlighted', 'files'],
		baseProps: { fileName: 'jump.ts' },
		// The playground gives it a string, shown without colors; the examples color theirs with `highlightCode`.
		slots: { code: 'jumpSource' },
		sampleWidth: 'full',
		// `highlightedLines` takes a list of numbers, so its example shows it.
		controls: ['fileName', 'showLineNumbers', 'copyable'],
		variants: [],
		states: ['showLineNumbers'],
		nativeProps: [],
		accessibility: ['name', 'keyboard', 'copy'],
	},
	{
		name: 'Avatar',
		subpath: 'data-display',
		parts: [],
		examples: ['profile', 'crew'],
		baseProps: { name: 'Spike Spiegel' },
		slots: {},
		sampleWidth: 'content',
		controls: ['name', 'size', 'intent', 'decorative'],
		variants: ['size', 'intent'],
		// A decorative avatar looks the same; only assistive technologies tell it apart.
		states: [],
		nativeProps: [],
		accessibility: ['name', 'decorative', 'image'],
	},
	{
		name: 'Badge',
		subpath: 'data-display',
		parts: [],
		examples: ['notifications', 'presence'],
		baseProps: { label: '3 unread messages', content: 3 },
		slots: { children: 'pilotAvatar' },
		sampleWidth: 'content',
		// `content` takes a number or a text, so it has no control. `label` has none either: a badge needs it or
		// `decorative`, which the type tells only by their union, so a blank label would leave the badge without both.
		controls: ['max', 'intent', 'variant', 'dot', 'showZero', 'invisible'],
		variants: ['intent', 'variant'],
		states: ['dot'],
		nativeProps: [],
		accessibility: ['label', 'decorative', 'dot'],
	},
	{
		name: 'Card',
		subpath: 'data-display',
		parts: ['CardHeader', 'CardContent'],
		examples: ['profile', 'articles'],
		baseProps: {},
		slots: { children: 'briefSections' },
		sampleWidth: 'full',
		controls: ['variant', 'as'],
		variants: ['variant'],
		states: [],
		nativeProps: ['children'],
		accessibility: ['region', 'heading', 'actions'],
	},
	{
		name: 'Carousel',
		subpath: 'data-display',
		parts: [],
		examples: ['reports', 'controlled'],
		baseProps: { label: 'Featured planets' },
		slots: { children: 'planetSlides' },
		sampleWidth: 'full',
		// `defaultIndex` only counts on the first render, so its example shows it.
		controls: ['label', 'loop'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['region', 'keyboard', 'hidden', 'motion'],
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
		name: 'Divider',
		subpath: 'data-display',
		parts: [],
		examples: ['toolbar', 'sections'],
		baseProps: {},
		slots: {},
		sampleWidth: 'content',
		controls: ['orientation', 'decorative'],
		variants: ['orientation'],
		states: [],
		nativeProps: [],
		accessibility: ['separator', 'decorative', 'contrast'],
	},
	{
		name: 'List',
		subpath: 'data-display',
		parts: ['ListItem'],
		examples: ['crew', 'ranking'],
		baseProps: {},
		slots: { children: 'crewItems' },
		sampleWidth: 'full',
		controls: ['ordered', 'divided'],
		variants: [],
		states: [],
		nativeProps: ['children'],
		accessibility: ['count', 'controls', 'table'],
	},
	{
		name: 'StatCard',
		subpath: 'data-display',
		parts: [],
		examples: ['indicators', 'loading'],
		baseProps: { label: 'Bounties collected', value: '2.4M woolongs' },
		slots: { change: 'bountyChange' },
		sampleWidth: 'content',
		controls: ['label', 'value', 'description', 'loading'],
		variants: [],
		states: ['loading'],
		nativeProps: [],
		accessibility: ['group', 'trend', 'loading'],
	},
	{
		name: 'Skeleton',
		subpath: 'data-display',
		parts: [],
		examples: ['profile', 'gallery'],
		baseProps: {},
		slots: {},
		sampleWidth: 'content',
		controls: ['shape', 'width', 'height'],
		variants: ['shape'],
		states: [],
		nativeProps: [],
		accessibility: ['hidden', 'busy', 'motion'],
	},
	{
		name: 'SkeletonText',
		subpath: 'data-display',
		parts: [],
		examples: ['article', 'card'],
		baseProps: {},
		slots: {},
		sampleWidth: 'full',
		controls: ['lines', 'label'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['status', 'label', 'replace'],
	},
	{
		name: 'SkeletonList',
		subpath: 'data-display',
		parts: [],
		examples: ['crew', 'compact'],
		baseProps: {},
		slots: {},
		sampleWidth: 'full',
		controls: ['items', 'withLeading', 'label'],
		variants: [],
		states: ['withLeading'],
		nativeProps: [],
		accessibility: ['status', 'label', 'replace'],
	},
	{
		name: 'EmptyState',
		subpath: 'data-display',
		parts: [],
		examples: ['firstUse', 'search'],
		baseProps: {
			title: 'No bounties yet',
			description: 'The bounties the ISSP posts show up here.',
		},
		slots: { action: 'newBountyButton' },
		sampleWidth: 'full',
		// `headingLevel` takes a number of a union, which a field would let out of it, so its example shows it.
		controls: ['title', 'description'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['static', 'heading', 'results'],
	},
	{
		name: 'ErrorState',
		subpath: 'data-display',
		parts: [],
		examples: ['retry', 'offline'],
		// The samples are on the page from its first render, so they do not interrupt the reader as an alert.
		baseProps: { title: 'The bounty board could not be loaded', announce: false },
		slots: { action: 'retryButton' },
		sampleWidth: 'full',
		controls: ['title', 'description', 'announce'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['alert', 'color', 'retry'],
	},
	{
		name: 'Table',
		subpath: 'data-display',
		parts: ['TableHead', 'TableBody', 'TableFooter', 'TableRow', 'TableHeaderCell', 'TableCell'],
		examples: ['bounties', 'sortable'],
		baseProps: { caption: 'Most wanted' },
		slots: { children: 'bountyTableRows' },
		sampleWidth: 'full',
		controls: ['caption', 'hideCaption', 'density'],
		variants: ['density'],
		states: [],
		nativeProps: ['children'],
		accessibility: ['caption', 'headers', 'scroll', 'layout'],
	},
	{
		name: 'DataTable',
		subpath: 'data-display',
		parts: [],
		examples: ['filter', 'states'],
		baseProps: { caption: 'Wanted bounties' },
		// Their functions run in the browser: `client-samples.tsx` exports them.
		slots: { columns: 'bountyColumns', rows: 'bounties', getRowId: 'bountyRowId' },
		sampleWidth: 'full',
		controls: ['caption', 'hideCaption', 'density', 'status', 'pageSize', 'filter'],
		variants: ['density', 'status'],
		states: [],
		nativeProps: [],
		accessibility: ['sort', 'announcements', 'pagination', 'states'],
	},
	{
		name: 'Alert',
		subpath: 'feedback',
		parts: [],
		examples: ['saved', 'maintenance'],
		baseProps: { title: 'Hyperdrive offline', children: 'The jump to Kessel waits for repairs.' },
		slots: {},
		sampleWidth: 'full',
		controls: ['title', 'children', 'intent', 'variant', 'announce'],
		variants: ['intent', 'variant'],
		states: [],
		nativeProps: [],
		accessibility: ['announce', 'icon', 'dismiss'],
	},
	{
		name: 'ProgressBar',
		subpath: 'feedback',
		parts: [],
		examples: ['upload', 'indeterminate'],
		baseProps: { label: 'Charging the hyperdrive', value: 60 },
		slots: {},
		sampleWidth: 'full',
		// Without `value` the bar is indeterminate, and a field always holds a number, so its example shows it.
		controls: ['label', 'value', 'min', 'max', 'valueText', 'shape', 'intent', 'size'],
		variants: ['shape', 'intent', 'size'],
		states: [],
		nativeProps: [],
		accessibility: ['label', 'value', 'motion'],
	},
	{
		name: 'Tooltip',
		subpath: 'feedback',
		parts: [],
		examples: ['shortcuts', 'truncated'],
		baseProps: { content: 'Shortcut: Shift + N' },
		slots: { children: 'addCrewButton' },
		sampleWidth: 'content',
		// A tooltip shows only while its trigger is hovered or focused, so a grid of placements would look the same.
		controls: ['content', 'placement', 'delay'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['describes', 'content', 'disabled'],
	},
	{
		name: 'Popover',
		subpath: 'feedback',
		parts: [],
		examples: ['filters', 'details'],
		baseProps: { title: 'Jump coordinates', children: 'Kessel, 12 parsecs past the Maw.' },
		slots: { trigger: 'plotJumpButton' },
		sampleWidth: 'content',
		// A popover needs `title` or `label`, which the type tells only by their union, so a blank title would leave it
		// without both. It shows only while open, so a grid of placements would look the same.
		controls: ['children', 'placement', 'closeOnOutsideClick'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['dialog', 'focus', 'name'],
	},
	{
		name: 'Menu',
		subpath: 'feedback',
		parts: [],
		types: ['MenuItemOption', 'MenuSeparator'],
		examples: ['actions', 'shortcuts'],
		baseProps: {},
		slots: { trigger: 'crewActionsButton', items: 'crewMenuItems' },
		sampleWidth: 'content',
		controls: ['placement'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['name', 'keyboard', 'select'],
	},
	{
		name: 'ContextMenu',
		subpath: 'feedback',
		parts: [],
		types: ['MenuItemOption', 'MenuSeparator'],
		examples: ['logs', 'visibleActions'],
		baseProps: { label: 'Actions for Spike Spiegel' },
		slots: { children: 'crewMemberCard', items: 'crewMenuItems' },
		sampleWidth: 'content',
		controls: ['label', 'disabled'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['keyboard', 'focusable', 'discover'],
	},
	{
		name: 'Dialog',
		subpath: 'feedback',
		parts: [],
		examples: ['form', 'details'],
		baseProps: {
			title: 'Flight plan',
			description: 'Check the route before the jump to hyperspace.',
			children: 'Tatooine to Kessel, 12 parsecs.',
		},
		slots: {},
		sampleWidth: 'content',
		opener: { label: 'Open the flight plan', closeProps: ['onClose'] },
		controls: [
			'title',
			'description',
			'children',
			'size',
			'closeOnOutsideClick',
			'hideCloseButton',
			'role',
		],
		// A dialog covers the page while open, so its sizes are seen in the playground.
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['name', 'focus', 'close'],
	},
	{
		name: 'ConfirmDialog',
		subpath: 'feedback',
		parts: [],
		examples: ['destructive', 'pending'],
		baseProps: {
			title: 'Release the bounty?',
			description: 'The bounty on Vicious goes back to the board. This cannot be undone.',
		},
		slots: {},
		sampleWidth: 'content',
		opener: { label: 'Release the bounty', closeProps: ['onConfirm', 'onCancel'] },
		controls: ['title', 'description', 'intent', 'size'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['alertdialog', 'focus', 'labels'],
	},
	{
		name: 'Drawer',
		subpath: 'feedback',
		parts: [],
		examples: ['details', 'filters'],
		baseProps: {
			title: 'Crew details',
			description: 'Spike Spiegel, bounty hunter of the Bebop.',
			children: 'Last seen on Mars, on the trail of Asimov Solensan.',
		},
		slots: {},
		sampleWidth: 'content',
		opener: { label: 'Show crew details', closeProps: ['onClose'] },
		controls: ['title', 'description', 'children', 'placement', 'size', 'closeOnOutsideClick'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['dialog', 'placement', 'close'],
	},
	{
		name: 'ToastProvider',
		subpath: 'feedback',
		parts: [],
		types: ['ToastOptions', 'ToastAction', 'ToastApi'],
		examples: ['undo', 'updates'],
		baseProps: {
			intent: 'success',
			title: 'Bounty collected',
			message: 'Spike Spiegel delivered Asimov Solensan to the ISSP.',
		},
		slots: {},
		sampleWidth: 'content',
		trigger: {
			hook: 'useToast',
			api: 'ToastApi',
			method: 'show',
			options: 'ToastOptions',
			label: 'Show the toast',
		},
		// `duration` defaults by the intent and `action` takes a function, so their examples show them. The toasts are
		// shown by the provider of the layout, so there is no grid of variants.
		controls: ['intent', 'title', 'message'],
		variants: [],
		states: [],
		nativeProps: [],
		accessibility: ['announce', 'keyboard', 'duration'],
	},
	{
		name: 'TextField',
		subpath: 'forms',
		parts: [],
		examples: ['validation', 'adornments'],
		// A value from the start tells the disabled and read-only states apart.
		baseProps: { label: 'Callsign', defaultValue: 'Swordfish II' },
		slots: {},
		sampleWidth: 'content',
		controls: [
			'label',
			'description',
			'error',
			'placeholder',
			'prefix',
			'suffix',
			'type',
			'size',
			'hideLabel',
			'required',
			'disabled',
			'readOnly',
			'loading',
		],
		// The types differ in the keyboard and the validation they give, not in how the field looks.
		variants: ['size'],
		states: ['required', 'disabled', 'readOnly', 'loading'],
		nativeProps: ['name', 'value', 'defaultValue', 'placeholder', 'autoComplete'],
		accessibility: ['label', 'error', 'autocomplete'],
	},
	{
		name: 'TextArea',
		subpath: 'forms',
		parts: [],
		examples: ['counter', 'editing'],
		baseProps: {
			label: 'Mission notes',
			defaultValue: 'Reach Tijuana before the Red Dragon syndicate.',
			maxLength: 280,
		},
		slots: {},
		sampleWidth: 'content',
		// `rows` and `maxLength` take a number with no default, which a field would set to `0`, so the examples show them.
		controls: [
			'label',
			'description',
			'error',
			'placeholder',
			'resize',
			'size',
			'showCount',
			'required',
			'disabled',
			'readOnly',
		],
		variants: ['resize', 'size'],
		states: ['showCount', 'required', 'disabled', 'readOnly'],
		nativeProps: ['name', 'value', 'defaultValue', 'placeholder', 'rows', 'maxLength'],
		accessibility: ['counter', 'limit', 'resize'],
	},
	{
		name: 'PasswordField',
		subpath: 'forms',
		parts: [],
		examples: ['signIn', 'newPassword'],
		baseProps: { label: 'Password', defaultValue: 'see-you-space-cowboy' },
		slots: {},
		sampleWidth: 'content',
		// `defaultVisible` only counts on the first render, so its example shows it.
		controls: ['label', 'description', 'error', 'size', 'required', 'disabled', 'readOnly'],
		variants: ['size'],
		states: ['required', 'disabled', 'readOnly'],
		nativeProps: ['name', 'value', 'defaultValue', 'autoComplete'],
		accessibility: ['toggle', 'autocomplete', 'paste'],
	},
	{
		name: 'SearchField',
		subpath: 'forms',
		parts: [],
		examples: ['filter', 'landmark'],
		// A value from the start shows the clear button.
		baseProps: { label: 'Search bounties', defaultValue: 'Mars' },
		slots: {},
		sampleWidth: 'content',
		controls: ['label', 'hideLabel', 'placeholder', 'clearable', 'size', 'disabled', 'loading'],
		variants: ['size'],
		states: ['loading', 'disabled'],
		nativeProps: ['name', 'value', 'defaultValue', 'placeholder'],
		accessibility: ['landmark', 'clear', 'results'],
	},
	{
		name: 'NumberField',
		subpath: 'forms',
		parts: [],
		examples: ['cargo', 'reward'],
		baseProps: { label: 'Crew members', defaultValue: 4, min: 1, max: 12 },
		slots: {},
		sampleWidth: 'content',
		controls: [
			'label',
			'description',
			'error',
			'prefix',
			'suffix',
			'size',
			'steppers',
			'required',
			'disabled',
			'readOnly',
		],
		variants: ['size'],
		states: ['steppers', 'disabled', 'readOnly'],
		nativeProps: ['name', 'value', 'defaultValue', 'min', 'max', 'step'],
		accessibility: ['keyboard', 'range', 'format'],
	},
	{
		name: 'Checkbox',
		subpath: 'forms',
		parts: [],
		examples: ['terms', 'selectAll'],
		// Checked from the start, so the indeterminate and disabled states show their marks.
		baseProps: { label: 'Accept the bounty terms', defaultChecked: true },
		slots: {},
		sampleWidth: 'content',
		// A checkbox needs `label`, `aria-label` or `aria-labelledby`, which the type cannot tell, so a blank label
		// would leave it without a name.
		controls: ['description', 'error', 'indeterminate', 'required', 'disabled'],
		variants: [],
		states: ['indeterminate', 'required', 'disabled'],
		nativeProps: ['name', 'value', 'checked', 'defaultChecked'],
		accessibility: ['name', 'keyboard', 'indeterminate'],
	},
	{
		name: 'CheckboxGroup',
		subpath: 'forms',
		parts: [],
		types: ['ChoiceOption'],
		examples: ['channels', 'filters'],
		baseProps: { legend: 'Crew on the mission' },
		slots: { options: 'crewOptions', defaultValue: 'checkedCrew' },
		sampleWidth: 'content',
		controls: [
			'legend',
			'description',
			'error',
			'orientation',
			'hideLegend',
			'required',
			'disabled',
		],
		variants: ['orientation'],
		states: ['required', 'disabled'],
		nativeProps: [],
		accessibility: ['legend', 'keyboard', 'required'],
	},
	{
		name: 'RadioGroup',
		subpath: 'forms',
		parts: [],
		types: ['ChoiceOption'],
		examples: ['routes', 'required'],
		baseProps: { legend: 'Ship', defaultValue: 'bebop' },
		slots: { options: 'shipOptions' },
		sampleWidth: 'content',
		controls: [
			'legend',
			'description',
			'error',
			'orientation',
			'hideLegend',
			'required',
			'disabled',
		],
		variants: ['orientation'],
		states: ['required', 'disabled'],
		nativeProps: [],
		accessibility: ['keyboard', 'checked', 'radioOrCheckbox'],
	},
	{
		name: 'Switch',
		subpath: 'forms',
		parts: [],
		examples: ['settings', 'dependent'],
		baseProps: { label: 'Autopilot', defaultChecked: true },
		slots: {},
		sampleWidth: 'content',
		// A switch needs `label`, `aria-label` or `aria-labelledby`, which the type cannot tell, so a blank label would
		// leave it without a name.
		controls: ['description', 'error', 'required', 'disabled'],
		variants: [],
		states: ['disabled'],
		nativeProps: ['name', 'value', 'checked', 'defaultChecked'],
		accessibility: ['role', 'immediate', 'keyboard'],
	},
	{
		name: 'Select',
		subpath: 'forms',
		parts: [],
		types: ['SelectOption', 'SelectOptionGroup'],
		examples: ['groups', 'dependent'],
		baseProps: { label: 'Planet', defaultValue: 'mars' },
		slots: { options: 'planetOptions' },
		sampleWidth: 'content',
		controls: [
			'label',
			'hideLabel',
			'description',
			'error',
			'placeholder',
			'size',
			'required',
			'disabled',
			'loading',
		],
		variants: ['size'],
		states: ['required', 'disabled', 'loading'],
		nativeProps: ['name'],
		accessibility: ['native', 'placeholder', 'readOnly'],
	},
	{
		name: 'Combobox',
		subpath: 'forms',
		parts: [],
		types: ['ComboboxOption'],
		examples: ['search', 'remote'],
		baseProps: { label: 'Bounty', defaultValue: 'mad-pierrot' },
		slots: { options: 'bountyOptions' },
		sampleWidth: 'content',
		// `maxVisibleOptions` takes a number its field would set to `0`, so its example shows it.
		controls: [
			'label',
			'hideLabel',
			'description',
			'error',
			'placeholder',
			'filter',
			'size',
			'required',
			'disabled',
			'loading',
		],
		variants: ['size'],
		states: ['required', 'disabled', 'loading'],
		nativeProps: ['name', 'placeholder'],
		accessibility: ['keyboard', 'announce', 'manyOptions'],
	},
	{
		name: 'Slider',
		subpath: 'forms',
		parts: [],
		examples: ['formatted', 'input'],
		baseProps: { label: 'Thrust', defaultValue: 60 },
		slots: {},
		sampleWidth: 'full',
		// `formatValue` takes a function and `input` an element, so their examples show them.
		controls: ['label', 'hideLabel', 'description', 'error', 'min', 'max', 'step', 'disabled'],
		variants: [],
		states: ['disabled'],
		nativeProps: ['name'],
		accessibility: ['keyboard', 'valueText', 'precision'],
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

export type ExplorerSubpath = ExplorerEntry['subpath'];

export type SubpathComponentName<Subpath extends ExplorerSubpath> = Extract<
	ExplorerEntry,
	{ subpath: Subpath }
>['name'];

type SlotSampleOf<Entry> = Entry extends { slots: infer Slots } ? Slots[keyof Slots] : never;

/** The samples the components of a subpath give to their slots. */
export type SubpathSampleName<Subpath extends ExplorerSubpath> = SlotSampleOf<
	Extract<ExplorerEntry, { subpath: Subpath }>
>;

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

/** The components and the types a page describes: its components, then its types. */
export const describedNamesOf = (
	component: Pick<ExplorerComponent, 'name' | 'parts' | 'types'>,
): string[] => {
	return [...documentedNamesOf(component), ...(component.types ?? [])];
};

/** What the playground edits: the options of the method of its hook, else the props of the component. */
export const controlledNameOf = (
	component: Pick<ExplorerComponent, 'name' | 'trigger'>,
): string => {
	return component.trigger?.options ?? component.name;
};

/** File of an example, relative to `src/explorer/examples`. */
export const exampleFileOf = (component: Pick<ExplorerComponent, 'name'>, id: string): string => {
	return `${slugOf(component)}/${kebabCaseOf(id)}.tsx`;
};
