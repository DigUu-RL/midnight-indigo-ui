// Orders (Server Component): the heading is rendered and translated on the server, the listing hydrates on the client.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { getTranslator, localeOf } from '#src/i18n/server.ts';
import type { LocaleParams } from '#src/i18n/server.ts';
import { OrderListing } from '#src/orders/order-listing.tsx';

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('orders.header.title') };
};

const OrdersPage = async (props: LocaleParams): Promise<ReactElement> => {
	const translate: TFunction = await getTranslator(await localeOf(props));

	return (
		<>
			<PageHeader
				title={translate('orders.header.title')}
				description={translate('orders.header.description')}
			/>

			<OrderListing />
		</>
	);
};

export default OrdersPage;
