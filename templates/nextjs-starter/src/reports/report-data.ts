// The figures of the reports, computed once from the demo data. Plain data without texts: the page translates the
// labels and formats the values in the locale.
import { monthlyRevenue, orders, orderStatuses, regions } from '#src/dashboard/demo-data.ts';
import type { MonthlyRevenue, Order, OrderStatus, Region } from '#src/dashboard/demo-data.ts';

export interface MonthlyOrders {
	/** First day of the month, ISO 8601. */
	month: string;
	paid: number;
	pending: number;
	refunded: number;
}

export interface MonthlyPerformance {
	month: string;
	revenue: number;
	averageTicket: number | null;
}

export interface StoreRevenue {
	store: string;
	revenue: number;
}

export interface StatusShare {
	status: OrderStatus;
	count: number;
}

/** Revenue goal of the last month of the data, the scale of the gauge. */
export const monthlyRevenueGoal: number = 850_000;

const sumOf = (values: readonly number[]): number => {
	return values.reduce((total: number, value: number): number => total + value, 0);
};

const ordersOfMonth = (month: string): readonly Order[] => {
	return orders.filter((order: Order): boolean => order.placedAt.startsWith(month.slice(0, 7)));
};

const revenueOfMonth = (month: MonthlyRevenue): number => {
	return sumOf(regions.map((region: Region): number => month[region]));
};

export const monthlyOrders: readonly MonthlyOrders[] = monthlyRevenue.map(
	({ month }: MonthlyRevenue): MonthlyOrders => {
		const ofMonth: readonly Order[] = ordersOfMonth(month);

		const countOf = (status: OrderStatus): number => {
			return ofMonth.filter((order: Order): boolean => order.status === status).length;
		};

		return {
			month,
			paid: countOf('paid'),
			pending: countOf('pending'),
			refunded: countOf('refunded'),
		};
	},
);

export const monthlyPerformance: readonly MonthlyPerformance[] = monthlyRevenue.map(
	(month: MonthlyRevenue): MonthlyPerformance => {
		const totals: number[] = ordersOfMonth(month.month).map((order: Order): number => order.total);

		return {
			month: month.month,
			revenue: revenueOfMonth(month),
			averageTicket: totals.length === 0 ? null : sumOf(totals) / totals.length,
		};
	},
);

/** The most profitable store first. */
export const storeRevenue: readonly StoreRevenue[] = [
	...orders.reduce((totals: Map<string, number>, order: Order): Map<string, number> => {
		return totals.set(order.store, (totals.get(order.store) ?? 0) + order.total);
	}, new Map<string, number>()),
]
	.map(([store, revenue]: [string, number]): StoreRevenue => ({ store, revenue }))
	.toSorted((first: StoreRevenue, second: StoreRevenue): number => second.revenue - first.revenue);

export const statusShare: readonly StatusShare[] = orderStatuses.map(
	(status: OrderStatus): StatusShare => {
		return {
			status,
			count: orders.filter((order: Order): boolean => order.status === status).length,
		};
	},
);

const lastMonth: MonthlyRevenue | undefined = monthlyRevenue.at(-1);

/** Revenue of the last month of the data, measured against `monthlyRevenueGoal`. */
export const lastMonthRevenue: number = lastMonth === undefined ? 0 : revenueOfMonth(lastMonth);
