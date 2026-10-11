// Turns a theme configuration into the resolved theme consumed by `UiProvider` and components.
import {
	auditContrast,
	createDesignTokens,
	createTokenStylesheet,
	cssLayers,
	defaultIntentSources,
	semanticIntents,
} from '#src/tokens/index.ts';
import type {
	ContrastResult,
	DesignTokens,
	IntentSource,
	IntentSources,
	SemanticIntent,
} from '#src/tokens/index.ts';
import { parseUiThemeConfig } from '#src/theme/theme-config.ts';
import type { PaletteConfig, UiThemeConfig } from '#src/theme/theme-config.ts';

/**
 * A resolved theme. Plain, frozen data without functions, so a Server Component can create it and pass it to
 * `UiProvider`, which is a Client Component.
 */
export interface UiTheme {
	/** The complete token set, with omitted values filled from the defaults and derived deterministically. */
	readonly tokens: Readonly<DesignTokens>;
	/** Contrast failures of the resolved palette. Always empty for the official palette. */
	readonly warnings: readonly string[];
}

export interface CreateUiThemeOptions {
	/** Receives each contrast warning. Defaults to `console.warn`; pass `() => {}` to silence it. */
	onWarning?: (message: string) => void;
}

const warnInConsole = (message: string): void => {
	console.warn(`[Midnight Indigo: UI] Theme contrast warning: ${message}`);
};

// An intent keeps its default `main` when the configuration omits it; any configured field wins.
const resolveIntentSources = (palette: PaletteConfig): IntentSources => {
	return Object.fromEntries(
		semanticIntents.map((intent: SemanticIntent): [SemanticIntent, IntentSource] => {
			return [intent, { ...defaultIntentSources[intent], ...palette[intent] }];
		}),
	) as IntentSources;
};

/**
 * Creates a theme from a typed or JSON-loaded configuration. Omitted intents and fields fall back to the
 * defaults. A malformed configuration throws `UiThemeConfigError`; a palette that misses the contrast minimums
 * is still created, and each failure is reported through `options.onWarning` and `theme.warnings`.
 */
export const createUiTheme = (
	config: UiThemeConfig = {},
	options: CreateUiThemeOptions = {},
): UiTheme => {
	const { palette = {} }: UiThemeConfig = parseUiThemeConfig(config);
	const tokens: Readonly<DesignTokens> = createDesignTokens(resolveIntentSources(palette));

	const warnings: string[] = auditContrast(tokens)
		.filter((result: ContrastResult): boolean => !result.passes)
		.map((result: ContrastResult): string => result.message);

	warnings.forEach(options.onWarning ?? warnInConsole);
	return Object.freeze({ tokens, warnings: Object.freeze(warnings) });
};

/** The official theme: what `UiProvider` uses when it receives no `theme`. */
export const defaultUiTheme: UiTheme = createUiTheme();

/**
 * Renders the theme as CSS custom properties inside the `midnight-indigo.theme` cascade layer. `UiProvider`
 * injects it automatically; call it to write the CSS yourself, e.g. into a static file at build time.
 */
export const createThemeStylesheet = (theme: UiTheme, selector: string = ':root'): string => {
	return createTokenStylesheet(theme.tokens, { selector, layer: cssLayers.theme });
};
