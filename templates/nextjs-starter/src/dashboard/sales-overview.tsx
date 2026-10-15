'use client';
// The sales overview: the page patterns of `@midnight-indigo/ui/dashboard` over a mock API. Every text comes from the
// messages of the application and the data from `fetchDashboard`; the scenario in the URL makes the fake backend load
// forever, answer with nothing or fail.
import { Button } from '@midnight-indigo/ui/buttons';
import { Chart, createAreaChart } from '@midnight-indigo/ui/charts';
import type { AreaChartDefinition, ChartSeries } from '@midnight-indigo/ui/charts';
import { DashboardPanel, FilterBar, KpiGrid, PageHeader } from '@midnight-indigo/ui/dashboard';
import type { KpiItem } from '@midnight-indigo/ui/dashboard';
import { DataTable, EmptyState, ErrorState } from '@midnight-indigo/ui/data-display';
import type { DataTableColumn, StatChange } from '@midnight-indigo/ui/data-display';
import { SearchField, Select } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { TabNavigation } from '@midnight-indigo/ui/navigation';
import type { TabNavigationItem } from '@midnight-indigo/ui/navigation';
import { useMemo, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import type { MonthlyRevenue, Order, Region } from '#src/dashboard/demo-data.ts';
import { regions } from '#src/dashboard/demo-data.ts';
import { demoScenarios } from '#src/dashboard/mock-api.ts';
import type {
	DashboardQuery,
	DashboardSnapshot,
	DemoScenario,
	PeriodFilter,
	RegionFilter,
} from '#src/dashboard/mock-api.ts';
import { useOrderColumns } from '#src/dashboard/use-order-columns.ts';
import { useDashboardSnapshot } from '#src/dashboard/use-dashboard-snapshot.ts';
import type { DashboardRequest } from '#src/dashboard/use-dashboard-snapshot.ts';
import type { LocaleSegment } from '#src/i18n/locales.ts';

interface SalesOverviewProps {
	locale: LocaleSegment;
	scenario: DemoScenario;
}

/** A month of revenue with its label in the locale, the category of the chart. */
interface RevenuePoint extends MonthlyRevenue {
	label: string;
}

const periods: readonly PeriodFilter[] = ['3', '6', '9'];

const defaultQuery: DashboardQuery = { region: 'all', period: '6' };

const changeOf = (ratio: number, formatPercent: (value: number) => string): StatChange => {
	return {
		value: formatPercent(Math.abs(ratio)),
		trend: Math.abs(ratio) < 0.0005 ? 'flat' : ratio > 0 ? 'up' : 'down',
	};
};

export const SalesOverview = ({ locale, scenario }: SalesOverviewProps): ReactElement => {
	const { t, locale: localeTag, formatCurrency, formatNumber, formatDate }: I18nValue = useI18n();
	const [query, setQuery] = useState<DashboardQuery>(defaultQuery);
	const [search, setSearch] = useState<string>('');
	const { status, snapshot, retry }: DashboardRequest = useDashboardSnapshot(query, scenario);
	const ready: DashboardSnapshot | undefined = status === 'ready' ? snapshot : undefined;
	const columns: DataTableColumn<Order>[] = useOrderColumns();

	const formatPercent = (value: number): string => {
		return formatNumber(value, { style: 'percent', maximumFractionDigits: 1 });
	};

	const kpis: KpiItem[] = [
		{
			id: 'revenue',
			label: t('overview.kpis.revenue'),
			// Compact, so that millions fit a quarter of the row: `R$4.33M`.
			value: formatCurrency(ready?.revenue ?? 0, {
				notation: 'compact',
				maximumFractionDigits: 2,
			}),
			...(ready?.revenueChange === undefined
				? {}
				: {
						change: changeOf(ready.revenueChange, formatPercent),
						description: t('overview.kpis.monthOverMonth'),
					}),
		},
		{
			id: 'orders',
			label: t('overview.kpis.orders'),
			value: formatNumber(ready?.orderCount ?? 0),
			description: t('overview.kpis.inPeriod'),
		},
		{
			id: 'average-ticket',
			label: t('overview.kpis.averageTicket'),
			value: formatCurrency(ready?.averageTicket ?? 0),
		},
		{
			id: 'refund-rate',
			label: t('overview.kpis.refundRate'),
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
				categoryLabel: t('overview.revenue.category'),
				stacked: true,
				series: included.map((region: Region): ChartSeries<RevenuePoint> => {
					return {
						key: region,
						label: t(`regions.${region}`),
						formatValue: (value: number): string => {
							return formatCurrency(value, { maximumFractionDigits: 0 });
						},
					};
				}),
			});
		}, [ready, t, formatDate, formatCurrency]);

	const scenarios: TabNavigationItem[] = demoScenarios.map(
		(item: DemoScenario): TabNavigationItem => {
			return {
				id: item,
				label: t(`overview.scenarios.${item}`),
				href: item === 'live' ? `/${locale}` : `/${locale}?state=${item}`,
				current: item === scenario,
			};
		},
	);

	const changeQuery = (change: Partial<DashboardQuery>): void => {
		setQuery((current: DashboardQuery): DashboardQuery => ({ ...current, ...change }));
	};

	return (
		<>
			<PageHeader
				title={t('overview.header.title')}
				description={t('overview.header.description')}
				actions={
					<Button variant='outline' loading={status === 'loading'} onClick={retry}>
						{t('overview.header.refresh')}
					</Button>
				}
			/>

			<TabNavigation label={t('overview.scenarios.label')} items={scenarios} />

			<FilterBar
				label={t('overview.filters.label')}
				onClear={(): void => {
					setQuery(defaultQuery);
					setSearch('');
				}}
			>
				<Select
					label={t('overview.filters.region')}
					value={query.region}
					onValueChange={(region: string): void => {
						changeQuery({ region: region as RegionFilter });
					}}
					options={[
						{ value: 'all', label: t('overview.filters.allRegions') },
						...regions.map((region: Region): SelectOption => {
							return { value: region, label: t(`regions.${region}`) };
						}),
					]}
				/>

				<Select
					label={t('overview.filters.period')}
					value={query.period}
					onValueChange={(period: string): void => {
						changeQuery({ period: period as PeriodFilter });
					}}
					options={periods.map((period: PeriodFilter): SelectOption => {
						return {
							value: period,
							label: t('overview.filters.lastMonths', { count: Number(period) }),
						};
					})}
				/>
			</FilterBar>

			{status === 'error' ? (
				<ErrorState
					title={t('overview.error.title')}
					description={t('overview.error.description')}
					headingLevel={2}
					onRetry={retry}
				/>
			) : (
				<>
					<KpiGrid label={t('overview.kpis.label')} items={kpis} loading={status === 'loading'} />

					<DashboardPanel
						title={t('overview.revenue.title')}
						description={t('overview.revenue.description')}
					>
						<Chart
							chart={revenueChart}
							title={t('overview.revenue.title')}
							hideTitle
							status={status}
							locale={localeTag}
							height='18rem'
							emptyState={
								<EmptyState
									title={t('overview.revenue.empty')}
									description={t('overview.revenue.emptyDescription')}
								/>
							}
						/>
					</DashboardPanel>

					<DashboardPanel
						title={t('overview.orders.title')}
						toolbar={
							<SearchField
								label={t('overview.orders.search')}
								value={search}
								onChange={(event: ChangeEvent<HTMLInputElement>): void => {
									setSearch(event.currentTarget.value);
								}}
							/>
						}
					>
						<DataTable
							caption={t('overview.orders.caption')}
							hideCaption
							columns={columns}
							rows={ready?.orders ?? []}
							getRowId={(order: Order): string => order.id}
							filter={search}
							locale={localeTag}
							pageSize={8}
							status={status}
							labels={{ empty: t('overview.orders.empty') }}
							defaultSort={{ columnId: 'date', direction: 'descending' }}
						/>
					</DashboardPanel>
				</>
			)}
		</>
	);
};
