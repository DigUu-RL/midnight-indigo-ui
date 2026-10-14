// Deterministic large datasets: the same input on every run, so measurements compare.

export interface Invoice {
	id: string;
	customer: string;
	city: string;
	total: number;
}

const cities: readonly string[] = [
	'São Paulo',
	'Curitiba',
	'Recife',
	'Belém',
	'Porto Alegre',
	'Florianópolis',
	'Goiânia',
	'Manaus',
];

/** `count` invoices with unique customer names in a scrambled order and cities that repeat. */
export const createInvoices = (count: number, firstIndex: number = 0): Invoice[] => {
	return Array.from({ length: count }, (_: unknown, offset: number): Invoice => {
		const index: number = firstIndex + offset;

		return {
			id: `INV-${String(index + 1)}`,
			customer: `Customer ${String((index * 7919) % Math.max(count, 1))}`,
			city: cities[index % cities.length] ?? '',
			total: ((index * 104_729) % 10_000_000) / 100,
		};
	});
};

export interface TrafficPoint {
	/** Day label, e.g. `D1`. */
	day: string;
	organic: number;
	paid: number;
	referral: number;
}

/** `count` days of traffic by channel: waves of different periods, so the series cross and have extremes. */
export const createTraffic = (count: number): TrafficPoint[] => {
	return Array.from({ length: count }, (_: unknown, index: number): TrafficPoint => {
		return {
			day: `D${String(index + 1)}`,
			organic: Math.round(1000 + 400 * Math.sin(index / 9) + ((index * 37) % 120)),
			paid: Math.round(700 + 300 * Math.cos(index / 14) + ((index * 53) % 90)),
			referral: Math.round(300 + 150 * Math.sin(index / 5) + ((index * 29) % 60)),
		};
	});
};

/** `count` labels, like product names. */
export const createLabels = (count: number): string[] => {
	return Array.from({ length: count }, (_: unknown, index: number): string => {
		return `Product ${String(index + 1)} ${cities[index % cities.length] ?? ''}`;
	});
};
