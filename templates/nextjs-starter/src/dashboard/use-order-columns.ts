'use client';
// The columns of an order listing, shared by the sales overview and the orders page. Rebuilt only with the locale: the
// table indexes the searchable text once per list of columns and rows.
import type { DataTableColumn, SortValue } from '@midnight-indigo/ui/data-display';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { useMemo } from 'react';

import type { Order } from '@/src/dashboard/demo-data';

export const useOrderColumns = (): DataTableColumn<Order>[] => {
	const { t, formatDate, formatCurrency }: I18nValue = useI18n();

	return useMemo((): DataTableColumn<Order>[] => {
		return [
			{
				id: 'id',
				header: t('orders.columns.order'),
				rowHeader: true,
				cell: (order: Order): string => order.id,
				sortValue: (order: Order): SortValue => order.id,
				filterValue: (order: Order): string => order.id,
			},
			{
				id: 'customer',
				header: t('orders.columns.customer'),
				cell: (order: Order): string => order.customer,
				sortValue: (order: Order): SortValue => order.customer,
				filterValue: (order: Order): string => order.customer,
			},
			{
				id: 'store',
				header: t('orders.columns.store'),
				cell: (order: Order): string => order.store,
				filterValue: (order: Order): string => order.store,
			},
			{
				id: 'date',
				header: t('orders.columns.date'),
				cell: (order: Order): string => {
					return formatDate(Date.parse(order.placedAt), { dateStyle: 'medium' });
				},
				sortValue: (order: Order): SortValue => order.placedAt,
			},
			{
				id: 'status',
				header: t('orders.columns.status'),
				cell: (order: Order): string => t(`orders.statuses.${order.status}`),
			},
			{
				id: 'total',
				header: t('orders.columns.total'),
				align: 'end',
				cell: (order: Order): string => formatCurrency(order.total),
				sortValue: (order: Order): SortValue => order.total,
			},
		];
	}, [t, formatDate, formatCurrency]);
};
