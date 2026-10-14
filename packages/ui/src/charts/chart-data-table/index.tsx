'use client';
// The data of a chart as a paged table: the text alternative for data that a picture cannot convey to everyone. Mounted
// only while it is open, so a long series is formatted only when someone asks to read it.
import { useMemo } from 'react';
import type { ReactElement } from 'react';

import { DataTable } from '#src/data-display/data-table/index.tsx';
import type { DataTableColumn } from '#src/data-display/data-table/index.tsx';
import type { ChartLabels } from '#src/charts/chart-labels/index.ts';
import type { ChartModel } from '#src/charts/chart-model/index.ts';
import { tabulateChart } from '#src/charts/chart-summary/index.ts';
import type { DataTableContent } from '#src/charts/chart-summary/index.ts';

interface TableRow {
	id: string;
	cells: readonly string[];
}

export interface ChartDataTableProps {
	id: string;
	/** Name of the table: the title of the chart. */
	caption: string;
	model: ChartModel;
	labels: ChartLabels;
	locale: string | undefined;
}

export const ChartDataTable = ({
	id,
	caption,
	model,
	labels,
	locale,
}: ChartDataTableProps): ReactElement => {
	const content: DataTableContent = useMemo(
		(): DataTableContent => tabulateChart(model, labels, locale),
		[model, labels, locale],
	);

	const columns: DataTableColumn<TableRow>[] = useMemo((): DataTableColumn<TableRow>[] => {
		return content.headers.map((header: string, index: number): DataTableColumn<TableRow> => {
			return {
				id: String(index),
				header,
				cell: (row: TableRow): string => row.cells[index] ?? '',
				align: index === 0 ? 'start' : 'end',
				rowHeader: index === 0,
			};
		});
	}, [content]);

	const rows: TableRow[] = useMemo((): TableRow[] => {
		return content.rows.map((cells: readonly string[], index: number): TableRow => {
			return { id: String(index), cells };
		});
	}, [content]);

	return (
		<DataTable
			id={id}
			caption={caption}
			hideCaption
			density='compact'
			columns={columns}
			rows={rows}
			getRowId={(row: TableRow): string => row.id}
			{...(locale === undefined ? {} : { locale })}
		/>
	);
};
