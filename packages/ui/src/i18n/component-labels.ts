// Builds the labels of every component from the `midnight-indigo` namespace of an i18next instance. A text whose key
// does not resolve for the locale (nor its fallbacks) is left out, so the component keeps its English default.
import type { i18n as I18nInstance, TFunction } from 'i18next';

import type {
	ComponentLabels,
	ComponentLabelTypes,
	ComponentName,
} from '#src/shared/component-labels/index.tsx';
import type { SortDirection } from '#src/data-display/row-processing/index.ts';
import type { FileLimits, FileRejection } from '#src/forms/file-upload/index.tsx';
import type { ValidatableElement } from '#src/forms/form/index.tsx';
import { constraintFailure } from '#src/forms/constraint-failure.ts';
import { libraryNamespace } from '#src/i18n/library-messages.ts';
import type { Formatters } from '#src/i18n/formatters.ts';

type InterpolationValues = Record<string, unknown>;

type DefinedLabels<Name extends ComponentName> = {
	[Key in keyof ComponentLabelTypes[Name]]: ComponentLabelTypes[Name][Key] | undefined;
};

interface Translator {
	/** A plain text, when its key resolves. */
	text: (key: string) => string | undefined;
	/** A message with values, when its key resolves for `sample` (e.g. a `count` that picks a plural form). */
	message: <Arguments extends unknown[]>(
		key: string,
		sample: InterpolationValues,
		values: (...parameters: Arguments) => InterpolationValues,
	) => ((...parameters: Arguments) => string) | undefined;
	/** Whether every key resolves, each for its own sample. */
	resolves: (...entries: [string, InterpolationValues][]) => boolean;
	translate: (key: string, values: InterpolationValues) => string;
}

const createTranslator = (instance: I18nInstance, locale: string): Translator => {
	const fixedTranslate: TFunction = instance.getFixedT(locale, libraryNamespace);

	const exists = (key: string, values: InterpolationValues): boolean => {
		return instance.exists(key, { ...values, lng: locale, ns: libraryNamespace });
	};

	const translate = (key: string, values: InterpolationValues): string => {
		return fixedTranslate(key, values);
	};

	return {
		text: (key: string): string | undefined => (exists(key, {}) ? translate(key, {}) : undefined),
		message: <Arguments extends unknown[]>(
			key: string,
			sample: InterpolationValues,
			values: (...parameters: Arguments) => InterpolationValues,
		): ((...parameters: Arguments) => string) | undefined => {
			return exists(key, sample)
				? (...parameters: Arguments): string => translate(key, values(...parameters))
				: undefined;
		},
		resolves: (...entries: [string, InterpolationValues][]): boolean => {
			return entries.every(([key, values]: [string, InterpolationValues]): boolean => {
				return exists(key, values);
			});
		},
		translate,
	};
};

const defined = <Name extends ComponentName>(
	labels: DefinedLabels<Name>,
): Partial<ComponentLabelTypes[Name]> => {
	return Object.fromEntries(
		Object.entries(labels).filter(([, value]: [string, unknown]): boolean => value !== undefined),
	) as Partial<ComponentLabelTypes[Name]>;
};

const fileUploadLabels = (
	{ text, message, resolves, translate }: Translator,
	{ formatList, formatFileSize }: Formatters,
): Partial<ComponentLabelTypes['fileUpload']> => {
	const limitSentences: boolean = resolves(
		['fileUpload.acceptedTypes', { types: '' }],
		['fileUpload.maxSize', { size: '' }],
		['fileUpload.maxFiles', { count: 2 }],
	);

	const rejections: boolean = resolves(
		['fileUpload.rejected', { context: 'type' }],
		['fileUpload.rejected', { context: 'size' }],
		['fileUpload.rejected', { context: 'count', count: 2 }],
	);

	const types = (accept: string): string => {
		return formatList(
			accept.split(',').map((type: string): string => type.trim()),
			{ type: 'unit', style: 'short' },
		);
	};

	return defined<'fileUpload'>({
		choose: resolves(
			['fileUpload.choose', { context: 'single' }],
			['fileUpload.choose', { context: 'multiple' }],
		)
			? (multiple: boolean): string => {
					return translate('fileUpload.choose', { context: multiple ? 'multiple' : 'single' });
				}
			: undefined,
		dropHint: text('fileUpload.dropHint'),
		limits: limitSentences
			? ({ accept, maxSize, maxFiles }: FileLimits, format: (bytes: number) => string): string => {
					return [
						accept === undefined
							? ''
							: translate('fileUpload.acceptedTypes', { types: types(accept) }),
						maxSize === undefined ? '' : translate('fileUpload.maxSize', { size: format(maxSize) }),
						maxFiles === undefined ? '' : translate('fileUpload.maxFiles', { count: maxFiles }),
					]
						.filter((sentence: string): boolean => sentence !== '')
						.join(' ');
				}
			: undefined,
		formatSize: formatFileSize,
		remove: message(
			'fileUpload.remove',
			{ fileName: '' },
			(fileName: string): InterpolationValues => {
				return { fileName };
			},
		),
		fileList: text('fileUpload.fileList'),
		rejected: rejections
			? (
					{ file, reason }: FileRejection,
					format: (bytes: number) => string,
					{ maxSize, maxFiles }: FileLimits,
				): string => {
					return translate('fileUpload.rejected', {
						context: reason,
						fileName: file.name,
						size: format(maxSize ?? 0),
						...(reason === 'count' ? { count: maxFiles ?? 0 } : {}),
					});
				}
			: undefined,
	});
};

