'use client';
// Texts that a provider (e.g. `I18nProvider` of `@midnight-indigo/ui/i18n`) gives to every component below it. The
// components read them without depending on any translation library: their `labels` prop wins, then the provider,
// then the English defaults of the component.
import { createContext, use, useMemo } from 'react';
import type { Context, ReactElement, ReactNode } from 'react';

import type { CopyButtonLabels } from '@/src/buttons/copy-button/index';
import type { ChartLabels } from '@/src/charts/chart-labels/index';
import type { CodeBlockLabels } from '@/src/code/code-block/index';
import type { DashboardLayoutLabels } from '@/src/dashboard/dashboard-layout/index';
import type { FilterBarLabels } from '@/src/dashboard/filter-bar/index';
import type { CarouselLabels } from '@/src/data-display/carousel/index';
import type { DataTableLabels } from '@/src/data-display/data-table/index';
import type { ErrorStateLabels } from '@/src/data-display/error-state/index';
import type { LoadingStatusLabels } from '@/src/data-display/loading-status/index';
import type { StatCardLabels } from '@/src/data-display/stat-card/index';
import type { AlertLabels } from '@/src/feedback/alert/index';
import type { ConfirmDialogLabels } from '@/src/feedback/confirm-dialog/index';
import type { DialogLabels } from '@/src/feedback/dialog/index';
import type { DrawerLabels } from '@/src/feedback/drawer/index';
import type { ToastLabels } from '@/src/feedback/toast/index';
import type { ComboboxLabels } from '@/src/forms/combobox/index';
import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';
import type { ErrorSummaryLabels } from '@/src/forms/error-summary/index';
import type { FileUploadLabels } from '@/src/forms/file-upload/index';
import type { FormLabels } from '@/src/forms/form/index';
import type { FormFieldLabels } from '@/src/forms/form-field/index';
import type { NumberFieldLabels } from '@/src/forms/number-field/index';
import type { PasswordFieldLabels } from '@/src/forms/password-field/index';
import type { SearchFieldLabels } from '@/src/forms/search-field/index';
import type { TextAreaLabels } from '@/src/forms/text-area/index';
import type { BreadcrumbsLabels } from '@/src/navigation/breadcrumbs/index';
import type { LinkLabels } from '@/src/navigation/link/index';
import type { PaginationLabels } from '@/src/navigation/pagination/index';
import type { SidebarLabels } from '@/src/navigation/sidebar/index';
import type { TableOfContentsLabels } from '@/src/navigation/table-of-contents/index';

/** The labels type of each component that has translatable texts, by component name. */
export interface ComponentLabelTypes {
	alert: AlertLabels;
	breadcrumbs: BreadcrumbsLabels;
	carousel: CarouselLabels;
	chart: ChartLabels;
	codeBlock: CodeBlockLabels;
	combobox: ComboboxLabels;
	confirmDialog: ConfirmDialogLabels;
	copyButton: CopyButtonLabels;
	dashboardLayout: DashboardLayoutLabels;
	dataTable: DataTableLabels;
	datePicker: DatePickerLabels;
	dialog: DialogLabels;
	drawer: DrawerLabels;
	errorState: ErrorStateLabels;
	errorSummary: ErrorSummaryLabels;
	fileUpload: FileUploadLabels;
	filterBar: FilterBarLabels;
	form: FormLabels;
	formField: FormFieldLabels;
	link: LinkLabels;
	loadingStatus: LoadingStatusLabels;
	numberField: NumberFieldLabels;
	pagination: PaginationLabels;
	passwordField: PasswordFieldLabels;
	searchField: SearchFieldLabels;
	sidebar: SidebarLabels;
	statCard: StatCardLabels;
	tableOfContents: TableOfContentsLabels;
	textArea: TextAreaLabels;
	toast: ToastLabels;
}

export type ComponentName = keyof ComponentLabelTypes;

/** Texts for some or all components; a component without an entry, or a missing text, keeps its default. */
export type ComponentLabels = {
	readonly [Name in ComponentName]?: Partial<ComponentLabelTypes[Name]>;
};

const noLabels: ComponentLabels = Object.freeze({});

const ComponentLabelsContext: Context<ComponentLabels> = createContext<ComponentLabels>(noLabels);

export interface ComponentLabelsProviderProps {
	labels: ComponentLabels;
	children?: ReactNode;
}

/** Replaces the labels of an outer provider for the components below it. */
export const ComponentLabelsProvider = ({
	labels,
	children,
}: ComponentLabelsProviderProps): ReactElement => {
	return <ComponentLabelsContext value={labels}>{children}</ComponentLabelsContext>;
};

/** The texts of a component: its `labels` prop over those of the nearest provider, over its defaults. */
export const useComponentLabels = <Name extends ComponentName>(
	component: Name,
	defaults: Readonly<ComponentLabelTypes[Name]>,
	overrides: Partial<ComponentLabelTypes[Name]> | undefined,
): ComponentLabelTypes[Name] => {
	const provided: Partial<ComponentLabelTypes[Name]> | undefined =
		use(ComponentLabelsContext)[component];

	// The same object while its sources are the same, so that it can be a dependency of a memoized computation. The
	// defaults are complete, so the merge is too; TypeScript cannot spread a type indexed by a generic.
	return useMemo((): ComponentLabelTypes[Name] => {
		return { ...defaults, ...provided, ...overrides } as ComponentLabelTypes[Name];
	}, [defaults, provided, overrides]);
};
