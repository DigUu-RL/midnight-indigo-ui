'use client';
// The dashboard demo: the shell and the page patterns of `@midnight-indigo/ui/dashboard` over a mock API. Every text
// comes from the messages of the application, every link from its routes, and the data from `fetchDashboard`; the
// scenario in the URL makes the fake backend load forever, answer with nothing or fail.
import { Icon } from '@midnight-indigo/ui';
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import { Chart, createAreaChart } from '@midnight-indigo/ui/charts';
import type { AreaChartDefinition, ChartSeries } from '@midnight-indigo/ui/charts';
import {
	DashboardLayout,
	DashboardPanel,
	FilterBar,
	KpiGrid,
	PageHeader,
} from '@midnight-indigo/ui/dashboard';
import type { KpiItem } from '@midnight-indigo/ui/dashboard';
import { DataTable, EmptyState, ErrorState } from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, SortValue, StatChange } from '@midnight-indigo/ui/data-display';
import { SearchField, Select } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { Breadcrumbs } from '@midnight-indigo/ui/navigation';
import type { SidebarEntry, SidebarItem } from '@midnight-indigo/ui/navigation';
import { useMemo, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import type { MonthlyRevenue, Order, Region } from '#src/dashboard/demo-data.ts';
import { regions } from '#src/dashboard/demo-data.ts';
import type {
	DashboardQuery,
	DashboardSnapshot,
	DemoScenario,
	PeriodFilter,
	RegionFilter,
} from '#src/dashboard/mock-api.ts';
import { useDashboardSnapshot } from '#src/dashboard/use-dashboard-snapshot.ts';
import type { DashboardRequest } from '#src/dashboard/use-dashboard-snapshot.ts';

interface DashboardDemoProps {
	scenario: DemoScenario;
}

/** A month of revenue with its label in the locale, the category of the chart. */
interface RevenuePoint extends MonthlyRevenue {
	label: string;
}

const periods: readonly PeriodFilter[] = ['3', '6', '9'];

const defaultQuery: DashboardQuery = { region: 'all', period: '6' };

const scenarioPaths: Readonly<Record<Exclude<DemoScenario, 'live'>, string>> = {
	loading: '/dashboard?state=loading',
	empty: '/dashboard?state=empty',
	error: '/dashboard?state=error',
};

const icon = (path: string): ReactElement => {
	return (
		<Icon decorative>
			<path d={path} />
		</Icon>
	);
};

type IconName =
	'overview' | 'loading' | 'empty' | 'error' | 'components' | 'notifications' | 'brand';

const icons: Readonly<Record<IconName, ReactElement>> = {
	overview: icon('M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z'),
	loading: icon('M11 2h2v5h-2zm0 15h2v5h-2zM2 11h5v2H2zm15 0h5v2h-5z'),
	empty: icon('M4 13h4l2 3h4l2-3h4v6H4zM6 5h12l2 6H4z'),
	error: icon('M11 7h2v7h-2zm0 9h2v2h-2zM12 2 1 21h22z'),
	components: icon('M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z'),
	notifications: icon(
		'M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 0 0-5-5.9V4h-2v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1z',
	),
	brand: icon('M12 2 3 7v10l9 5 9-5V7zm0 3.2 5.6 3.1L12 11.4 6.4 8.3z'),
};

/** Scenarios other than the live data, each a link to the same page with its `state`. */
const failureScenarios: readonly Exclude<DemoScenario, 'live'>[] = ['loading', 'empty', 'error'];

const changeOf = (ratio: number, formatPercent: (value: number) => string): StatChange => {
	return {
		value: formatPercent(Math.abs(ratio)),
		trend: Math.abs(ratio) < 0.0005 ? 'flat' : ratio > 0 ? 'up' : 'down',
	};
};

const navigationOf = (translate: I18nValue['t'], scenario: DemoScenario): SidebarEntry[] => {
	return [
		{
			id: 'overview',
			label: translate('dashboard.navigation.overview'),
			icon: icons.overview,
			href: '/dashboard',
			current: scenario === 'live',
		},
		{
			id: 'scenarios',
			label: translate('dashboard.navigation.scenarios'),
			items: failureScenarios.map((item: Exclude<DemoScenario, 'live'>): SidebarItem => {
				return {
					id: item,
					label: translate(`dashboard.navigation.${item}`),
					icon: icons[item],
					href: scenarioPaths[item],
					current: scenario === item,
				};
			}),
		},
		{
			id: 'components',
			label: translate('dashboard.navigation.components'),
			icon: icons.components,
			href: '/',
		},
	];
};

export const DashboardDemo = ({ scenario }: DashboardDemoProps): ReactElement => {
	const { t, locale, formatCurrency, formatNumber, formatDate }: I18nValue = useI18n();
	const [query, setQuery] = useState<DashboardQuery>(defaultQuery);
	const [search, setSearch] = useState<string>('');
	const { status, snapshot, retry }: DashboardRequest = useDashboardSnapshot(query, scenario);
	const ready: DashboardSnapshot | undefined = status === 'ready' ? snapshot : undefined;

	const formatPercent = (value: number): string => {
		return formatNumber(value, { style: 'percent', maximumFractionDigits: 1 });
	};

	const kpis: KpiItem[] = [
		{
			id: 'revenue',
			label: t('dashboard.kpis.revenue'),
			// Compact, so that millions fit a quarter of the row: `R$4.33M`.
			value: formatCurrency(ready?.revenue ?? 0, {
				notation: 'compact',
				maximumFractionDigits: 2,
			}),
			...(ready?.revenueChange === undefined
				? {}
				: {
						change: changeOf(ready.revenueChange, formatPercent),
						description: t('dashboard.kpis.monthOverMonth'),
					}),
		},
		{
			id: 'orders',
			label: t('dashboard.kpis.orders'),
			value: formatNumber(ready?.orderCount ?? 0),
			description: t('dashboard.kpis.inPeriod'),
		},
		{
			id: 'average-ticket',
			label: t('dashboard.kpis.averageTicket'),
			value: formatCurrency(ready?.averageTicket ?? 0),
		},
		{
			id: 'refund-rate',
			label: t('dashboard.kpis.refundRate'),
			value: formatPercent(ready?.refundRate ?? 0),
		},
	];

	const revenueChart: AreaChartDefinition<RevenuePoint> =
		useMemo((): AreaChartDefinition<RevenuePoint> => {
			const included: readonly Region[] = ready?.regions ?? regions;

			return createAreaChart({
				data: (ready?.monthly ?? []).map((month: MonthlyRevenue): RevenuePoint => {
					return {
						...month,
						label: formatDate(Date.parse(month.month), { month: 'short', timeZone: 'UTC' }),
					};
				}),
				x: 'label',
				categoryLabel: t('dashboard.revenue.category'),
				stacked: true,
				series: included.map((region: Region): ChartSeries<RevenuePoint> => {
					return {
						key: region,
						label: t(`dashboard.regions.${region}`),
						formatValue: (value: number): string => {
							return formatCurrency(value, { maximumFractionDigits: 0 });
						},
					};
				}),
			});
		}, [ready, t, formatDate, formatCurrency]);

	// Rebuilt only with the locale: the table indexes the searchable text once per list of columns and rows.
	const columns: DataTableColumn<Order>[] = useMemo((): DataTableColumn<Order>[] => {
		return [
			{
				id: 'id',
				header: t('dashboard.orders.order'),
				rowHeader: true,
				cell: (order: Order): string => order.id,
				sortValue: (order: Order): SortValue => order.id,
				filterValue: (order: Order): string => order.id,
			},
			{
				id: 'customer',
				header: t('dashboard.orders.customer'),
				cell: (order: Order): string => order.customer,
				sortValue: (order: Order): SortValue => order.customer,
				filterValue: (order: Order): string => order.customer,
			},
			{
				id: 'store',
				header: t('dashboard.orders.store'),
				cell: (order: Order): string => order.store,
				filterValue: (order: Order): string => order.store,
			},
			{
				id: 'date',
				header: t('dashboard.orders.date'),
				cell: (order: Order): string => {
					return formatDate(Date.parse(order.placedAt), { dateStyle: 'medium' });
				},
				sortValue: (order: Order): SortValue => order.placedAt,
			},
			{
				id: 'status',
				header: t('dashboard.orders.status'),
				cell: (order: Order): string => t(`dashboard.orders.statuses.${order.status}`),
			},
			{
				id: 'total',
				header: t('dashboard.orders.total'),
				align: 'end',
				cell: (order: Order): string => formatCurrency(order.total),
				sortValue: (order: Order): SortValue => order.total,
			},
		];
	}, [t, formatDate, formatCurrency]);

	const changeQuery = (change: Partial<DashboardQuery>): void => {
		setQuery((current: DashboardQuery): DashboardQuery => ({ ...current, ...change }));
	};

	return (
		<DashboardLayout
			navigation={{ label: t('dashboard.navigation.label'), items: navigationOf(t, scenario) }}
			brand={
				<span className='brand'>
					<span className='brand-content'>
						{icons.brand}
						<span className='brand-name'>Aurora Retail</span>
					</span>
				</span>
			}
			topbar={
				<IconButton label={t('dashboard.topbar.notifications')}>{icons.notifications}</IconButton>
			}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ id: 'home', label: t('dashboard.breadcrumbs.home'), href: '/' },
						{ id: 'dashboard', label: t('dashboard.breadcrumbs.dashboard') },
					]}
				/>
			}
		>
			<PageHeader
				title={t('dashboard.header.title')}
				description={t('dashboard.header.description')}
				actions={
					<Button variant='outline' loading={status === 'loading'} onClick={retry}>
						{t('dashboard.header.refresh')}
					</Button>
				}
			/>

			<FilterBar
				label={t('dashboard.filters.label')}
				onClear={(): void => {
					setQuery(defaultQuery);
					setSearch('');
				}}
			>
				<Select
					label={t('dashboard.filters.region')}
					value={query.region}
					onValueChange={(region: string): void => {
						changeQuery({ region: region as RegionFilter });
					}}
					options={[
						{ value: 'all', label: t('dashboard.filters.allRegions') },
						...regions.map((region: Region): SelectOption => {
							return { value: region, label: t(`dashboard.regions.${region}`) };
						}),
					]}
				/>

				<Select
					label={t('dashboard.filters.period')}
					value={query.period}
					onValueChange={(period: string): void => {
						changeQuery({ period: period as PeriodFilter });
					}}
					options={periods.map((period: PeriodFilter): SelectOption => {
						return {
							value: period,
							label: t('dashboard.filters.lastMonths', { count: Number(period) }),
						};
					})}
				/>
			</FilterBar>

			{status === 'error' ? (
				<ErrorState
					title={t('dashboard.error.title')}
					description={t('dashboard.error.description')}
					headingLevel={2}
					onRetry={retry}
				/>
			) : (
				<>
					<KpiGrid label={t('dashboard.kpis.label')} items={kpis} loading={status === 'loading'} />

					<DashboardPanel
						title={t('dashboard.revenue.title')}
						description={t('dashboard.revenue.description')}
					>
						<Chart
							chart={revenueChart}
							title={t('dashboard.revenue.title')}
							hideTitle
							status={status}
							locale={locale}
							height='18rem'
							emptyState={
								<EmptyState
									title={t('dashboard.revenue.empty')}
									description={t('dashboard.revenue.emptyDescription')}
								/>
							}
						/>
					</DashboardPanel>

					<DashboardPanel
						title={t('dashboard.orders.title')}
						toolbar={
							<SearchField
								label={t('dashboard.orders.search')}
								value={search}
								onChange={(event: ChangeEvent<HTMLInputElement>): void => {
									setSearch(event.currentTarget.value);
								}}
							/>
						}
					>
						<DataTable
							caption={t('dashboard.orders.caption')}
							hideCaption
							columns={columns}
							rows={ready?.orders ?? []}
							getRowId={(order: Order): string => order.id}
							filter={search}
							locale={locale}
							pageSize={8}
							status={status}
							labels={{ empty: t('dashboard.orders.empty') }}
							defaultSort={{ columnId: 'date', direction: 'descending' }}
						/>
					</DashboardPanel>
				</>
			)}
		</DashboardLayout>
	);
};
