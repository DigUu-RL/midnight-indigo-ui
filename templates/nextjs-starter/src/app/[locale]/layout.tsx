// Root layout of the application (Server Component). The locale is the first segment of the URL: every page is built
// once per locale at build time, and `<html lang>`, the messages and the formatters all follow it, so the server and the
// browser render the same text.
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { localeSegments, localeTags } from '@/src/i18n/locales';
import type { LocaleSegment } from '@/src/i18n/locales';
import { messagesOf } from '@/src/i18n/messages';
import { getTranslator, localeOf } from '@/src/i18n/server';
import type { LocaleParams } from '@/src/i18n/server';
import { AppProviders } from '@/src/shell/app-providers';
import { AppShell } from '@/src/shell/app-shell';

interface LocaleLayoutProps extends LocaleParams {
	children: ReactNode;
}

/** Any other first segment is a missing page; the proxy has already added a locale to paths without one. */
export const dynamicParams: boolean = false;

export const generateStaticParams = (): { locale: LocaleSegment }[] => {
	return localeSegments.map((locale: LocaleSegment): { locale: LocaleSegment } => ({ locale }));
};

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));

	return {
		title: { template: `%s · ${translate('app.name')}`, default: translate('app.name') },
		description: translate('app.description'),
	};
};

const LocaleLayout = async ({ children, params }: LocaleLayoutProps): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf({ params });

	return (
		<html lang={localeTags[locale]}>
			<body>
				<AppProviders locale={localeTags[locale]} messages={messagesOf(locale)}>
					<AppShell locale={locale}>{children}</AppShell>
				</AppProviders>
			</body>
		</html>
	);
};

export default LocaleLayout;
