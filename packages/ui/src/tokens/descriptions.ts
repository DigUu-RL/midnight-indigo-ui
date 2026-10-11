// Purpose of every token group, token and intent. Typed so that adding a token without documenting it fails.
import type {
	AccentTokens,
	BorderTokens,
	ChartTokens,
	DesignTokens,
	ElevationTokens,
	FocusTokens,
	FontFamilyTokens,
	FontWeightTokens,
	IconSizeTokens,
	RadiusTokens,
	StateTokens,
	SurfaceTokens,
	TextTokens,
	TypographyRole,
} from '#src/tokens/design-tokens.ts';
import type { IntentTokens, SemanticIntent } from '#src/tokens/intents.ts';

export interface TokenDescriptions {
	groups: Record<keyof DesignTokens, string>;
	surface: Record<keyof SurfaceTokens, string>;
	text: Record<keyof TextTokens, string>;
	border: Record<keyof BorderTokens, string>;
	focus: Record<keyof FocusTokens, string>;
	accent: Record<keyof AccentTokens, string>;
	state: Record<keyof StateTokens, string>;
	intents: Record<SemanticIntent, string>;
	intentFields: Record<keyof IntentTokens, string>;
	chart: Record<keyof ChartTokens, string>;
	radius: Record<keyof RadiusTokens, string>;
	elevation: Record<keyof ElevationTokens, string>;
	fontFamily: Record<keyof FontFamilyTokens, string>;
	fontWeight: Record<keyof FontWeightTokens, string>;
	typography: Record<TypographyRole, string>;
	iconSize: Record<keyof IconSizeTokens, string>;
}

export const tokenDescriptions: Readonly<TokenDescriptions> = {
	groups: {
		surface: 'Background layers, from the deepest to the most elevated.',
		text: 'Text colors by emphasis.',
		border: 'Boundaries and dividers.',
		focus:
			'Focus-visible indicator, drawn as an offset outline so it never relies on color change alone.',
		accent: 'Brand accents applied outside components: links and text selection.',
		state:
			'Interaction states of neutral items (list rows, menu items, table rows) and disabled controls.',
		intent:
			'Semantic intents. Every intent has the same fields, so any component accepts any intent.',
		chart: 'Chart marks and chrome.',
		radius: 'Corner radius scale; components pick a step instead of sharing a single radius.',
		spacing: 'Single spacing scale, in steps of 0.25rem.',
		elevation:
			'Shadows calibrated for the dark canvas; pair them with a lighter surface and a border.',
		motion:
			'Durations and easing curves. Durations become 0ms under `prefers-reduced-motion: reduce`.',
		fontFamily:
			'Font stacks. Inter is self-hosted by the application; the system fonts after it are the fallback.',
		fontWeight: 'Font weights used by the typographic roles.',
		typography:
			'Typographic roles. Sizes are in rem, so they follow the browser text size and zoom; line heights are unitless.',
		iconSize:
			'Fixed icon sizes. Icons inline with text use `1em` instead, to follow the text size.',
	},
	surface: {
		canvas: 'Main application background.',
		sunken: 'Areas recessed below the canvas, such as wells and code blocks.',
		base: 'Navigation and base structural surfaces.',
		raised: 'Cards and elevated controls.',
		overlay: 'Menus, popovers, tooltips and dialogs.',
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
		strong: 'Boundary of inputs and interactive controls; meets 3:1 on every surface.',
	},
	focus: {
		ring: 'Focus indicator color; meets 3:1 on every surface.',
		width: 'Focus indicator thickness.',
		offset: 'Gap between the control and the focus indicator.',
	},
	accent: {
		link: 'Link text.',
		linkHover: 'Hovered link text.',
		selection: 'Background of selected text.',
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
			'Brand, primary action and highlight. `main` is the exact Midnight Indigo keyword pink.',
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
	chart: {
		series: 'Categorical series colors, in assignment order.',
		grid: 'Grid lines.',
		axis: 'Axis lines and ticks.',
		label: 'Axis labels and legends.',
		tooltipSurface: 'Tooltip background.',
	},
	radius: {
		none: 'Square corners.',
		small: 'Small controls, checkboxes and tags.',
		medium: 'Buttons and inputs.',
		large: 'Cards and panels.',
		extraLarge: 'Dialogs and large surfaces.',
		pill: 'Fully rounded chips and pills.',
	},
	elevation: {
		none: 'Flat, on the canvas.',
		low: 'Raised cards and controls.',
		medium: 'Menus and popovers.',
		high: 'Dialogs.',
	},
	fontFamily: {
		sans: 'Interface text: every role except `code`.',
		mono: 'Code, identifiers and values that must align character by character.',
	},
	fontWeight: {
		regular: 'Body text, captions and code.',
		medium: 'Labels of controls, tabs and menu items.',
		semibold: 'Headings.',
		bold: 'Display text.',
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
		code: 'Inline code, identifiers and monospace values.',
	},
	iconSize: {
		small: 'Dense controls and inline status icons.',
		medium: 'Default size inside buttons, inputs and menu items.',
		large: 'Standalone icons, empty states and icon-only toolbars.',
	},
};
