// The application theme, loaded from `theme.json`: edit the JSON to change the palette without touching code.
import { createUiTheme, parseUiThemeConfig } from '@midnight-indigo/ui/theme';
import type { UiTheme } from '@midnight-indigo/ui/theme';

import themeConfiguration from '#src/theme.json' with { type: 'json' };

// `parseUiThemeConfig` validates the JSON and fails the build with every invalid color or key it finds.
export const theme: UiTheme = createUiTheme(parseUiThemeConfig(themeConfiguration));
