// Purpose of every token group, token and intent. Typed so that adding a token without documenting it fails.
import type {
	AccentTokens,
	BackdropTokens,
	BorderTokens,
	CardTokens,
	ChartTokens,
	ColorScaleStep,
	ColorTokens,
	ControlHeightTokens,
	DesignTokens,
	ElevationTokens,
	FocusTokens,
	FontFamilyTokens,
	FontWeightTokens,
	IconSizeTokens,
	LayerTokens,
	MidnightScaleStep,
	RadiusTokens,
	StateTokens,
	StrokeTokens,
	SurfaceTokens,
	TextTokens,
	TonalIconTokens,
	TypographyRole,
} from '#src/tokens/design-tokens.ts';
import type { IntentTokens, SemanticIntent } from '#src/tokens/intents.ts';
import type { SupportColor, SupportColorTokens } from '#src/tokens/support-colors.ts';

/** Steps of a scale with a fixed role; the other steps are tints and shades without one. */
export interface ColorStepDescriptions {
	pink: Partial<Record<ColorScaleStep, string>>;
	indigo: Partial<Record<ColorScaleStep, string>>;
	midnight: Partial<Record<MidnightScaleStep, string>>;
}

export interface TokenDescriptions {
	groups: Record<keyof DesignTokens, string>;
	color: Record<keyof ColorTokens, string>;
	colorSteps: ColorStepDescriptions;
	surface: Record<keyof SurfaceTokens, string>;
	text: Record<keyof TextTokens, string>;
	border: Record<keyof BorderTokens, string>;
	stroke: Record<keyof StrokeTokens, string>;
	focus: Record<keyof FocusTokens, string>;
	accent: Record<keyof AccentTokens, string>;
	state: Record<keyof StateTokens, string>;
	intents: Record<SemanticIntent, string>;
	intentFields: Record<keyof IntentTokens, string>;
	support: Record<SupportColor, string>;
	supportFields: Record<keyof SupportColorTokens, string>;
	chart: Record<keyof ChartTokens, string>;
	radius: Record<keyof RadiusTokens, string>;
	controlHeight: Record<keyof ControlHeightTokens, string>;
	card: Record<keyof CardTokens, string>;
	elevation: Record<keyof ElevationTokens, string>;
	layer: Record<keyof LayerTokens, string>;
	backdrop: Record<keyof BackdropTokens, string>;
	fontFamily: Record<keyof FontFamilyTokens, string>;
	fontWeight: Record<keyof FontWeightTokens, string>;
	typography: Record<TypographyRole, string>;
	iconSize: Record<keyof IconSizeTokens, string>;
	tonalIcon: Record<keyof TonalIconTokens, string>;
}