const chartLabels = ({ text, message }: Translator): Partial<ComponentLabelTypes['chart']> => {
	return defined<'chart'>({
		loading: text('chart.loading'),
		empty: text('chart.empty'),
		error: text('chart.error'),
		retry: text('chart.retry'),
		stale: text('chart.stale'),
		legend: text('chart.legend'),
		showTable: text('chart.showTable'),
		hideTable: text('chart.hideTable'),
		category: text('chart.category'),
		share: text('chart.share'),
		zoomIn: text('chart.zoomIn'),
		zoomOut: text('chart.zoomOut'),
		resetZoom: text('chart.resetZoom'),
		navigationHelp: text('chart.navigationHelp'),
		zoomHelp: text('chart.zoomHelp'),
		selectHelp: text('chart.selectHelp'),
		noValue: text('chart.noValue'),
		seriesValue: message(
			'chart.seriesValue',
			{},
			(series: string, value: string): InterpolationValues => ({ series, value }),
		),
		point: message(
			'chart.point',
			{},
			(category: string, values: string, position: number, total: number): InterpolationValues => {
				return { category, values, position, total };
			},
		),
		categoryRange: message(
			'chart.categoryRange',
			{ count: 2 },
			(count: number, first: string, last: string): InterpolationValues => ({ count, first, last }),
		),
		seriesRange: message(
			'chart.seriesRange',
			{},
			(
				series: string,
				lowest: string,
				lowestCategory: string,
				highest: string,
				highestCategory: string,
			): InterpolationValues => {
				return { series, lowest, lowestCategory, highest, highestCategory };
			},
		),
		seriesNoValues: message('chart.seriesNoValues', {}, (series: string): InterpolationValues => {
			return { series };
		}),
		slice: message(
			'chart.slice',
			{},
			(category: string, value: string, share: string): InterpolationValues => {
				return { category, value, share };
			},
		),
		total: message('chart.total', {}, (value: string): InterpolationValues => ({ value })),
		gauge: message(
			'chart.gauge',
			{},
			(value: string, minimum: string, maximum: string): InterpolationValues => {
				return { value, minimum, maximum };
			},
		),
		zoomRange: message(
			'chart.zoomRange',
			{},
			(first: string, last: string): InterpolationValues => ({ first, last }),
		),
	});
};

