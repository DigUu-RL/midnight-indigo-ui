// Texts of the date and time pickers, shared by all of them: the component labels `datePicker`, translated by
// `I18nProvider` like the texts of the other components.

/** Texts of the pickers. Translate them with the rest of the interface. */
export interface DatePickerLabels {
	/** Name of the button that opens the calendar. */
	openCalendar: string;
	/** Name of the button that opens the lists of the time. */
	openTime: string;
	/** Name of the panel of a date, or of a date and a time. */
	dialog: string;
	/** Name of the panel of a range of dates. */
	rangeDialog: string;
	/** Name of the panel of a time. */
	timeDialog: string;
	/** Name of the button that shows the months before. */
	previousMonth: string;
	/** Name of the button that shows the months after. */
	nextMonth: string;
	/** Name of the list of the months. */
	month: string;
	/** Name of the list of the years. */
	year: string;
	/** Title of the list of the predefined dates or periods. */
	presets: string;
	today: string;
	tomorrow: string;
	/** A date some days from today, e.g. `'In 7 days'`. */
	inDays: (count: number) => string;
	/** A period of some days from today, e.g. `'Next 7 days'`. */
	nextDays: (count: number) => string;
	thisMonth: string;
	followingMonth: string;
	followingQuarter: string;
	followingYear: string;
	/** Empties the choice of the panel. */
	clear: string;
	/** Closes the panel without changing the value. */
	cancel: string;
	/** Closes the panel and keeps its choice. */
	apply: string;
	/** Name of the field of the first day of a range. */
	start: string;
	/** Name of the field of the last day of a range. */
	end: string;
	/** Added to the name of the first day of the chosen range. */
	rangeStart: string;
	/** Added to the name of the last day of the chosen range. */
	rangeEnd: string;
	/** Name of the list of the hours. */
	hours: string;
	/** Name of the list of the minutes. */
	minutes: string;
	/** Name of the list of AM and PM. */
	meridiem: string;
	/** Placeholder of the day in the field, e.g. `'dd'`. */
	dayPlaceholder: string;
	/** Placeholder of the month in the field, e.g. `'mm'`. */
	monthPlaceholder: string;
	/** Placeholder of the year in the field, e.g. `'yyyy'`: as many letters as digits. */
	yearPlaceholder: string;
	/** Placeholder of the hours in the field, e.g. `'hh'`. */
	hourPlaceholder: string;
	/** Placeholder of the minutes in the field, e.g. `'mm'`. */
	minutePlaceholder: string;
	/** Validation message of a field whose text is not a date that can be chosen. */
	invalid: string;
}

export const defaultDatePickerLabels: Readonly<DatePickerLabels> = Object.freeze({
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
	inDays: (count: number): string => `In ${String(count)} ${count === 1 ? 'day' : 'days'}`,
	nextDays: (count: number): string => `Next ${String(count)} ${count === 1 ? 'day' : 'days'}`,
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
});
