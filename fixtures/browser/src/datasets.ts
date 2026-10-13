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

/** `count` labels, like product names. */
export const createLabels = (count: number): string[] => {
	return Array.from({ length: count }, (_: unknown, index: number): string => {
		return `Product ${String(index + 1)} ${cities[index % cities.length] ?? ''}`;
	});
};
