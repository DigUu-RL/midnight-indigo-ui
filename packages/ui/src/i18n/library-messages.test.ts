import type { i18n as I18nInstance } from 'i18next';
import { describe, expect, it } from 'vitest';

import { defaultChartLabels } from '#src/charts/chart-labels/index.ts';
import { defaultDashboardLayoutLabels } from '#src/dashboard/dashboard-layout/index.tsx';
import { defaultFilterBarLabels } from '#src/dashboard/filter-bar/index.tsx';
import { defaultCarouselLabels } from '#src/data-display/carousel/index.tsx';
import { defaultDataTableLabels } from '#src/data-display/data-table/index.tsx';
import { defaultErrorStateLabels } from '#src/data-display/error-state/index.tsx';
import { defaultLoadingLabel } from '#src/data-display/loading-status/index.tsx';
import { defaultStatCardLabels } from '#src/data-display/stat-card/index.tsx';
import { defaultAlertLabels } from '#src/feedback/alert/index.tsx';
import { defaultConfirmDialogLabels } from '#src/feedback/confirm-dialog/index.tsx';
import { defaultDialogLabels } from '#src/feedback/dialog/index.tsx';
import { defaultDrawerLabels } from '#src/feedback/drawer/index.tsx';
import { defaultToastLabels } from '#src/feedback/toast/index.tsx';
import { defaultComboboxLabels } from '#src/forms/combobox/index.tsx';
import { defaultErrorSummaryLabels } from '#src/forms/error-summary/index.tsx';
import { defaultFileUploadLabels } from '#src/forms/file-upload/index.tsx';
import type { FileLimits } from '#src/forms/file-upload/index.tsx';
import { defaultFormLabels } from '#src/forms/form/index.tsx';
import { defaultFormFieldLabels } from '#src/forms/form-field/index.tsx';
import { defaultNumberFieldLabels } from '#src/forms/number-field/index.tsx';
import { defaultPasswordFieldLabels } from '#src/forms/password-field/index.tsx';
import { defaultSearchFieldLabels } from '#src/forms/search-field/index.tsx';
import { defaultTextAreaLabels } from '#src/forms/text-area/index.tsx';
import { defaultBreadcrumbsLabels } from '#src/navigation/breadcrumbs/index.tsx';
import { defaultLinkLabels } from '#src/navigation/link/index.tsx';
import { defaultPaginationLabels } from '#src/navigation/pagination/index.tsx';
import { defaultSidebarLabels } from '#src/navigation/sidebar/index.tsx';
import type {
	ComponentLabels,
	ComponentLabelTypes,
	ComponentName,
} from '#src/shared/component-labels/index.tsx';
import { createComponentLabels } from '#src/i18n/component-labels.ts';
import { createI18n } from '#src/i18n/create-i18n.ts';
import { createFormatters } from '#src/i18n/formatters.ts';
import { libraryNamespace, libraryResources } from '#src/i18n/library-messages.ts';
import type { LibraryMessages, Messages } from '#src/i18n/library-messages.ts';
import { englishMessages } from '#src/i18n/messages/en-us.ts';

type Defaults = { [Name in ComponentName]: Readonly<ComponentLabelTypes[Name]> };

const defaults: Defaults = {
	alert: defaultAlertLabels,
	breadcrumbs: defaultBreadcrumbsLabels,
	carousel: defaultCarouselLabels,
	chart: defaultChartLabels,
	combobox: defaultComboboxLabels,
	confirmDialog: defaultConfirmDialogLabels,
	dashboardLayout: defaultDashboardLayoutLabels,
	dataTable: defaultDataTableLabels,
	dialog: defaultDialogLabels,
	drawer: defaultDrawerLabels,
	errorState: defaultErrorStateLabels,
	errorSummary: defaultErrorSummaryLabels,
	fileUpload: defaultFileUploadLabels,
	filterBar: defaultFilterBarLabels,
	form: defaultFormLabels,
	formField: defaultFormFieldLabels,
	link: defaultLinkLabels,
	loadingStatus: { loading: defaultLoadingLabel },
	numberField: defaultNumberFieldLabels,
	pagination: defaultPaginationLabels,
	passwordField: defaultPasswordFieldLabels,
	searchField: defaultSearchFieldLabels,
	sidebar: defaultSidebarLabels,
	statCard: defaultStatCardLabels,
	textArea: defaultTextAreaLabels,
	toast: defaultToastLabels,
};

const pluralCategories: readonly string[] = ['zero', 'one', 'two', 'few', 'many', 'other'];
const camelCase: RegExp = /^[a-z][\dA-Za-z]*$/;

const shippedLocales: string[] = Object.keys(libraryResources);

