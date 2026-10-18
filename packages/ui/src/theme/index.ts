// Public subpath `@midnight-indigo/ui/theme`.
export {
	createThemeStylesheet,
	createUiTheme,
	defaultUiTheme,
} from '#src/theme/create-ui-theme.ts';
export type { CreateUiThemeOptions, UiTheme } from '#src/theme/create-ui-theme.ts';
export { toMuiTheme } from '#src/theme/mui-theme.ts';
export type { MuiThemeOptions } from '#src/theme/mui-theme.ts';
export { createNativeBaselineStyles, nativeBaselineStyles } from '#src/theme/native-baseline.ts';
export {
	autofillStyles,
	forcedColorsMediaQuery,
	hiddenScrollbarStyles,
	scrollbarStyles,
} from '#src/theme/native-styles.ts';
export { parseUiThemeConfig, UiThemeConfigError } from '#src/theme/theme-config.ts';
export type {
	IntentConfig,
	PaletteConfig,
	ThemeConfigIssue,
	UiThemeConfig,
} from '#src/theme/theme-config.ts';
export { themeVariables } from '#src/theme/theme-variables.ts';
export type { ThemeVariables } from '#src/theme/theme-variables.ts';
export { UiProvider, useUiTheme } from '#src/theme/ui-provider.tsx';
export { usePrefersReducedMotion } from '#src/theme/use-prefers-reduced-motion.ts';
export type { UiProviderProps } from '#src/theme/ui-provider.tsx';