/** The labels of every component for `locale`, from the `midnight-indigo` namespace of `instance`. */
export const createComponentLabels = (
	instance: I18nInstance,
	locale: string,
	formatters: Formatters,
): ComponentLabels => {
	const translator: Translator = createTranslator(instance, locale);
	const { text, message, resolves, translate }: Translator = translator;

	const errorSummaryTitle: ((count: number) => string) | undefined = message(
		'errorSummary.title',
		{ count: 2 },
		(count: number): InterpolationValues => ({ count }),
	);

	const constraintContexts: string[] = [
		'valueMissing',
		'badValue',
		'tooShort',
		'tooLong',
		'rangeUnderflow',
		'rangeOverflow',
		'stepMismatch',
		'invalid',
	];

	return {
		alert: defined<'alert'>({ dismiss: text('alert.dismiss') }),
		breadcrumbs: defined<'breadcrumbs'>({
			navigation: text('breadcrumbs.navigation'),
			expand: message('breadcrumbs.expand', { count: 2 }, (count: number): InterpolationValues => {
				return { count };
			}),
		}),
		carousel: defined<'carousel'>({
			carousel: text('carousel.carousel'),
			slide: text('carousel.slide'),
			previous: text('carousel.previous'),
			next: text('carousel.next'),
			slidePicker: text('carousel.slidePicker'),
			slidePosition: message(
				'carousel.slidePosition',
				{},
				(position: number, total: number): InterpolationValues => ({ position, total }),
			),
		}),
		chart: chartLabels(translator),
		combobox: defined<'combobox'>({
			noOptions: text('combobox.noOptions'),
			loading: text('combobox.loading'),
			clear: text('combobox.clear'),
			open: text('combobox.open'),
			close: text('combobox.close'),
			moreOptions: message(
				'combobox.moreOptions',
				{},
				(shown: number, total: number): InterpolationValues => ({ shown, total }),
			),
		}),
		confirmDialog: defined<'confirmDialog'>({
			confirm: text('confirmDialog.confirm'),
			cancel: text('confirmDialog.cancel'),
		}),
		dataTable: defined<'dataTable'>({
			loading: text('dataTable.loading'),
			empty: text('dataTable.empty'),
			noResults: text('dataTable.noResults'),
			error: text('dataTable.error'),
			retry: text('dataTable.retry'),
			sorted: resolves(
				['dataTable.sorted', { context: 'ascending' }],
				['dataTable.sorted', { context: 'descending' }],
			)
				? (column: string, direction: SortDirection): string => {
						return translate('dataTable.sorted', { context: direction, column });
					}
				: undefined,
			rowRange: message(
				'dataTable.rowRange',
				{},
				(first: number, last: number, total: number): InterpolationValues => {
					return { first, last, total };
				},
			),
			resultCount: message(
				'dataTable.resultCount',
				{ count: 2 },
				(count: number): InterpolationValues => {
					return { count };
				},
			),
			pagination: message('dataTable.pagination', {}, (caption: string): InterpolationValues => {
				return { caption };
			}),
		}),
		dialog: defined<'dialog'>({ close: text('dialog.close') }),
		drawer: defined<'drawer'>({ close: text('drawer.close') }),
		errorState: defined<'errorState'>({ retry: text('errorState.retry') }),
		errorSummary: defined<'errorSummary'>({ title: errorSummaryTitle }),
		fileUpload: fileUploadLabels(translator, formatters),
		form: defined<'form'>({
			title: errorSummaryTitle,
			constraint: resolves(
				...constraintContexts.map((context: string): [string, InterpolationValues] => {
					return ['form.constraint', { context }];
				}),
			)
				? ({ validity }: ValidatableElement): string => {
						return translate('form.constraint', { context: constraintFailure(validity) });
					}
				: undefined,
			submissionError: text('form.submissionError'),
		}),
		formField: defined<'formField'>({ loading: text('formField.loading') }),
		link: defined<'link'>({ opensInNewTab: text('link.opensInNewTab') }),
		loadingStatus: defined<'loadingStatus'>({ loading: text('loadingStatus.loading') }),
		numberField: defined<'numberField'>({
			increment: text('numberField.increment'),
			decrement: text('numberField.decrement'),
		}),
		pagination: defined<'pagination'>({
			navigation: text('pagination.navigation'),
			previous: text('pagination.previous'),
			next: text('pagination.next'),
			page: message('pagination.page', {}, (page: number): InterpolationValues => ({ page })),
			status: message(
				'pagination.status',
				{},
				(page: number, pageCount: number): InterpolationValues => ({ page, pageCount }),
			),
		}),
		passwordField: defined<'passwordField'>({ showPassword: text('passwordField.showPassword') }),
		searchField: defined<'searchField'>({ clear: text('searchField.clear') }),
		sidebar: defined<'sidebar'>({
			collapse: text('sidebar.collapse'),
			expand: text('sidebar.expand'),
			close: text('sidebar.close'),
			open: text('sidebar.open'),
		}),
		statCard: defined<'statCard'>({
			up: text('statCard.up'),
			down: text('statCard.down'),
			flat: text('statCard.flat'),
			loading: text('statCard.loading'),
		}),
		textArea: defined<'textArea'>({
			characterCount: resolves(
				['textArea.characterCount', { count: 2 }],
				['textArea.characterCountOfMaximum', { count: 2 }],
			)
				? (count: number, maximum: number | undefined): string => {
						return maximum === undefined
							? translate('textArea.characterCount', { count })
							: translate('textArea.characterCountOfMaximum', { count: maximum, current: count });
					}
				: undefined,
		}),
		toast: defined<'toast'>({ region: text('toast.region'), dismiss: text('toast.dismiss') }),
	};
};
