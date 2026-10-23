// A list of many items, each with a title, a description and a trailing value.
import { List, ListItem } from '@midnight-indigo/ui/data-display';
import { useMemo } from 'react';
import type { ReactElement } from 'react';

import { createInvoices } from '@/src/datasets';
import type { Invoice } from '@/src/datasets';

interface ListScenarioProps {
	itemCount: number;
}

export const ListScenario = ({ itemCount }: ListScenarioProps): ReactElement => {
	const invoices: Invoice[] = useMemo((): Invoice[] => createInvoices(itemCount), [itemCount]);

	return (
		<List aria-label='Invoices'>
			{invoices.map((invoice: Invoice): ReactElement => {
				return (
					<ListItem
						key={invoice.id}
						title={invoice.customer}
						description={`${invoice.city} · ${invoice.id}`}
						trailing={invoice.total.toFixed(2)}
					/>
				);
			})}
		</List>
	);
};
