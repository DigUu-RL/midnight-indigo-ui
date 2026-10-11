// Root entry of `@midnight-indigo/ui`.
// Do not re-export heavy subpaths (e.g. `charts`) from here; see the Arquitetura wiki page §3.
export * from '#src/buttons/index.ts';
export * from '#src/data-display/index.ts';
export * from '#src/feedback/index.ts';
export { Icon, iconAccessibilityProps } from '#src/icons/icon.tsx';
export type {
	IconAccessibility,
	IconAccessibilityAttributes,
	IconProps,
	IconSize,
} from '#src/icons/icon.tsx';
export {
	createThemeStylesheet,
	createUiTheme,
	defaultUiTheme,
	parseUiThemeConfig,
	themeVariables,
	UiProvider,
	UiThemeConfigError,
	usePrefersReducedMotion,
	useUiTheme,
} from '#src/theme/index.ts';
export type {
	CreateUiThemeOptions,
	IntentConfig,
	PaletteConfig,
	ThemeConfigIssue,
	ThemeVariables,
	UiProviderProps,
	UiTheme,
	UiThemeConfig,
} from '#src/theme/index.ts';