const messagesOf = (locale: string): LibraryMessages => {
	return libraryResources[locale]?.[libraryNamespace] as LibraryMessages;
};

const isPlural = (messages: Messages): boolean => {
	return Object.keys(messages).every((key: string): boolean => pluralCategories.includes(key));
};

/** Paths of the messages, with a plural object as one entry holding the categories it has. */
const keysOf = (messages: Messages, prefix: string = ''): Map<string, Set<string>> => {
	const keys: Map<string, Set<string>> = new Map<string, Set<string>>();

	Object.entries(messages).forEach(([key, value]: [string, string | Messages]): void => {
		const path: string = `${prefix}${key}`;

		if (typeof value === 'string') {
			keys.set(path, new Set<string>());
			return;
		}

		if (isPlural(value)) {
			keys.set(path, new Set<string>(Object.keys(value)));
			return;
		}

		keysOf(value, `${path}.`).forEach((categories: Set<string>, nestedPath: string): void => {
			keys.set(nestedPath, categories);
		});
	});

	return keys;
};

const allKeys = (messages: Messages): string[] => {
	return Object.entries(messages).flatMap(([key, value]: [string, string | Messages]): string[] => {
		return typeof value === 'string' ? [key] : [key, ...allKeys(value)];
	});
};

const singleLocale = async (locale: string): Promise<I18nInstance> => {
	return createI18n({ locale, fallbackLocale: locale, onMissingKey: (): void => undefined });
};

const labelsFor = async (locale: string): Promise<ComponentLabels> => {
	return createComponentLabels(await singleLocale(locale), locale, createFormatters({ locale }));
};

