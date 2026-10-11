// Public subpath `@midnight-indigo/ui/theme`.
export { createThemeStylesheet, createUiTheme, defaultUiTheme } from './create-ui-theme.ts';
export type { CreateUiThemeOptions, UiTheme } from './create-ui-theme.ts';
export { toMuiTheme } from './mui-theme.ts';
export type { MuiThemeOptions } from './mui-theme.ts';
export { parseUiThemeConfig, UiThemeConfigError } from './theme-config.ts';
export type {
	IntentConfig,
	PaletteConfig,
	ThemeConfigIssue,
	UiThemeConfig,
} from './theme-config.ts';
export { themeVariables } from './theme-variables.ts';
export type { ThemeVariables } from './theme-variables.ts';
export { UiProvider, useUiTheme } from './ui-provider.tsx';
export { usePrefersReducedMotion } from './use-prefers-reduced-motion.ts';
export type { UiProviderProps } from './ui-provider.tsx';
