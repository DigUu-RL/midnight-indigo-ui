// Public subpath `@midnight-indigo/ui/theme`.
export { createThemeStylesheet, createUiTheme, defaultUiTheme } from '@/src/theme/create-ui-theme';
export type { CreateUiThemeOptions, UiTheme } from '@/src/theme/create-ui-theme';
export { toMuiTheme } from '@/src/theme/mui-theme';
export type { MuiThemeOptions } from '@/src/theme/mui-theme';
export { createNativeBaselineStyles, nativeBaselineStyles } from '@/src/theme/native-baseline';
export {
	autofillStyles,
	forcedColorsMediaQuery,
	hiddenScrollbarStyles,
	scrollbarStyles,
} from '@/src/theme/native-styles';
export { parseUiThemeConfig, UiThemeConfigError } from '@/src/theme/theme-config';
export type {
	IntentConfig,
	PaletteConfig,
	ThemeConfigIssue,
	UiThemeConfig,
} from '@/src/theme/theme-config';
export { themeVariables } from '@/src/theme/theme-variables';
export type { ThemeVariables } from '@/src/theme/theme-variables';
export { UiProvider, useUiTheme } from '@/src/theme/ui-provider';
export { usePrefersReducedMotion } from '@/src/theme/use-prefers-reduced-motion';
export type { UiProviderProps } from '@/src/theme/ui-provider';
