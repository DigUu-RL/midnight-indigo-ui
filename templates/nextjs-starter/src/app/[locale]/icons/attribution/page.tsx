// Icon attribution (Server Component): credits the authors of the CC BY 4.0 sets, as their license requires, and lists
// the license of every other set. Generated from `src/icons/icon-sets.ts`, like `ICON-NOTICES.md`.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { Link } from '@midnight-indigo/ui/navigation';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import type { LocaleSegment } from '#src/i18n/locales.ts';
import { getTranslator, localeOf } from '#src/i18n/server.ts';
import type { LocaleParams } from '#src/i18n/server.ts';
import { iconSets } from '#src/icons/icon-sets.ts';
import type { IconSetEntry } from '#src/icons/icon-sets.ts';

export const generateMetadata = async (props: LocaleParams): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	return { title: translate('iconAttribution.header.title') };
};

const linkOrText = (text: string, url: string): ReactNode => {
	return url === '' ? (
		text
	) : (
		<Link href={url} external>
			{text}
		</Link>
	);
};

interface SetTableProps {
	caption: string;
	sets: readonly IconSetEntry[];
	translate: TFunction;
}

const SetTable = ({ caption, sets, translate }: SetTableProps): ReactElement => {
	return (
		<Table caption={caption}>
			<TableHead>
				<TableRow>
					<TableHeaderCell scope='col'>{translate('icons.sets.name')}</TableHeaderCell>
					<TableHeaderCell scope='col'>{translate('icons.sets.author')}</TableHeaderCell>
					<TableHeaderCell scope='col'>{translate('icons.sets.license')}</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{sets.map((set: IconSetEntry): ReactElement => {
					return (
						<TableRow key={set.prefix}>
							<TableHeaderCell scope='row'>
								{set.name} <code>{set.prefix}</code>
							</TableHeaderCell>

							<TableCell>{linkOrText(set.author, set.authorUrl)}</TableCell>
							<TableCell>{linkOrText(set.license, set.licenseUrl)}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

const IconAttributionPage = async (props: LocaleParams): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf(props);
	const translate: TFunction = await getTranslator(locale);

	const attributed: IconSetEntry[] = iconSets.filter((set: IconSetEntry): boolean => {
		return set.attributionRequired;
	});

	const others: IconSetEntry[] = iconSets.filter((set: IconSetEntry): boolean => {
		return !set.attributionRequired;
	});

	return (
		<>
			<PageHeader
				title={translate('iconAttribution.header.title')}
				description={translate('iconAttribution.header.description')}
				actions={
					<Link href={`/${locale}/icons`} variant='standalone'>
						{translate('iconAttribution.header.back')}
					</Link>
				}
			/>

			<Stack gap='8'>
				<SetTable
					caption={translate('iconAttribution.attributed', { count: attributed.length })}
					sets={attributed}
					translate={translate}
				/>

				<SetTable
					caption={translate('iconAttribution.others', { count: others.length })}
					sets={others}
					translate={translate}
				/>
			</Stack>
		</>
	);
};

export default IconAttributionPage;
