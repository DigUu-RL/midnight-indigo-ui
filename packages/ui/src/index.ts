// Root entry of `@midnight-indigo/ui`.
// Do not re-export heavy subpaths (e.g. `charts`) from here; see the Arquitetura wiki page §3.
export * from '@/src/buttons/index';
export * from '@/src/data-display/index';
export * from '@/src/feedback/index';
export * from '@/src/layout/index';
export * from '@/src/navigation/index';
export { Icon, iconAccessibilityProps } from '@/src/icons/icon/index';
export type {
	IconAccessibility,
	IconAccessibilityAttributes,
	IconProps,
	IconSize,
} from '@/src/icons/icon/index';
export {
	createThemeStylesheet,
	createUiTheme,
	defaultUiTheme,
	parseUiThemeConfig,
	scrollbarStyles,
	themeVariables,
	UiProvider,
	UiThemeConfigError,
	usePrefersReducedMotion,
	useUiTheme,
} from '@/src/theme/index';
export type {
	CreateUiThemeOptions,
	IntentConfig,
	PaletteConfig,
	ThemeConfigIssue,
	ThemeVariables,
	UiProviderProps,
	UiTheme,
	UiThemeConfig,
} from '@/src/theme/index';
