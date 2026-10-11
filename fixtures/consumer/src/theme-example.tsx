// Typed usage of the theme API as an application writes it. Type-checked with NodeNext and Bundler resolution.
import {
	createUiTheme,
	parseUiThemeConfig,
	themeVariables,
	UiProvider,
	useUiTheme,
} from '@midnight-indigo/ui/theme';
import type { UiProviderProps, UiTheme, UiThemeConfig } from '@midnight-indigo/ui/theme';
import type { CSSProperties, ReactElement } from 'react';

const themeConfiguration: UiThemeConfig = {
	palette: {
		official: { main: '#FF6AC1' },
		success: { main: '#36C995', border: '#2FAF82' },
	},
};

export const typedTheme: UiTheme = createUiTheme(themeConfiguration, {
	onWarning: (): void => undefined,
});

// JSON has no color types: `parseUiThemeConfig` validates it at runtime and returns the typed configuration.
export const jsonTheme: UiTheme = createUiTheme(
	parseUiThemeConfig('{ "palette": { "info": { "main": "#65BDEB" } } }'),
);

const panelStyle: CSSProperties = {
	background: themeVariables.surface.raised,
	color: themeVariables.text.primary,
	borderColor: themeVariables.chart.series[0],
};

const OfficialColor = (): ReactElement => {
	const theme: UiTheme = useUiTheme();
	return <p style={panelStyle}>{theme.tokens.intent.official.main}</p>;
};

export const providerProps: UiProviderProps = { theme: typedTheme, baseline: false };

export const Application = (): ReactElement => {
	return (
		<UiProvider {...providerProps}>
			<OfficialColor />
		</UiProvider>
	);
};

// Never called: proves that the compiler rejects invalid configurations.
export const rejectedConfigurations = (): UiThemeConfig[] => {
	return [
		// @ts-expect-error Colors are hexadecimal strings.
		{ palette: { official: { main: 'pink' } } },
		// @ts-expect-error `primary` is not an intent: use `official`.
		{ palette: { primary: { main: '#FF6AC1' } } },
		// @ts-expect-error `mian` is not an intent field.
		{ palette: { info: { mian: '#65BDEB' } } },
	];
};
