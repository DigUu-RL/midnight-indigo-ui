'use client';
// Client Component reading the theme from `UiProvider`. The Material UI button is the explicit escape hatch:
// it follows the same palette because `UiProvider` configures Material UI from the theme.
import { useUiTheme } from '@midnight-indigo/ui/theme';
import type { UiTheme } from '@midnight-indigo/ui/theme';
import Button from '@mui/material/Button';
import type { ReactElement } from 'react';

export const ThemeSummary = (): ReactElement => {
	const theme: UiTheme = useUiTheme();

	return (
		<section className='panel'>
			<p>
				Official color: <code>{theme.tokens.intent.official.main}</code>
			</p>

			<Button variant='contained'>Material UI button</Button>
		</section>
	);
};
