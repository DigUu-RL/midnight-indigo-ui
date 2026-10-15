// The pages of the application, in the order of the navigation. Each one is a route under `app/[locale]`; add a page
// here and in `messages/*.json` (`shell.navigation`) to list it in the sidebar.
import { Icon } from '@midnight-indigo/ui';
import type { ReactElement } from 'react';

export type DestinationName = 'overview' | 'orders' | 'reports' | 'newCustomer' | 'appearance';

export interface Destination {
	name: DestinationName;
	/** Path after the locale; `''` is the home page. */
	path: string;
	icon: ReactElement;
}

const icon = (path: string): ReactElement => {
	return (
		<Icon decorative>
			<path d={path} />
		</Icon>
	);
};

export const destinations: readonly Destination[] = [
	{ name: 'overview', path: '', icon: icon('M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z') },
	{
		name: 'orders',
		path: '/orders',
		icon: icon('M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zm3 5v2h8V8zm0 4v2h8v-2z'),
	},
	{
		name: 'reports',
		path: '/reports',
		icon: icon('M12 2a10 10 0 1 0 10 10H12zm2 0v8h8a10 10 0 0 0-8-8'),
	},
	{
		name: 'newCustomer',
		path: '/customers/new',
		icon: icon(
			'M9 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8m-7 16c0-3.3 3.1-6 7-6s7 2.7 7 6zm16-12h2v3h3v2h-3v3h-2v-3h-3v-2h3z',
		),
	},
	{
		name: 'appearance',
		path: '/settings/appearance',
		icon: icon(
			'M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0 0 22 10.9C22 6 17.5 2 12 2M6.5 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3',
		),
	},
];

export const galleryIcon: ReactElement = icon('M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z');

export const notificationsIcon: ReactElement = icon(
	'M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 0 0-5-5.9V4h-2v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1z',
);

export const brandIcon: ReactElement = icon(
	'M12 2 3 7v10l9 5 9-5V7zm0 3.2 5.6 3.1L12 11.4 6.4 8.3z',
);