describe('library messages', (): void => {
	it('ship pt-BR and en-US as plain JSON', (): void => {
		expect(shippedLocales.toSorted()).toEqual(['en-US', 'pt-BR']);

		shippedLocales.forEach((locale: string): void => {
			const messages: Messages | undefined = libraryResources[locale]?.[libraryNamespace];
			expect(JSON.parse(JSON.stringify(messages))).toEqual(messages);
		});
	});

	it('use only camelCase keys, with plurals and contexts as nested objects', (): void => {
		shippedLocales.forEach((locale: string): void => {
			expect(
				allKeys(messagesOf(locale)).filter((key: string): boolean => !camelCase.test(key)),
			).toEqual([]);
		});
	});

	it('cover every component in every shipped locale', (): void => {
		shippedLocales.forEach((locale: string): void => {
			expect(Object.keys(messagesOf(locale)).toSorted(), locale).toEqual(
				Object.keys(defaults).toSorted(),
			);
		});
	});

	it('have the same keys in every locale, and every plural category of each language', (): void => {
		shippedLocales.forEach((locale: string): void => {
			const required: string[] = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;

			(Object.keys(englishMessages) as ComponentName[]).forEach(
				(component: ComponentName): void => {
					const english: Map<string, Set<string>> = keysOf(englishMessages[component]);
					const translated: Map<string, Set<string>> = keysOf(messagesOf(locale)[component]);

					expect([...translated.keys()], `${locale} ${component}`).toEqual([...english.keys()]);

					english.forEach((categories: Set<string>, key: string): void => {
						if (categories.size === 0) return;

						const found: Set<string> = translated.get(key) ?? new Set<string>();

						required.forEach((category: string): void => {
							expect(found.has(category), `${locale} ${component}.${key}_${category}`).toBe(true);
						});
					});
				},
			);
		});
	});

	it('translate every label of every component, with no fallback', async (): Promise<void> => {
		for (const locale of shippedLocales) {
			const labels: ComponentLabels = await labelsFor(locale);

			(Object.keys(defaults) as ComponentName[]).forEach((component: ComponentName): void => {
				expect(Object.keys(labels[component] ?? {}).toSorted(), `${locale} ${component}`).toEqual(
					Object.keys(defaults[component]).toSorted(),
				);
			});
		}
	});

	it('in English, read as the defaults of the components', async (): Promise<void> => {
		const labels: ComponentLabels = await labelsFor('en-US');

		const strings = (component: ComponentName): [string, unknown][] => {
			return Object.entries(defaults[component]).filter(([, value]: [string, unknown]): boolean => {
				return typeof value === 'string';
			});
		};

		(Object.keys(defaults) as ComponentName[]).forEach((component: ComponentName): void => {
			expect(Object.entries(labels[component] ?? {}), component).toEqual(
				expect.arrayContaining(strings(component)),
			);
		});

		const limits: FileLimits = { accept: '.png,.pdf', maxSize: 2 * 1024 * 1024, maxFiles: 3 };

		expect(labels.breadcrumbs?.expand?.(1)).toBe(defaultBreadcrumbsLabels.expand(1));
		expect(labels.breadcrumbs?.expand?.(4)).toBe(defaultBreadcrumbsLabels.expand(4));
		expect(labels.carousel?.slidePosition?.(2, 5)).toBe(defaultCarouselLabels.slidePosition(2, 5));

		expect(labels.chart?.point?.('Mar', 'Revenue: 40', 3, 12)).toBe(
			defaultChartLabels.point('Mar', 'Revenue: 40', 3, 12),
		);

		[1, 12].forEach((count: number): void => {
			expect(labels.chart?.categoryRange?.(count, 'Jan', 'Dec')).toBe(
				defaultChartLabels.categoryRange(count, 'Jan', 'Dec'),
			);
		});

		expect(labels.chart?.seriesRange?.('Revenue', '10', 'Jan', '45', 'Mar')).toBe(
			defaultChartLabels.seriesRange('Revenue', '10', 'Jan', '45', 'Mar'),
		);

		expect(labels.chart?.gauge?.('62', '0', '100')).toBe(
			defaultChartLabels.gauge('62', '0', '100'),
		);

		expect(labels.combobox?.moreOptions?.(100, 250)).toBe(
			defaultComboboxLabels.moreOptions(100, 250),
		);

		expect(labels.dataTable?.sorted?.('Name', 'descending')).toBe('Sorted by Name, descending');

		expect(labels.dataTable?.rowRange?.(11, 20, 95)).toBe(
			defaultDataTableLabels.rowRange(11, 20, 95),
		);

		[0, 1, 7].forEach((count: number): void => {
			expect(labels.dataTable?.resultCount?.(count)).toBe(
				defaultDataTableLabels.resultCount(count),
			);

			expect(labels.errorSummary?.title?.(count)).toBe(defaultErrorSummaryLabels.title(count));
		});

		expect(labels.form?.title?.(2)).toBe(defaultFormLabels.title(2));

		expect(labels.dataTable?.pagination?.('Orders')).toBe(
			defaultDataTableLabels.pagination('Orders'),
		);

		expect(labels.fileUpload?.choose?.(true)).toBe(defaultFileUploadLabels.choose(true));
		expect(labels.fileUpload?.choose?.(false)).toBe(defaultFileUploadLabels.choose(false));
		expect(labels.fileUpload?.remove?.('a.pdf')).toBe(defaultFileUploadLabels.remove('a.pdf'));
		expect(labels.fileUpload?.formatSize?.(1536)).toBe('1.5 kB');

		expect(
			labels.fileUpload?.limits?.(limits, (bytes: number): string => `${String(bytes)} B`),
		).toBe('Accepted types: .png, .pdf. Up to 2097152 B each. Up to 3 files.');

		expect(
			labels.fileUpload?.rejected?.(
				{ file: new File([], 'big.pdf'), reason: 'size' },
				(): string => '2 MB',
				limits,
			),
		).toBe('big.pdf was not added: it is larger than 2 MB.');

		expect(labels.pagination?.page?.(3)).toBe(defaultPaginationLabels.page(3));
		expect(labels.pagination?.status?.(3, 9)).toBe(defaultPaginationLabels.status(3, 9));

		expect(labels.textArea?.characterCount?.(12, 200)).toBe(
			defaultTextAreaLabels.characterCount(12, 200),
		);

		expect(labels.textArea?.characterCount?.(12, undefined)).toBe('12 characters');
	});

	it('in Portuguese, pluralize and format numbers', async (): Promise<void> => {
		const labels: ComponentLabels = await labelsFor('pt-BR');

		expect(labels.chart?.categoryRange?.(1, 'T1', 'T1')).toBe('1 categoria: T1.');

		expect(labels.chart?.categoryRange?.(1200, 'T1', 'T4')).toBe('1.200 categorias, de T1 a T4.');

		expect(labels.dataTable?.resultCount?.(0)).toBe('Nenhuma linha');
		expect(labels.dataTable?.resultCount?.(1)).toBe('1 linha');
		expect(labels.dataTable?.resultCount?.(12345)).toBe('12.345 linhas');
		expect(labels.dataTable?.resultCount?.(2_000_000)).toBe('2.000.000 de linhas');
		expect(labels.dataTable?.sorted?.('Nome', 'ascending')).toBe('Ordenado por Nome, crescente');
		expect(labels.errorSummary?.title?.(1)).toBe('Há 1 problema neste formulário');
		expect(labels.fileUpload?.formatSize?.(1536)).toBe('1,5 kB');

		expect(
			labels.fileUpload?.rejected?.({ file: new File([], 'c.png'), reason: 'count' }, String, {
				accept: undefined,
				maxSize: undefined,
				maxFiles: 1,
			}),
		).toBe('c.png não foi adicionado: o limite é 1 arquivo.');
	});
});
