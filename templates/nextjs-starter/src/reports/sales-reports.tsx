'use client';
// One chart of each factory over the demo data. Every chart is named by its panel, read by a generated summary,
// reachable by keyboard and one button away from its data as a table; the charts below the first row load the engine
// only when they come near the viewport.
import {
	Chart,
	createBarChart,
	createComposedChart,
	createGaugeChart,
	createLineChart,
	createPieChart,
} from '@midnight-indigo/ui/charts';
import type {
	BarChartDefinition,
	ComposedChartDefinition,
	GaugeChartDefinition,
	LineChartDefinition,
	PieChartDefinition,
} from '@midnight-indigo/ui/charts';
import { DashboardPanel } from '@midnight-indigo/ui/dashboard';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { Grid } from '@midnight-indigo/ui/layout';
import { useMemo } from 'react';
import type { ReactElement } from 'react';

import {
	lastMonthRevenue,
	monthlyOrders,
	monthlyPerformance,
	monthlyRevenueGoal,
	statusShare,
	storeRevenue,
} from '#src/reports/report-data.ts';
import type {
	MonthlyOrders,
	MonthlyPerformance,
	StatusShare,
	StoreRevenue,
} from '#src/reports/report-data.ts';

interface Labelled {
	label: string;
}

interface Charts {
	orders: LineChartDefinition<MonthlyOrders & Labelled>;
	performance: ComposedChartDefinition<MonthlyPerformance & Labelled>;
	stores: BarChartDefinition<StoreRevenue>;
	statuses: PieChartDefinition<StatusShare & Labelled>;
	goal: GaugeChartDefinition;
}

interface ReportPanelProps {
	name: keyof Charts;
	children: (title: string) => ReactElement;
}

const ReportPanel = ({ name, children }: ReportPanelProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const title: string = t(`reports.${name}.title`);

	return (
		<DashboardPanel title={title} description={t(`reports.${name}.description`)}>
			{children(title)}
		</DashboardPanel>
	);
};

export const SalesReports = (): ReactElement => {
	const { t, locale, formatCurrency, formatDate, formatNumber }: I18nValue = useI18n();

	const charts: Charts = useMemo((): Charts => {
		const monthLabel = (month: string): string => {
			return formatDate(Date.parse(month), { month: 'short', timeZone: 'UTC' });
		};

		const formatAmount = (value: number): string => {
			return formatCurrency(value, { maximumFractionDigits: 0 });
		};

		return {
			orders: createLineChart({
				data: monthlyOrders.map((month: MonthlyOrders): MonthlyOrders & Labelled => {
					return { ...month, label: monthLabel(month.month) };
				}),
				x: 'label',
				categoryLabel: t('reports.month'),
				series: [
					{ key: 'paid', label: t('orders.statuses.paid') },
					{ key: 'pending', label: t('orders.statuses.pending') },
					{ key: 'refunded', label: t('orders.statuses.refunded') },
				],
				valueAxis: { label: t('reports.orders.axis') },
			}),
			performance: createComposedChart({
				data: monthlyPerformance.map((month: MonthlyPerformance): MonthlyPerformance & Labelled => {
					return { ...month, label: monthLabel(month.month) };
				}),
				x: 'label',
				categoryLabel: t('reports.month'),
				series: [
					{
						key: 'revenue',
						label: t('reports.performance.revenue'),
						type: 'bar',
						formatValue: formatAmount,
					},
					{
						key: 'averageTicket',
						label: t('reports.performance.averageTicket'),
						type: 'line',
						axis: 'secondary',
						formatValue: formatAmount,
					},
				],
				valueAxis: { label: t('reports.performance.revenue') },
				secondaryValueAxis: { label: t('reports.performance.averageTicket') },
				interaction: { zoom: true },
			}),
			stores: createBarChart({
				data: storeRevenue,
				x: 'store',
				categoryLabel: t('reports.stores.category'),
				orientation: 'horizontal',
				series: [{ key: 'revenue', label: t('reports.stores.revenue'), formatValue: formatAmount }],
			}),
			statuses: createPieChart({
				data: statusShare.map((share: StatusShare): StatusShare & Labelled => {
					return { ...share, label: t(`orders.statuses.${share.status}`) };
				}),
				category: 'label',
				value: 'count',
				categoryLabel: t('reports.statuses.category'),
				valueLabel: t('reports.statuses.value'),
				donut: true,
			}),
			goal: createGaugeChart({
				value: lastMonthRevenue,
				maximum: monthlyRevenueGoal,
				formatValue: (value: number): string => {
					return formatCurrency(value, { notation: 'compact', maximumFractionDigits: 1 });
				},
			}),
		};
	}, [t, formatCurrency, formatDate]);

	return (
		<Grid columns={{ compact: 1, large: 2 }} gap='6'>
			<ReportPanel name='orders'>
				{(title: string): ReactElement => {
					return <Chart chart={charts.orders} title={title} hideTitle locale={locale} />;
				}}
			</ReportPanel>

			<ReportPanel name='performance'>
				{(title: string): ReactElement => {
					return <Chart chart={charts.performance} title={title} hideTitle locale={locale} />;
				}}
			</ReportPanel>

			<ReportPanel name='stores'>
				{(title: string): ReactElement => {
					return <Chart chart={charts.stores} title={title} hideTitle locale={locale} lazy />;
				}}
			</ReportPanel>

			<ReportPanel name='statuses'>
				{(title: string): ReactElement => {
					return <Chart chart={charts.statuses} title={title} hideTitle locale={locale} lazy />;
				}}
			</ReportPanel>

			<ReportPanel name='goal'>
				{(title: string): ReactElement => {
					return (
						<Chart
							chart={charts.goal}
							title={title}
							hideTitle
							locale={locale}
							lazy
							summary={t('reports.goal.summary', {
								revenue: formatCurrency(lastMonthRevenue, { maximumFractionDigits: 0 }),
								goal: formatCurrency(monthlyRevenueGoal, { maximumFractionDigits: 0 }),
								share: formatNumber(lastMonthRevenue / monthlyRevenueGoal, {
									style: 'percent',
									maximumFractionDigits: 0,
								}),
							})}
						/>
					);
				}}
			</ReportPanel>
		</Grid>
	);
};
