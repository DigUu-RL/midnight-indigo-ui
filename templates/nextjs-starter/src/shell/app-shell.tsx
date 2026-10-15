'use client';
// The shell of every page of the application: the sidebar with its pages, the top bar with the language and the
// notifications, and the breadcrumbs. The current page comes from the route, so a page only renders its own content.
import { IconButton } from '@midnight-indigo/ui/buttons';
import { DashboardLayout } from '@midnight-indigo/ui/dashboard';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { Breadcrumbs } from '@midnight-indigo/ui/navigation';
import type { SidebarEntry } from '@midnight-indigo/ui/navigation';
import { usePathname } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';

import type { LocaleSegment } from '#src/i18n/locales.ts';
import {
	brandIcon,
	destinations,
	galleryIcon,
	notificationsIcon,
} from '#src/shell/destinations.tsx';
import type { Destination } from '#src/shell/destinations.tsx';
import { LocaleSwitcher } from '#src/shell/locale-switcher.tsx';

interface AppShellProps {
	locale: LocaleSegment;
	children: ReactNode;
}

export const AppShell = ({ locale, children }: AppShellProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const pathname: string = usePathname();
	const home: string = `/${locale}`;

	const current: Destination | undefined = destinations.find(
		(destination: Destination): boolean => {
			return pathname === `${home}${destination.path}`;
		},
	);

	const navigation: SidebarEntry[] = [
		...destinations.map((destination: Destination): SidebarEntry => {
			return {
				id: destination.name,
				label: t(`shell.navigation.${destination.name}`),
				icon: destination.icon,
				href: `${home}${destination.path}`,
				current: destination === current,
			};
		}),
		{
			id: 'gallery',
			label: t('shell.navigation.gallery'),
			icon: galleryIcon,
			href: '/gallery',
		},
	];

	return (
		<DashboardLayout
			navigation={{ label: t('shell.navigation.label'), items: navigation }}
			brand={
				<span className='brand'>
					<span className='brand-content'>
						{brandIcon}
						<span className='brand-name'>{t('app.name')}</span>
					</span>
				</span>
			}
			topbar={
				<div className='topbar'>
					<LocaleSwitcher locale={locale} />
					<IconButton label={t('shell.notifications')}>{notificationsIcon}</IconButton>
				</div>
			}
			breadcrumbs={
				current === undefined || current.path === '' ? undefined : (
					<Breadcrumbs
						items={[
							{ id: 'home', label: t('shell.navigation.overview'), href: home },
							{ id: current.name, label: t(`shell.navigation.${current.name}`) },
						]}
					/>
				)
			}
		>
			{children}
		</DashboardLayout>
	);
};
