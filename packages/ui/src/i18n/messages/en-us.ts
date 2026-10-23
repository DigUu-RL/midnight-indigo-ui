// English texts of the components, in the `midnight-indigo` namespace. Plain JSON with camelCase keys: `{{value}}`
// interpolates, an object of plural categories (`one`, `other`, plus `zero`, and `many` where the language has it)
// pluralizes on `count`, and an object of contexts (`ascending`, `descending`) picks a variant.
import type { LibraryMessages } from '@/src/i18n/library-messages';

export const englishMessages: LibraryMessages = {
	alert: {
		dismiss: 'Dismiss',
	},
	breadcrumbs: {
		navigation: 'Breadcrumb',
		expand: {
			one: 'Show {{count, number}} more level',
			other: 'Show {{count, number}} more levels',
		},
	},
	carousel: {
		carousel: 'carousel',
		slide: 'slide',
		previous: 'Previous slide',
		next: 'Next slide',
		slidePicker: 'Choose a slide',
		slidePosition: '{{position}} of {{total}}',
	},
	chart: {
		loading: 'Loading chart',
		empty: 'No data to show',
		error: 'The chart could not be loaded',
		retry: 'Try again',
		stale: 'This data may be out of date',
		legend: 'Series',
		showTable: 'Show data table',
		hideTable: 'Hide data table',
		category: 'Category',
		share: 'Share',
		zoomIn: 'Zoom in',
		zoomOut: 'Zoom out',
		resetZoom: 'Show all',
		navigationHelp:
			'Use the arrow keys to move between points, and Home or End to reach the first or the last.',
		zoomHelp: 'Press plus or minus to zoom.',
		selectHelp: 'Press Enter to select the point.',
		noValue: 'no value',
		seriesValue: '{{series}}: {{value}}',
		point: '{{category}}: {{values}} ({{position, number}} of {{total, number}})',
		categoryRange: {
			one: '{{count, number}} category: {{first}}.',
			other: '{{count, number}} categories, from {{first}} to {{last}}.',
		},
		seriesRange:
			'{{series}} ranges from {{lowest}} ({{lowestCategory}}) to {{highest}} ({{highestCategory}}).',
		seriesNoValues: '{{series}} has no values.',
		slice: '{{category}}: {{value}} ({{share}}).',
		total: 'Total: {{value}}.',
		gauge: '{{value}}, on a scale from {{minimum}} to {{maximum}}.',
		zoomRange: 'Showing {{first}} to {{last}}.',
	},
	codeBlock: {
		code: 'Code',
		files: 'Files',
		copy: 'Copy code',
	},
	combobox: {
		noOptions: 'No options',
		loading: 'Loading options',
		clear: 'Clear',
		open: 'Show options',
		close: 'Hide options',
		moreOptions: 'Showing {{shown, number}} of {{total, number}} options. Type to narrow the list.',
	},
	confirmDialog: {
		confirm: 'Confirm',
		cancel: 'Cancel',
	},
	copyButton: {
		copy: 'Copy',
		copied: 'Copied',
		failed: 'Could not copy',
	},
	dashboardLayout: {
		skipToContent: 'Skip to main content',
	},
	dataTable: {
		loading: 'Loading rows',
		empty: 'No rows yet',
		noResults: 'No rows match the filter',
		error: 'The rows could not be loaded',
		retry: 'Try again',
		sorted: {
			ascending: 'Sorted by {{column}}, ascending',
			descending: 'Sorted by {{column}}, descending',
		},
		rowRange: 'Rows {{first, number}} to {{last, number}} of {{total, number}}',
		resultCount: {
			zero: 'No rows',
			one: '{{count, number}} row',
			other: '{{count, number}} rows',
		},
		pagination: 'Pages of {{caption}}',
	},
	datePicker: {
		openCalendar: 'Choose a date',
		openTime: 'Choose a time',
		dialog: 'Calendar',
		rangeDialog: 'Choose a period',
		timeDialog: 'Choose a time',
		previousMonth: 'Show the previous month',
		nextMonth: 'Show the next month',
		month: 'Month',
		year: 'Year',
		presets: 'Periods',
		today: 'Today',
		tomorrow: 'Tomorrow',
		inDays: {
			one: 'In {{count, number}} day',
			other: 'In {{count, number}} days',
		},
		nextDays: {
			one: 'Next {{count, number}} day',
			other: 'Next {{count, number}} days',
		},
		thisMonth: 'This month',
		followingMonth: 'Next month',
		followingQuarter: 'Next quarter',
		followingYear: 'Next year',
		clear: 'Clear',
		cancel: 'Cancel',
		apply: 'Apply',
		start: 'Start',
		end: 'End',
		rangeStart: 'start of the period',
		rangeEnd: 'end of the period',
		hours: 'Hours',
		minutes: 'Minutes',
		meridiem: 'AM or PM',
		dayPlaceholder: 'dd',
		monthPlaceholder: 'mm',
		yearPlaceholder: 'yyyy',
		hourPlaceholder: 'hh',
		minutePlaceholder: 'mm',
		invalid: 'Enter a date that can be chosen.',
	},
	dialog: {
		close: 'Close',
	},
	drawer: {
		close: 'Close',
	},
	errorState: {
		retry: 'Try again',
	},
	errorSummary: {
		title: {
			one: 'There is {{count, number}} problem with this form',
			other: 'There are {{count, number}} problems with this form',
		},
	},
	fileUpload: {
		choose: {
			single: 'Choose a file',
			multiple: 'Choose files',
		},
		dropHint: 'or drop them here',
		acceptedTypes: 'Accepted types: {{types}}.',
		maxSize: 'Up to {{size}} each.',
		maxFiles: {
			one: 'Up to {{count, number}} file.',
			other: 'Up to {{count, number}} files.',
		},
		remove: 'Remove {{fileName}}',
		fileList: 'Chosen files',
		rejected: {
			type: '{{fileName}} was not added: this type is not accepted.',
			size: '{{fileName}} was not added: it is larger than {{size}}.',
			count: {
				one: '{{fileName}} was not added: the limit is {{count, number}} file.',
				other: '{{fileName}} was not added: the limit is {{count, number}} files.',
			},
		},
	},
	filterBar: {
		clear: 'Clear filters',
	},
	form: {
		submissionError: 'The form could not be sent. Try again.',
		constraint: {
			valueMissing: 'Fill in this field.',
			badValue: 'Enter a valid value.',
			tooShort: 'Enter a longer value.',
			tooLong: 'Enter a shorter value.',
			rangeUnderflow: 'Enter a larger value.',
			rangeOverflow: 'Enter a smaller value.',
			stepMismatch: 'Enter an allowed value.',
			invalid: 'Check this field.',
		},
	},
	formField: {
		loading: 'Loading',
	},
	link: {
		opensInNewTab: '(opens in a new tab)',
	},
	loadingStatus: {
		loading: 'Loading',
	},
	numberField: {
		increment: 'Increase',
		decrement: 'Decrease',
	},
	pagination: {
		navigation: 'Pagination',
		previous: 'Previous page',
		next: 'Next page',
		page: 'Page {{page}}',
		status: 'Page {{page}} of {{pageCount}}',
	},
	passwordField: {
		showPassword: 'Show password',
	},
	searchField: {
		clear: 'Clear search',
	},
	sidebar: {
		collapse: 'Collapse navigation',
		expand: 'Expand navigation',
		close: 'Close navigation',
		open: 'Open navigation',
	},
	statCard: {
		up: 'Up',
		down: 'Down',
		flat: 'No change',
		loading: 'Loading',
	},
	tableOfContents: {
		title: 'On this page',
	},
	textArea: {
		characterCount: {
			one: '{{count, number}} character',
			other: '{{count, number}} characters',
		},
		characterCountOfMaximum: {
			one: '{{current, number}} of {{count, number}} character',
			other: '{{current, number}} of {{count, number}} characters',
		},
	},
	toast: {
		region: 'Notifications',
		dismiss: 'Dismiss notification',
	},
};
