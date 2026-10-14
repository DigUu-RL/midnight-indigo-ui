// Demo data of a fictional retail chain, generated once from fixed numbers: the server and the browser get the same
// values, so the page hydrates without mismatches. Nothing here knows about the layout or the components.

export type Region = 'south' | 'southeast' | 'northeast';

export const regions: readonly Region[] = ['south', 'southeast', 'northeast'];

export type OrderStatus = 'paid' | 'pending' | 'refunded';

export interface MonthlyRevenue {
	/** First day of the month, ISO 8601 (`2026-01-01`). */
	month: string;
	south: number;
	southeast: number;
	northeast: number;
}

export interface Order {
	id: string;
	customer: string;
	store: string;
	region: Region;
	/** ISO 8601 instant. */
	placedAt: string;
	status: OrderStatus;
	total: number;
}

interface Store {
	name: string;
	region: Region;
}

const stores: readonly Store[] = [
	{ name: 'Curitiba Batel', region: 'south' },
	{ name: 'Porto Alegre Moinhos', region: 'south' },
	{ name: 'São Paulo Pinheiros', region: 'southeast' },
	{ name: 'Rio de Janeiro Botafogo', region: 'southeast' },
	{ name: 'Belo Horizonte Savassi', region: 'southeast' },
	{ name: 'Recife Boa Viagem', region: 'northeast' },
	{ name: 'Salvador Barra', region: 'northeast' },
];

const customers: readonly string[] = [
	'Ana Souza',
	'Bruno Lima',
	'Carla Dias',
	'Diego Rocha',
	'Elisa Melo',
	'Fábio Nunes',
	'Gabriela Torres',
	'Heitor Campos',
	'Isabela Freitas',
	'João Pereira',
	'Larissa Gomes',
	'Marcos Vieira',
];

const statuses: readonly OrderStatus[] = ['paid', 'paid', 'paid', 'pending', 'paid', 'refunded'];

/** Revenue of January in each region, grown month by month with a seasonal swing. */
const baseRevenue: Readonly<Record<Region, number>> = {
	south: 182_000,
	southeast: 341_000,
	northeast: 128_000,
};

const monthCount: number = 9;

const revenueOf = (region: Region, monthIndex: number): number => {
	const growth: number = 1 + monthIndex * 0.021;
	const season: number = 1 + 0.06 * Math.sin((monthIndex + regions.indexOf(region)) * 1.3);
	return Math.round(baseRevenue[region] * growth * season);
};

/** January to September 2026. */
export const monthlyRevenue: readonly MonthlyRevenue[] = Array.from(
	{ length: monthCount },
	(_: unknown, monthIndex: number): MonthlyRevenue => {
		return {
			month: `2026-${String(monthIndex + 1).padStart(2, '0')}-01`,
			south: revenueOf('south', monthIndex),
			southeast: revenueOf('southeast', monthIndex),
			northeast: revenueOf('northeast', monthIndex),
		};
	},
);

const orderCount: number = 240;
const firstOrderTime: number = Date.UTC(2026, 0, 2, 13);
const orderSpacing: number = Math.floor((Date.UTC(2026, 8, 30, 21) - firstOrderTime) / orderCount);

/** Orders from January to September 2026, the most recent first. */
export const orders: readonly Order[] = Array.from(
	{ length: orderCount },
	(_: unknown, index: number): Order => {
		const store: Store | undefined = stores[(index * 5) % stores.length];

		return {
			id: `PED-${String(10_480 + index)}`,
			customer: customers[(index * 7) % customers.length] ?? '',
			store: store?.name ?? '',
			region: store?.region ?? 'south',
			placedAt: new Date(firstOrderTime + index * orderSpacing).toISOString(),
			status: statuses[index % statuses.length] ?? 'paid',
			total: ((index * 7919) % 2_400) + 89.9,
		};
	},
).toReversed();