export const tokenDescriptions: Readonly<TokenDescriptions> = {
	groups: {
		color:
			'Fixed color scales of the project identity, from the lightest step to the darkest. A theme palette does not change them; prefer the semantic groups in components.',
		surface:
			'Background layers, from the darkest to the lightest; each one is lighter than the layer below it.',
		text: 'Text colors by emphasis.',
		border: 'Boundaries and dividers.',
		stroke: 'Complete border lines, as values of the CSS `border` shorthand.',
		focus:
			'Focus-visible indicator, drawn as an offset outline so it never relies on color change alone.',
		accent: 'Brand accents applied outside components: links and text selection.',
		state:
			'Interaction states of neutral items (list rows, menu items, table rows) and disabled controls.',
		intent:
			'Semantic intents. Every intent has the same fields, so any component accepts any intent.',
		support:
			'Support colors harmonized with the pink and the indigo, for categories, tags, avatars and charts. They carry no meaning: status is the job of the intents.',
		chart: 'Chart marks and chrome.',
		radius:
			'Corner radius by role: the radius depends on the kind of element, never on the component that draws it.',
		spacing: 'Single spacing scale, in steps of 0.25rem.',
		controlHeight:
			'Heights of buttons, fields and other controls, so controls of the same size align side by side.',
		card: 'Inner spacing of cards and panels, and the gap between the cards of a grid.',
		elevation:
			'Shadows calibrated for the dark canvas; pair them with a lighter surface and a border. `official` and `brand` are colored by the `main` of their intent.',
		layer:
			'Stacking order (`z-index`) of the layers above the page. Overlays take them already; use them for your own layers.',
		backdrop: 'Scrim behind modal overlays, which keeps the page visible but out of reach.',
		motion:
			'Durations and easing curves. Durations become 0ms under `prefers-reduced-motion: reduce`.',
		fontFamily:
			'Font stacks. Geist Sans and Geist Mono are self-hosted by the application; the system fonts after them are the fallback.',
		fontWeight: 'Font weights used by the typographic roles.',
		typography:
			'Typographic roles. Sizes are in rem, so they follow the browser text size and zoom; line heights are unitless.',
		iconSize:
			'Fixed icon sizes. Icons inline with text use `1em` instead, to follow the text size.',
		tonalIcon:
			'Sides of a tonal icon: a glyph centered on a square tinted with the soft color of an intent or a support color.',
	},
	color: {
		pink: 'Brand pink, built around the official pink `#FF6AC1`.',
		indigo: 'Identity indigo, for solid fills, active borders, text and icons.',
		midnight: 'Neutral with an indigo hue, the source of every surface, border and state value.',
	},
	colorSteps: {
		pink: {
			'300': 'Hover of the official pink.',
			'400': 'Official pink, identical to `intent.official.main` of the official theme.',
		},
		indigo: {
			'300': 'Indigo text and icons.',
			'400': 'Hover of the solid indigo and active border.',
			'500': 'Solid indigo, identical to `intent.brand.main` of the official theme.',
		},
		// The roles of the midnight steps are the semantic surface, border and state tokens.
		midnight: {},
	},
	surface: {
		canvas: 'Main application background.',
		field: 'Background of inputs and choice controls, and of recessed areas such as code blocks.',
		sidebar: 'Sidebar, top bar and other navigation structure.',
		tableHeader: 'Header row of tables, recessed below the raised body.',
		raised: 'Cards, panels and tables.',
		dialog: 'Dialogs and drawers.',
		overlay: 'Menus, popovers, tooltips and toasts, the lightest layer.',
	},
	text: {
		primary: 'Body text and headings.',
		secondary: 'Supporting text and descriptions.',
		muted: 'Placeholders, hints and captions; still meets 4.5:1.',
		disabled:
			'Text of disabled controls; exempt from contrast minimums, never used to signal loading.',
		inverse: 'Text on light fills.',
	},
	border: {
		subtle: 'Dividers and decorative separation.',
		default: 'Default indigo border of containers.',
		strong:
			'Emphasized decorative borders, such as hovered tiles and dashed empty areas; below 3:1.',
		control: 'Boundary of inputs and interactive controls; meets 3:1 on every surface.',
	},
	stroke: {
		dashed: 'Dashed `border.strong` line of empty states and drop zones.',
	},
	focus: {
		ring: 'Focus indicator color, the official pink; meets 3:1 on every surface.',
		width: 'Focus indicator thickness.',
		offset: 'Gap between the control and the focus indicator.',
	},
	accent: {
		link: 'Link text.',
		linkHover: 'Hovered link text.',
		selection: 'Background of selected text, derived from `brand`.',
		onSelection: 'Selected text.',
	},
	state: {
		hover: 'Background of a hovered neutral item.',
		pressed: 'Background of a pressed neutral item.',
		selected: 'Background of a selected neutral item; pair it with a non-color indicator.',
		disabledSurface: 'Background of a disabled control.',
		disabledText: 'Text of a disabled control.',
		disabledBorder: 'Border of a disabled control.',
	},
	intents: {
		official:
			'Main action and focus, at most one solid per screen. `main` is the exact Midnight Indigo keyword pink.',
		brand:
			'Indigo for selection, the active item and navigation: checked controls, current page, active tab.',
		default: 'Neutral gray for secondary actions and neutral status.',
		success: 'Confirmation and completed operations.',
		warning: 'Attention required; pair with an icon or label, never hue alone.',
		error: 'Failure and destructive actions; pair with an icon or label, never hue alone.',
		info: 'Neutral information and guidance.',
	},
	intentFields: {
		main: 'Solid fill of filled controls and the reference color of the intent.',
		light: 'Lighter tone for accents and highlights.',
		dark: 'Darker tone for accents and shading.',
		contrastText: 'Text and icons on `main`, `hover` and `pressed` fills.',
		container: 'Soft background of alerts, chips and badges.',
		onContainer: 'Text and icons on `container`, `containerHover` and `containerPressed`.',
		border: 'Boundary of outlined controls; meets 3:1 on every surface.',
		text: 'Intent-colored text on surfaces, such as ghost and outline labels; meets 4.5:1 on every surface.',
		hover: 'Fill of a hovered filled control.',
		pressed: 'Fill of a pressed filled control.',
		containerHover: 'Soft background when hovered.',
		containerPressed: 'Soft background when pressed or selected.',
	},
	support: {
		pink: 'The official pink.',
		violet: 'The indigo text color (`color.indigo.300`).',
		blue: 'Same hue as the `info` intent.',
		green: 'Same hue as the `success` intent.',
		amber: 'Same hue as the `warning` intent.',
		red: 'Same hue as the `error` intent.',
		turquoise: 'Turquoise.',
		orange: 'Orange.',
	},
	supportFields: {
		main: 'The color itself: icons, dots and chart marks; meets 3:1 on its `soft` background.',
		soft: 'Tonal background: `main` at 16% over the surface below it (`soft()` takes 14–18%).',
		text: 'Text on `soft`; equals `main` unless `main` is below 4.5:1 on it. Meets 4.5:1 on every surface.',
	},
	chart: {
		series: 'Categorical series colors, in assignment order.',
		grid: 'Grid lines.',
		axis: 'Axis lines and ticks.',
		label: 'Axis labels and legends.',
		tooltipSurface: 'Tooltip background.',
	},
	radius: {
		none: 'Square corners.',
		checkbox: 'Checkboxes.',
		controlSmall:
			'Small controls and the items inside other surfaces: menu items, options, tabs, tooltips and inline code.',
		control: 'Buttons, fields, navigation items and other medium and large controls.',
		overlay: 'Menus, popovers, listboxes and toasts.',
		card: 'Cards, panels, tables and alerts.',
		dialog: 'Dialogs.',
		pill: 'Fully rounded chips, badges, avatars, switches and tracks.',
	},
	controlHeight: {
		small: 'Small buttons, fields and other controls (`size="small"`).',
		medium: 'Default height of buttons and other controls (`size="medium"`).',
		large: 'Large buttons, fields and other controls (`size="large"`).',
		field: 'Text fields, selects and comboboxes of medium size.',
	},
	card: {
		paddingBlock: 'Top and bottom padding of a card.',
		paddingInline: 'Side padding of a card.',
		gap: 'Space between the sections of a card: header, content and footer.',
		gridGap: 'Space between the cards of a grid, such as the key figures of a dashboard.',
	},
	elevation: {
		none: 'Flat, on the canvas.',
		card: 'Elevated cards and panels.',
		overlay: 'Menus, popovers, tooltips and chart tooltips.',
		dialog: 'Dialogs, drawers and toasts.',
		official: 'Pink glow of the main action (filled `official` button).',
		brand: 'Indigo glow of a filled `brand` control.',
	},
	layer: {
		base: 'Content of the page.',
		sticky: 'Sticky headers and toolbars, above the content they scroll over.',
		drawer: 'Drawers.',
		dialog: 'Dialogs and confirmation dialogs.',
		popover: 'Popovers and menus, also when opened inside a dialog or a drawer.',
		toast: 'Toast notifications, above every overlay so they are never hidden.',
		tooltip: 'Tooltips, the highest layer.',
	},
	backdrop: {
		scrim: 'Translucent canvas behind dialogs and drawers.',
		blur: 'Blur radius of the page behind the scrim (`backdrop-filter: blur()`).',
	},
	fontFamily: {
		sans: 'Interface text: every role except `code`.',
		mono: 'Code, and always numbers, identifiers and amounts, with tabular digits.',
	},
	fontWeight: {
		regular: 'Body text and captions.',
		medium: 'Labels of controls, tabs and menu items, and code.',
		semibold: 'Small headings and the overline.',
		bold: 'Display text and the large and medium headings.',
	},
	typography: {
		display: 'Key figures and hero titles; at most one per view.',
		headingLarge: 'Page title (`h1`).',
		headingMedium: 'Section title (`h2`).',
		headingSmall: 'Card, panel and dialog title (`h3`).',
		body: 'Default text of the document, paragraphs and form fields.',
		bodySmall: 'Dense text: table cells, secondary list text and helper text.',
		label: 'Buttons, form labels, tabs and menu items.',
		caption: 'Timestamps, footnotes and annotations; never the only place of essential content.',
		overline:
			'Uppercase eyebrow above a title and labels of navigation groups; a few words at most.',
		code: 'Inline code, identifiers and monospace values.',
	},
	iconSize: {
		small: 'Dense controls and inline status icons.',
		medium: 'Default size inside buttons, inputs and menu items.',
		large: 'Standalone icons, empty states and icon-only toolbars.',
	},
	tonalIcon: {
		kpi: 'Key figure (KPI) cards.',
		list: 'Leading icon of list rows.',
		alert: 'Alerts and inline messages.',
	},
};
