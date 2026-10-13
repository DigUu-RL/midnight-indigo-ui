// Sorting, filtering and paging of rows on the client, apart from rendering so that they can be measured on their own.

export type SortDirection = 'ascending' | 'descending';

/** The column a table is sorted by, and in which direction. */
export interface SortState {
	columnId: string;
	direction: SortDirection;
}

/** Values a column sorts by. Empty values (`null`, `undefined`, `''`) always go last, in both directions. */
export type SortValue = string | number | bigint | boolean | Date | null | undefined;

interface DecoratedRow<Row> {
	row: Row;
	value: SortValue;
	position: number;
}

const isEmpty = (value: SortValue): boolean => {
	return value === null || value === undefined || value === '';
};

const numericValue = (value: number | bigint | boolean | Date): number | bigint => {
	return value instanceof Date
		? value.getTime()
		: typeof value === 'boolean'
			? Number(value)
			: value;
};

const compareValues = (left: SortValue, right: SortValue, collator: Intl.Collator): number => {
	if (typeof left === 'string' && typeof right === 'string') return collator.compare(left, right);
	if (typeof left === 'string') return 1;
	if (typeof right === 'string') return -1;
	if (left === null || left === undefined || right === null || right === undefined) return 0;

	const leftNumber: number | bigint = numericValue(left);
	const rightNumber: number | bigint = numericValue(right);

	return leftNumber < rightNumber ? -1 : leftNumber > rightNumber ? 1 : 0;
};

/**
 * Compares text as people expect: by the rules of `locale`, ignoring case and accents, and with the numbers inside the
 * text in numeric order (`Item 2` before `Item 10`).
 */
export const createRowCollator = (locale?: string): Intl.Collator => {
	return new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
};

/**
 * A sorted copy of `rows`. Each value is read once, and rows with equal values keep their order. Numbers go before
 * text when a column mixes them.
 */
export const sortRows = <Row>(
	rows: readonly Row[],
	getValue: (row: Row) => SortValue,
	direction: SortDirection,
	collator: Intl.Collator = createRowCollator(),
): Row[] => {
	const sign: number = direction === 'ascending' ? 1 : -1;

	return rows
		.map((row: Row, position: number): DecoratedRow<Row> => {
			return { row, value: getValue(row), position };
		})
		.sort((left: DecoratedRow<Row>, right: DecoratedRow<Row>): number => {
			const leftEmpty: boolean = isEmpty(left.value);
			const rightEmpty: boolean = isEmpty(right.value);

			if (leftEmpty !== rightEmpty) return leftEmpty ? 1 : -1;

			const order: number = leftEmpty ? 0 : compareValues(left.value, right.value, collator) * sign;
			return order === 0 ? left.position - right.position : order;
		})
		.map((decorated: DecoratedRow<Row>): Row => decorated.row);
};

/** Lower case without accents, so that `são` finds `Sao Paulo`. */
export const normalizeSearchText = (text: string, locale?: string): string => {
	// Lower case first: some locales map a letter with a mark to a plain one (Turkish `İ` to `i`).
	return text
		.toLocaleLowerCase(locale)
		.normalize('NFD')
		.replaceAll(/\p{Diacritic}/gu, '');
};

/**
 * The searchable text of each row, computed once per list of rows: filtering then only compares strings while the
 * user types.
 */
export const createSearchIndex = <Row>(
	rows: readonly Row[],
	getTexts: (row: Row) => readonly string[],
	locale?: string,
): string[] => {
	return rows.map((row: Row): string => normalizeSearchText(getTexts(row).join('\n'), locale));
};

/** The rows whose indexed text contains every word of `query`, in their original order. */
export const filterRows = <Row>(
	rows: readonly Row[],
	searchIndex: readonly string[],
	query: string,
	locale?: string,
): Row[] => {
	const words: string[] = normalizeSearchText(query, locale)
		.split(/\s+/u)
		.filter((word: string): boolean => word !== '');

	if (words.length === 0) return [...rows];

	return rows.filter((_: Row, position: number): boolean => {
		const text: string = searchIndex[position] ?? '';
		return words.every((word: string): boolean => text.includes(word));
	});
};

/** Number of pages for `rowCount` rows; at least one, so that an empty table still has a page. */
export const pageCountOf = (rowCount: number, pageSize: number): number => {
	return Math.max(1, Math.ceil(rowCount / pageSize));
};

/** The rows of `page` (from 1). */
export const pageRows = <Row>(rows: readonly Row[], page: number, pageSize: number): Row[] => {
	const start: number = (page - 1) * pageSize;
	return rows.slice(start, start + pageSize);
};
