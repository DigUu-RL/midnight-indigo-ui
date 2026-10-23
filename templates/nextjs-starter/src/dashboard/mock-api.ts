// Stand-in for the backend of the dashboard: an asynchronous function with latency and failures, over the demo data.
// Replace it with a real request; the page only depends on `fetchDashboard` and its types.
import { monthlyRevenue, orders, regions } from '@/src/dashboard/demo-data';
import type { MonthlyRevenue, Order, Region } from '@/src/dashboard/demo-data';

/** How the fake backend answers: with data, never, with nothing or with an error. */
export type DemoScenario = 'live' | 'loading' | 'empty' | 'error';

export const demoScenarios: readonly DemoScenario[] = ['live', 'loading', 'empty', 'error'];

export type RegionFilter = Region | 'all';

/** Number of months up to September 2026. */
export type PeriodFilter = '3' | '6' | '9';

export interface DashboardQuery {
	region: RegionFilter;
	period: PeriodFilter;
}

export interface DashboardSnapshot {
	/** Regions included, in the order of their series. */
	regions: readonly Region[];
	revenue: number;
	/** Change of the revenue of the last month over the month before it, e.g. `0.12`; undefined with one month. */
	revenueChange: number | undefined;
	orderCount: number;
	averageTicket: number;
	/** Share of the orders that were refunded, e.g. `0.08`. */
	refundRate: number;
	monthly: readonly MonthlyRevenue[];
	/** The most recent first. */
	orders: readonly Order[];
}

export class DashboardRequestError extends Error {
	public constructor() {
		super('The dashboard service did not answer.');
		this.name = 'DashboardRequestError';
	}
}

const latencyInMilliseconds: number = 600;

const sumOf = (values: readonly number[]): number => {
	return values.reduce((total: number, value: number): number => total + value, 0);
};

const revenueOf = (month: MonthlyRevenue, included: readonly Region[]): number => {
	return sumOf(included.map((region: Region): number => month[region]));
};

const emptySnapshot = (included: readonly Region[]): DashboardSnapshot => {
	return {
		regions: included,
		revenue: 0,
		revenueChange: undefined,
		orderCount: 0,
		averageTicket: 0,
		refundRate: 0,
		monthly: [],
		orders: [],
	};
};

/** The figures of the query, computed from the demo data. */
export const snapshotOf = ({ region, period }: DashboardQuery): DashboardSnapshot => {
	const included: readonly Region[] = region === 'all' ? regions : [region];
	const monthly: readonly MonthlyRevenue[] = monthlyRevenue.slice(-Number(period));
	const since: string = monthly[0]?.month ?? '';

	const selected: readonly Order[] = orders.filter((order: Order): boolean => {
		return included.includes(order.region) && order.placedAt >= since;
	});

	const [previous, last]: (MonthlyRevenue | undefined)[] = monthly.slice(-2);

	return {
		regions: included,
		revenue: sumOf(monthly.map((month: MonthlyRevenue): number => revenueOf(month, included))),
		revenueChange:
			previous === undefined || last === undefined
				? undefined
				: revenueOf(last, included) / revenueOf(previous, included) - 1,
		orderCount: selected.length,
		averageTicket:
			selected.length === 0
				? 0
				: sumOf(selected.map((order: Order): number => order.total)) / selected.length,
		refundRate:
			selected.length === 0
				? 0
				: selected.filter((order: Order): boolean => order.status === 'refunded').length /
					selected.length,
		monthly,
		orders: selected,
	};
};

const abortError = (): DOMException => {
	return new DOMException('The request was aborted.', 'AbortError');
};

const wait = async (signal: AbortSignal): Promise<void> => {
	await new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
		const timer: ReturnType<typeof setTimeout> = setTimeout(resolve, latencyInMilliseconds);

		signal.addEventListener('abort', (): void => {
			clearTimeout(timer);
			reject(abortError());
		});
	});
};

/** Answers after a short latency, as the scenario says; `loading` waits until the request is aborted. */
export const fetchDashboard = async (
	query: DashboardQuery,
	scenario: DemoScenario,
	signal: AbortSignal,
): Promise<DashboardSnapshot> => {
	if (scenario === 'loading') {
		await new Promise<never>((_resolve: unknown, reject: (reason: Error) => void): void => {
			signal.addEventListener('abort', (): void => {
				reject(abortError());
			});
		});
	}

	await wait(signal);
	if (scenario === 'error') throw new DashboardRequestError();

	return scenario === 'empty'
		? emptySnapshot(query.region === 'all' ? regions : [query.region])
		: snapshotOf(query);
};
