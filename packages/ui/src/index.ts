// Root entry of `@midnight-indigo/ui`.
// Do not re-export heavy subpaths (e.g. `charts`) from here; see the Arquitetura wiki page §3.
export { Icon, iconAccessibilityProps } from './icons/icon.tsx';
export type {
	IconAccessibility,
	IconAccessibilityAttributes,
	IconProps,
	IconSize,
} from './icons/icon.tsx';
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
} from './theme/index.ts';
export type {
	CreateUiThemeOptions,
	IntentConfig,
	PaletteConfig,
	ThemeConfigIssue,
	ThemeVariables,
	UiProviderProps,
	UiTheme,
	UiThemeConfig,
} from './theme/index.ts';
