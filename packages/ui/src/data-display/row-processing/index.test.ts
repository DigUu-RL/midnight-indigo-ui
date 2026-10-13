import { describe, expect, it } from 'vitest';

import {
	createSearchIndex,
	filterRows,
	normalizeSearchText,
	pageCountOf,
	pageRows,
	sortRows,
} from '#src/data-display/row-processing/index.ts';
import type { SortValue } from '#src/data-display/row-processing/index.ts';

interface Order {
	id: number;
	customer: string;
	city: string;
	total: number | null;
	placedAt: Date;
}

const cities: readonly string[] = ['São Paulo', 'Curitiba', 'Recife', 'Belém', 'Porto Alegre'];

const createOrders = (count: number): Order[] => {
	return Array.from({ length: count }, (_: unknown, index: number): Order => {
		return {
			id: index + 1,
			customer: `Customer ${String((index * 7919) % count)}`,
			city: cities[index % cities.length] ?? '',
			total: index % 50 === 0 ? null : ((index * 104729) % 100000) / 100,
			placedAt: new Date(Date.UTC(2026, 0, 1 + (index % 365))),
		};
	});
};

const idsOf = (orders: readonly Order[]): number[] => {
	return orders.map((order: Order): number => order.id);
};

describe('sortRows', (): void => {
	const orders: Order[] = [
		{ id: 1, customer: 'item 10', city: 'Recife', total: 30, placedAt: new Date(3) },
		{ id: 2, customer: 'Item 2', city: 'Belém', total: null, placedAt: new Date(1) },
		{ id: 3, customer: 'ítem 1', city: 'belem', total: 10, placedAt: new Date(2) },
		{ id: 4, customer: 'Item 2', city: 'Curitiba', total: 10, placedAt: new Date(4) },
	];

	it('orders text by the locale, ignoring case and accents, with numbers in numeric order', (): void => {
		const byCustomer: Order[] = sortRows(
			orders,
			(order: Order): SortValue => order.customer,
			'ascending',
		);

		expect(idsOf(byCustomer)).toEqual([3, 2, 4, 1]);
	});

	it('keeps equal values in their order in both directions', (): void => {
		const getTotal = (order: Order): SortValue => order.total;

		expect(idsOf(sortRows(orders, getTotal, 'ascending'))).toEqual([3, 4, 1, 2]);
		expect(idsOf(sortRows(orders, getTotal, 'descending'))).toEqual([1, 3, 4, 2]);
	});

	it('sorts dates, booleans and big integers by their value', (): void => {
		expect(
			idsOf(sortRows(orders, (order: Order): SortValue => order.placedAt, 'ascending')),
		).toEqual([2, 3, 1, 4]);

		expect(
			sortRows([true, false, true], (value: boolean): SortValue => value, 'ascending'),
		).toEqual([false, true, true]);

		expect(sortRows([3n, 1n, 2n], (value: bigint): SortValue => value, 'descending')).toEqual([
			3n,
			2n,
			1n,
		]);
	});

	it('puts empty values last in both directions, and numbers before text', (): void => {
		const values: SortValue[] = ['b', '', 2, null, 'a', undefined, 1];

		expect(sortRows(values, (value: SortValue): SortValue => value, 'ascending')).toEqual([
			1,
			2,
			'a',
			'b',
			'',
			null,
			undefined,
		]);

		expect(sortRows(values, (value: SortValue): SortValue => value, 'descending')).toEqual([
			'b',
			'a',
			2,
			1,
			'',
			null,
			undefined,
		]);
	});

	it('does not change the given rows', (): void => {
		const frozen: readonly Order[] = Object.freeze([...orders]);
		sortRows(frozen, (order: Order): SortValue => order.id, 'descending');

		expect(idsOf(frozen)).toEqual([1, 2, 3, 4]);
	});
});

describe('filterRows', (): void => {
	const orders: Order[] = createOrders(10);

	const searchIndex: string[] = createSearchIndex(orders, (order: Order): string[] => {
		return [order.customer, order.city];
	});

	it('finds every word in any searchable column, ignoring case and accents', (): void => {
		expect(idsOf(filterRows(orders, searchIndex, 'SAO'))).toEqual([1, 6]);
		expect(idsOf(filterRows(orders, searchIndex, '  belem   customer 7 '))).toEqual([4]);
	});

	it('keeps every row for a blank query, and none when nothing matches', (): void => {
		expect(filterRows(orders, searchIndex, '   ')).toHaveLength(10);
		expect(filterRows(orders, searchIndex, 'Manaus')).toEqual([]);
	});

	it('lowers case by the rules of the locale', (): void => {
		expect(normalizeSearchText('İSTANBUL', 'tr')).toBe('istanbul');
		expect(normalizeSearchText('Ação Çé')).toBe('acao ce');
	});
});

describe('pageRows', (): void => {
	it('slices the page and always counts at least one page', (): void => {
		const orders: Order[] = createOrders(25);

		expect(idsOf(pageRows(orders, 3, 10))).toEqual([21, 22, 23, 24, 25]);
		expect(pageCountOf(25, 10)).toBe(3);
		expect(pageCountOf(0, 10)).toBe(1);
	});
});
