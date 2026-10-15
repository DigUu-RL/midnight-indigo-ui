'use client';
// Navigation and layout: links that navigate through `next/link`, tabs, pagination, a sidebar that collapses to a rail
// (a drawer below 840 px) and a grid that gains columns as the viewport grows.
import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import { Icon } from '@midnight-indigo/ui';
import { Grid, Stack } from '@midnight-indigo/ui/layout';
import {
	Breadcrumbs,
	Link,
	Pagination,
	Sidebar,
	SidebarMenuButton,
	TabNavigation,
	Tabs,
} from '@midnight-indigo/ui/navigation';
import type { SidebarEntry } from '@midnight-indigo/ui/navigation';
import { useState } from 'react';
import type { ReactElement } from 'react';

const homeIcon: ReactElement = (
	<Icon decorative>
		<path d='M12 3 3 10.5V21h6v-6h6v6h6V10.5z' />
	</Icon>
);

const chartIcon: ReactElement = (
	<Icon decorative>
		<path d='M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z' />
	</Icon>
);

const plusIcon: ReactElement = (
	<Icon decorative>
		<path d='M11 5h2v14h-2zM5 11h14v2H5z' />
	</Icon>
);

const sidebarItems: SidebarEntry[] = [
	{ id: 'home', label: 'Home', icon: homeIcon, href: '/gallery', current: true },
	{
		id: 'reports',
		label: 'Reports',
		items: [
			{ id: 'sales', label: 'Sales', icon: chartIcon, href: '/gallery?report=sales' },
			{ id: 'costs', label: 'Costs', icon: chartIcon, href: '/gallery?report=costs' },
		],
	},
	{ id: 'new-report', label: 'New report', icon: plusIcon, onSelect: (): void => undefined },
];

const metrics: readonly string[] = ['Revenue', 'Orders', 'Customers', 'Refunds'];

export const NavigationShowcase = (): ReactElement => {
	const [page, setPage] = useState<number>(1);
	const [mobileOpen, setMobileOpen] = useState<boolean>(false);

	return (
		<Card as='section'>
			<CardHeader
				title='Navigation and layout'
				subtitle='Links through next/link, tabs, pagination, a collapsible sidebar and a responsive grid.'
				headingLevel={2}
			/>

			<CardContent>
				<Stack gap='6'>
					<Breadcrumbs
						maxItems={3}
						items={[
							{ id: 'home', label: 'Home', href: '/gallery' },
							{ id: 'projects', label: 'Projects', href: '/gallery?view=projects' },
							{ id: 'atlas', label: 'Atlas', href: '/gallery?project=atlas' },
							{ id: 'settings', label: 'Settings' },
						]}
					/>

					<TabNavigation
						label='Project sections'
						items={[
							{ id: 'overview', label: 'Overview', href: '/gallery', current: true },
							{ id: 'members', label: 'Members', href: '/gallery?section=members' },
							{ id: 'settings', label: 'Settings', href: '/gallery?section=settings' },
						]}
					/>

					<Tabs
						label='Report sections'
						items={[
							{ id: 'summary', label: 'Summary', content: <p>Revenue grew 12% this month.</p> },
							{ id: 'details', label: 'Details', content: <p>Three new teams joined.</p> },
						]}
					/>

					<Grid columns={{ compact: 1, medium: 2, large: 4 }} gap='3'>
						{metrics.map((metric: string): ReactElement => {
							return (
								<p key={metric} className='panel'>
									{metric}
								</p>
							);
						})}
					</Grid>

					<Pagination page={page} pageCount={12} onPageChange={setPage} />

					<p>
						Read the <Link href='/gallery?view=guide'>getting started guide</Link> or the{' '}
						<Link href='https://github.com/DigUu-RL/midnight-indigo-ui' external>
							source code
						</Link>
						.
					</p>

					<div className='sidebar-demo'>
						<SidebarMenuButton open={mobileOpen} onOpenChange={setMobileOpen} />

						<Sidebar
							label='Demo navigation'
							items={sidebarItems}
							mobileOpen={mobileOpen}
							onMobileOpenChange={setMobileOpen}
						/>
					</div>
				</Stack>
			</CardContent>
		</Card>
	);
};
