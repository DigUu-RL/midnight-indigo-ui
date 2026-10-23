// Appearance (Server Component): the palette editor, whose output is the `theme.json` the application is built with.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { PaletteEditor } from '@/src/appearance/palette-editor';
import { getTranslator, localeOf } from '@/src/i18n/server';
import type { LocaleParams } from '@/src/i18n/server';

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('appearance.header.title') };
};

const AppearancePage = async (props: LocaleParams): Promise<ReactElement> => {
	const translate: TFunction = await getTranslator(await localeOf(props));

	return (
		<>
			<PageHeader
				title={translate('appearance.header.title')}
				description={translate('appearance.header.description')}
			/>

			<PaletteEditor />
		</>
	);
};

export default AppearancePage;
