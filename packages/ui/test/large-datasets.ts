// Deterministic large datasets for the performance suite: the same input on every run, so measurements compare.

export interface Invoice {
	id: string;
	customer: string;
	city: string;
	/** Empty for every 50th invoice, like a draft without a total. */
	total: number | null;
	issuedAt: Date;
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

/**
 * `count` invoices with unique customer names in a scrambled order (multiplying by a prime that does not divide the
 * count visits every index once), cities that repeat, numbers and dates: the mix a real table sorts and filters.
 */
export const createInvoices = (count: number): Invoice[] => {
	return Array.from({ length: count }, (_: unknown, index: number): Invoice => {
		return {
			id: `invoice-${String(index + 1)}`,
			customer: `Customer ${String((index * 7919) % count)}`,
			city: cities[index % cities.length] ?? '',
			total: index % 50 === 0 ? null : ((index * 104_729) % 10_000_000) / 100,
			issuedAt: new Date(Date.UTC(2026, 0, 1 + (index % 365))),
		};
	});
};

/** `count` options of a combobox or select, labelled like product names. */
export const createOptionLabels = (count: number): string[] => {
	return Array.from({ length: count }, (_: unknown, index: number): string => {
		return `Product ${String(index + 1)} ${cities[index % cities.length] ?? ''}`;
	});
};
