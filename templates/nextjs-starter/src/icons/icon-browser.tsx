// The parts of the icon browser (Server Components). The state lives in the URL (`?q=&set=&license=&page=&icon=`) and
// the form is a plain GET form, so searching, paging and choosing an icon work without JavaScript, and every icon is
// sent as inline SVG: the sets never reach the browser.
import { Button } from '@midnight-indigo/ui/buttons';
import { DashboardPanel } from '@midnight-indigo/ui/dashboard';
import {
	EmptyState,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import { Select, TextField } from '@midnight-indigo/ui/forms';
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData, IconSize } from '@midnight-indigo/ui/icons';
import { Grid, Stack } from '@midnight-indigo/ui/layout';
import { Link } from '@midnight-indigo/ui/navigation';
import { themeVariables } from '@midnight-indigo/ui/theme';
import { semanticIntents } from '@midnight-indigo/ui/tokens';
import type { SemanticIntent } from '@midnight-indigo/ui/tokens';
import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';

import { CopyCodeButton } from '#src/icons/copy-code-button.tsx';
import { iconNameOf } from '#src/icons/icon-catalog.ts';
import type { IconSearchResult, LoadedIcon } from '#src/icons/icon-catalog.ts';
import { iconSets } from '#src/icons/icon-sets.ts';
import type { IconSetEntry } from '#src/icons/icon-sets.ts';
import { dataSnippetOf, nameSnippetOf } from '#src/icons/icon-snippets.ts';

export interface IconBrowserQuery {
	query: string;
	prefix: string | undefined;
	license: string | undefined;
	page: number;
	/** `prefix:name` of the icon shown in detail. */
	selected: string | undefined;
}

export type SearchParameters = Record<string, string | string[] | undefined>;

const firstValue = (value: string | string[] | undefined): string => {
	return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
};

const knownLicenses: readonly string[] = [
	...new Set(iconSets.map((set: IconSetEntry): string => set.license)),
].toSorted();

export const parseIconBrowserQuery = (parameters: SearchParameters): IconBrowserQuery => {
	const prefix: string = firstValue(parameters.set);
	const license: string = firstValue(parameters.license);
	const page: number = Number.parseInt(firstValue(parameters.page), 10);
	const selected: string = firstValue(parameters.icon);

	return {
		query: firstValue(parameters.q).slice(0, 100),
		prefix: iconSets.some((set: IconSetEntry): boolean => set.prefix === prefix)
			? prefix
			: undefined,
		license: knownLicenses.includes(license) ? license : undefined,
		page: Number.isFinite(page) && page > 0 ? page : 1,
		selected: selected === '' ? undefined : selected,
	};
};

/** Whether the browser lists icons, rather than the sets. */
export const isSearching = (query: IconBrowserQuery): boolean => {
	return query.query !== '' || query.prefix !== undefined || query.license !== undefined;
};

/** URL of the browser with some of its state changed; the page goes back to 1 unless it is given. */
export const hrefOf = (query: IconBrowserQuery, changes: Partial<IconBrowserQuery>): string => {
	const next: IconBrowserQuery = { ...query, page: 1, ...changes };

	const entries: [string, string][] = [
		['q', next.query],
		['set', next.prefix ?? ''],
		['license', next.license ?? ''],
		['page', next.page > 1 ? String(next.page) : ''],
		['icon', next.selected ?? ''],
	];

	const search: string = new URLSearchParams(
		entries.filter(([, value]: [string, string]): boolean => value !== ''),
	).toString();

	return search === '' ? '?' : `?${search}`;
};

interface TranslatedProps {
	translate: TFunction;
}

interface QueryProps extends TranslatedProps {
	query: IconBrowserQuery;
}

export const IconSearchForm = ({ query, translate }: QueryProps): ReactElement => {
	return (
		<form method='get' role='search' aria-label={translate('icons.search.title')}>
			<Grid columns={{ compact: 1, medium: 3 }} gap='4'>
				<TextField
					label={translate('icons.search.query')}
					description={translate('icons.search.queryDescription')}
					name='q'
					enterKeyHint='search'
					defaultValue={query.query}
					autoComplete='off'
					spellCheck={false}
				/>

				<Select
					label={translate('icons.search.set')}
					name='set'
					placeholder={translate('icons.search.allSets')}
					defaultValue={query.prefix ?? ''}
					options={iconSets.map((set: IconSetEntry): { value: string; label: string } => {
						return { value: set.prefix, label: `${set.name} (${set.prefix})` };
					})}
				/>

				<Select
					label={translate('icons.search.license')}
					name='license'
					placeholder={translate('icons.search.allLicenses')}
					defaultValue={query.license ?? ''}
					options={knownLicenses.map((license: string): { value: string; label: string } => {
						return { value: license, label: license };
					})}
				/>
			</Grid>

			<Stack direction='row' gap='2' wrap style={{ marginBlockStart: themeVariables.spacing[4] }}>
				<Button type='submit'>{translate('icons.search.submit')}</Button>

				{isSearching(query) ? (
					<Link href='?' variant='standalone'>
						{translate('icons.search.clear')}
					</Link>
				) : null}
			</Stack>
		</form>
	);
};

