'use client';
// Every order of the demo data in a table that sorts, pages and filters on the client: by status and region with
// selects, by customer, store or number with the search field. When nothing matches, the empty state offers to clear
// the filters.
import { Button } from '@midnight-indigo/ui/buttons';
import { DashboardPanel, FilterBar } from '@midnight-indigo/ui/dashboard';
import { DataTable, EmptyState } from '@midnight-indigo/ui/data-display';
import type { DataTableColumn } from '@midnight-indigo/ui/data-display';
import { SearchField, Select } from '@midnight-indigo/ui/forms';
import type { SelectOption } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { useMemo, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import { orders, orderStatuses, regions } from '#src/dashboard/demo-data.ts';
import type { Order, OrderStatus, Region } from '#src/dashboard/demo-data.ts';
import { useOrderColumns } from '#src/dashboard/use-order-columns.ts';

type StatusFilter = OrderStatus | 'all';
type RegionFilter = Region | 'all';

export const OrderListing = (): ReactElement => {
	const { t, locale }: I18nValue = useI18n();
	const [status, setStatus] = useState<StatusFilter>('all');
	const [region, setRegion] = useState<RegionFilter>('all');
	const [search, setSearch] = useState<string>('');
	const columns: DataTableColumn<Order>[] = useOrderColumns();
	const filtered: boolean = status !== 'all' || region !== 'all' || search !== '';

	// The same array while the selects stay the same, so the table keeps its search index.
	const rows: readonly Order[] = useMemo((): readonly Order[] => {
		return orders.filter((order: Order): boolean => {
			return (
				(status === 'all' || order.status === status) &&
				(region === 'all' || order.region === region)
			);
		});
	}, [status, region]);

	const clearFilters = (): void => {
		setStatus('all');
		setRegion('all');
		setSearch('');
	};

	return (
		<>
			<FilterBar label={t('orders.filters.label')} {...(filtered ? { onClear: clearFilters } : {})}>
				<SearchField
					label={t('orders.filters.search')}
					value={search}
					onChange={(event: ChangeEvent<HTMLInputElement>): void => {
						setSearch(event.currentTarget.value);
					}}
				/>

				<Select
					label={t('orders.filters.status')}
					value={status}
					onValueChange={(value: string): void => {
						setStatus(value as StatusFilter);
					}}
					options={[
						{ value: 'all', label: t('orders.filters.allStatuses') },
						...orderStatuses.map((item: OrderStatus): SelectOption => {
							return { value: item, label: t(`orders.statuses.${item}`) };
						}),
					]}
				/>

				<Select
					label={t('orders.filters.region')}
					value={region}
					onValueChange={(value: string): void => {
						setRegion(value as RegionFilter);
					}}
					options={[
						{ value: 'all', label: t('orders.filters.allRegions') },
						...regions.map((item: Region): SelectOption => {
							return { value: item, label: t(`regions.${item}`) };
						}),
					]}
				/>
			</FilterBar>

			<DashboardPanel
				title={t('orders.listing.title')}
				description={t('orders.listing.description')}
			>
				<DataTable
					caption={t('orders.listing.caption')}
					hideCaption
					columns={columns}
					rows={rows}
					getRowId={(order: Order): string => order.id}
					filter={search}
					locale={locale}
					defaultSort={{ columnId: 'date', direction: 'descending' }}
					emptyState={
						<EmptyState
							title={t('orders.listing.noResults')}
							description={t('orders.listing.noResultsDescription')}
							headingLevel={3}
							action={
								<Button variant='outline' onClick={clearFilters}>
									{t('orders.listing.clearFilters')}
								</Button>
							}
						/>
					}
				/>
			</DashboardPanel>
		</>
	);
};
