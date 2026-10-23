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

import type { LocaleSegment } from '@/src/i18n/locales';
import { publicPathOf } from '@/src/explorer/routes';
import { brandIcon, destinations, galleryIcon, notificationsIcon } from '@/src/shell/destinations';
import type { Destination } from '@/src/shell/destinations';
import { LocaleSwitcher } from '@/src/shell/locale-switcher';

interface AppShellProps {
	locale: LocaleSegment;
	children: ReactNode;
}

export const AppShell = ({ locale, children }: AppShellProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const pathname: string = publicPathOf(usePathname());
	const home: string = `/${locale}`;

	// A destination with pages below it stays current on them, e.g. the explorer on the page of a component.
	const current: Destination | undefined = destinations.find(
		(destination: Destination): boolean => {
			const path: string = `${home}${destination.path}`;

			const isParent: boolean =
				destination.childLabel !== undefined && pathname.startsWith(`${path}/`);

			return pathname === path || isParent;
		},
	);

	const destinationPath: string = `${home}${current?.path ?? ''}`;

	const childLabel: string | undefined =
		current === undefined || pathname === destinationPath
			? undefined
			: current.childLabel?.(pathname.slice(destinationPath.length + 1).split('/')[0] ?? '');

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
							{
								id: current.name,
								label: t(`shell.navigation.${current.name}`),
								...(childLabel === undefined ? {} : { href: destinationPath }),
							},
							...(childLabel === undefined ? [] : [{ id: 'child', label: childLabel }]),
						]}
					/>
				)
			}
		>
			{children}
		</DashboardLayout>
	);
};
