// New customer (Server Component): the heading on the server, the form on the client, its checks and its submission in
// Server Actions.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { CustomerForm } from '#src/customers/customer-form.tsx';
import type { LocaleSegment } from '#src/i18n/locales.ts';
import { getTranslator, localeOf } from '#src/i18n/server.ts';
import type { LocaleParams } from '#src/i18n/server.ts';

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('customers.header.title') };
};

const NewCustomerPage = async (props: LocaleParams): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf(props);
	const translate: TFunction = await getTranslator(locale);

	return (
		<>
			<PageHeader
				title={translate('customers.header.title')}
				description={translate('customers.header.description')}
			/>

			<CustomerForm locale={locale} />
		</>
	);
};

export default NewCustomerPage;
