// Home of the component explorer (Server Component): every component of the library, by subpath, with what it is for.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import NextLink from 'next/link';
import type { ReactElement } from 'react';

import { camelCaseOf, slugOf, subpathGroups } from '#src/explorer/catalog.ts';
import type { ExplorerComponent, SubpathGroup } from '#src/explorer/catalog.ts';
import type { LocaleSegment } from '#src/i18n/locales.ts';
import { getTranslator, localeOf } from '#src/i18n/server.ts';
import type { LocaleParams } from '#src/i18n/server.ts';

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('explorer.header.title') };
};

const ExplorerHome = async ({ params }: LocaleParams): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf({ params });
	const translate: TFunction = await getTranslator(locale);

	return (
		<>
			<PageHeader
				title={translate('explorer.header.title')}
				description={translate('explorer.header.description')}
			/>

			{subpathGroups().map((group: SubpathGroup): ReactElement => {
				const headingId: string = `subpath-${group.subpath}`;

				return (
					<section key={group.subpath} className='explorer-section' aria-labelledby={headingId}>
						<h2 id={headingId} style={themeVariables.typography.headingMedium}>
							{translate(`explorer.subpaths.${camelCaseOf(group.subpath)}`)}
						</h2>

						<code className='explorer-subpath'>@midnight-indigo/ui/{group.subpath}</code>

						<ul className='explorer-cards'>
							{group.components.map((component: ExplorerComponent): ReactElement => {
								return (
									<li key={component.name}>
										<NextLink
											className='explorer-card'
											href={`/${locale}/components/${slugOf(component)}`}
										>
											<span className='explorer-card-name'>{component.name}</span>

											<span className='explorer-card-description'>
												{translate(`explorer.components.${camelCaseOf(component.name)}.summary`)}
											</span>
										</NextLink>
									</li>
								);
							})}
						</ul>
					</section>
				);
			})}
		</>
	);
};

export default ExplorerHome;