export const IconSetTable = ({ query, translate }: QueryProps): ReactElement => {
	return (
		<Table caption={translate('icons.sets.caption')}>
			<TableHead>
				<TableRow>
					<TableHeaderCell scope='col'>{translate('icons.sets.name')}</TableHeaderCell>
					<TableHeaderCell scope='col'>{translate('icons.sets.license')}</TableHeaderCell>

					<TableHeaderCell scope='col' align='end'>
						{translate('icons.sets.icons')}
					</TableHeaderCell>

					<TableHeaderCell scope='col'>{translate('icons.sets.author')}</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{iconSets.map((set: IconSetEntry): ReactElement => {
					return (
						<TableRow key={set.prefix}>
							<TableHeaderCell scope='row'>
								<Link href={hrefOf(query, { prefix: set.prefix })}>{set.name}</Link>{' '}
								<code>{set.prefix}</code>
							</TableHeaderCell>

							<TableCell>{set.license}</TableCell>
							<TableCell align='end'>{translate('icons.count', { count: set.total })}</TableCell>
							<TableCell>{set.author}</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

interface IconResultsProps extends QueryProps {
	result: IconSearchResult;
	icons: LoadedIcon[];
}

export const IconResults = ({
	query,
	result,
	icons,
	translate,
}: IconResultsProps): ReactElement => {
	if (result.total === 0) {
		return (
			<EmptyState
				title={translate('icons.results.emptyTitle')}
				description={translate('icons.results.emptyDescription')}
			/>
		);
	}

	const page: number = Math.min(query.page, result.pageCount);

	return (
		<section aria-labelledby='icon-results-heading'>
			<h2 id='icon-results-heading' style={themeVariables.typography.headingSmall}>
				{translate('icons.results.summary', { count: result.total })}
			</h2>

			<ul className='icon-grid'>
				{icons.map(({ match, data }: LoadedIcon): ReactElement => {
					const name: string = iconNameOf(match);

					return (
						<li key={name}>
							<a
								className='icon-tile'
								href={hrefOf(query, { page, selected: name })}
								aria-current={query.selected === name ? 'true' : undefined}
							>
								<IconifyIcon icon={data} decorative size='large' />
								<span className='truncate'>{match.name}</span>

								{query.prefix === undefined ? (
									<span className='icon-tile-set'>{match.prefix}</span>
								) : null}
							</a>
						</li>
					);
				})}
			</ul>

			{result.pageCount > 1 ? (
				<nav aria-label={translate('icons.results.pages')} className='icon-pages'>
					{page > 1 ? (
						<Link href={hrefOf(query, { page: page - 1 })} variant='standalone'>
							{translate('icons.results.previous')}
						</Link>
					) : null}

					<span>{translate('icons.results.page', { page, pageCount: result.pageCount })}</span>

					{page < result.pageCount ? (
						<Link href={hrefOf(query, { page: page + 1 })} variant='standalone'>
							{translate('icons.results.next')}
						</Link>
					) : null}
				</nav>
			) : null}
		</section>
	);
};

const previewSizes: readonly Exclude<IconSize, 'inherit'>[] = ['small', 'medium', 'large'];

interface IconDetailsProps extends TranslatedProps {
	set: IconSetEntry;
	name: string;
	data: IconifyIconData;
}

export const IconDetails = ({ set, name, data, translate }: IconDetailsProps): ReactElement => {
	const dataSnippet: string = dataSnippetOf(set, name, data);
	const nameSnippet: string = nameSnippetOf(set, name);

	return (
		<DashboardPanel
			title={`${set.prefix}:${name}`}
			headingLevel={2}
			description={translate('icons.details.source', {
				set: set.name,
				author: set.author,
				license: set.license,
			})}
		>
			<Stack gap='6'>
				{set.attributionRequired ? <p>{translate('icons.details.attribution')}</p> : null}
				{set.palette ? <p>{translate('icons.details.palette')}</p> : null}

				<Stack direction={{ compact: 'column', medium: 'row' }} gap='8' wrap>
					<figure className='icon-preview'>
						<div className='icon-preview-samples'>
							{previewSizes.map((size: Exclude<IconSize, 'inherit'>): ReactElement => {
								return <IconifyIcon key={size} icon={data} decorative size={size} />;
							})}
						</div>

						<figcaption>{translate('icons.details.sizes')}</figcaption>
					</figure>

					<figure className='icon-preview'>
						<div className='icon-preview-samples'>
							{semanticIntents.map((intent: SemanticIntent): ReactElement => {
								return (
									<IconifyIcon
										key={intent}
										icon={data}
										label={translate(`appearance.intents.${intent}`)}
										size='large'
										style={{ color: themeVariables.intent[intent].text }}
									/>
								);
							})}
						</div>

						<figcaption>{translate('icons.details.intents')}</figcaption>
					</figure>
				</Stack>

				<section aria-labelledby='icon-data-snippet'>
					<h3 id='icon-data-snippet' style={themeVariables.typography.headingSmall}>
						{translate('icons.snippets.dataTitle')}
					</h3>

					<p>{translate('icons.snippets.dataDescription')}</p>

					<pre className='code-block' tabIndex={0}>
						<code>{dataSnippet}</code>
					</pre>

					<CopyCodeButton code={dataSnippet} label={translate('icons.snippets.copyData')} />
				</section>

				<section aria-labelledby='icon-name-snippet'>
					<h3 id='icon-name-snippet' style={themeVariables.typography.headingSmall}>
						{translate('icons.snippets.nameTitle')}
					</h3>

					<p>{translate('icons.snippets.nameDescription')}</p>

					<pre className='code-block' tabIndex={0}>
						<code>{nameSnippet}</code>
					</pre>

					<CopyCodeButton code={nameSnippet} label={translate('icons.snippets.copyName')} />
				</section>
			</Stack>
		</DashboardPanel>
	);
};
