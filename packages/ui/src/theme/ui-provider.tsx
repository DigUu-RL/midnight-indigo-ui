'use client';
// Provides the theme to components, injects its CSS custom properties and configures Material UI.
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { createContext, use, useMemo } from 'react';
import type { Context, ReactElement, ReactNode } from 'react';

import { createThemeStylesheet, defaultUiTheme } from '#src/theme/create-ui-theme.ts';
import type { UiTheme } from '#src/theme/create-ui-theme.ts';
import { toMuiTheme } from '#src/theme/mui-theme.ts';
import { usePrefersReducedMotion } from '#src/theme/use-prefers-reduced-motion.ts';

export interface UiProviderProps {
	/** Theme created by `createUiTheme`. Defaults to the official theme. */
	theme?: UiTheme;
	/**
	 * Applies the base document styles: dark canvas background, text color, body typography, monospace code and box
	 * sizing. Defaults to `true`.
	 */
	baseline?: boolean;
	children?: ReactNode;
}

const UiThemeContext: Context<UiTheme> = createContext<UiTheme>(defaultUiTheme);

// FNV-1a over UTF-16 code units: a short, stable identifier for the stylesheet content.
const hashText = (text: string): string => {
	const codeUnits: number[] = Array.from(
		{ length: text.length },
		(_: unknown, index: number): number => {
			return text.charCodeAt(index);
		},
	);

	const hash: number = codeUnits.reduce((accumulator: number, codeUnit: number): number => {
		return Math.imul(accumulator ^ codeUnit, 0x01000193);
	}, 0x811c9dc5);

	return (hash >>> 0).toString(36);
};

/**
 * The previous theme while the new one is equal to it. A theme created again at each render (`createUiTheme(config)`
 * written in the props of a component that renders again) would otherwise rebuild the Material UI theme and render
 * every styled component below once more: about twenty times the cost of the same render with the same object, for
 * 600 components. A theme is plain data (tokens and warnings), so its JSON is its identity.
 */
const useStableTheme = (theme: UiTheme): UiTheme => {
	const identity: string = useMemo((): string => JSON.stringify(theme), [theme]);
	return useMemo((): UiTheme => theme, [identity]);
};

/**
 * Root provider of Midnight Indigo: UI. The theme stylesheet is rendered as a React 19 hoistable `<style>`:
 * it lands in the `<head>` of the server HTML before any content (no unstyled flash), and React deduplicates it
 * by `href` across streamed chunks, nested providers and hydration. Material UI transitions follow the reduced motion
 * preference of the user.
 */
export const UiProvider = ({
	theme: givenTheme = defaultUiTheme,
	baseline = true,
	children,
}: UiProviderProps): ReactElement => {
	const theme: UiTheme = useStableTheme(givenTheme);
	const reducedMotion: boolean = usePrefersReducedMotion();
	const stylesheet: string = useMemo((): string => createThemeStylesheet(theme), [theme]);

	const muiTheme: Theme = useMemo(
		(): Theme => toMuiTheme(theme, { reducedMotion }),
		[theme, reducedMotion],
	);

	return (
		<UiThemeContext value={theme}>
			<style href={`midnight-indigo-theme-${hashText(stylesheet)}`} precedence='midnight-indigo'>
				{stylesheet}
			</style>

			<MuiThemeProvider theme={muiTheme}>
				{baseline ? <CssBaseline enableColorScheme /> : null}
				{children}
			</MuiThemeProvider>
		</UiThemeContext>
	);
};

/** The theme of the nearest `UiProvider`, or the official theme outside of one. */
export const useUiTheme = (): UiTheme => use(UiThemeContext);
