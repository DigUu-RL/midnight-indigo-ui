// The text of the fields of the pickers: the order of its parts and its separators come from the date-fns locale
// (`dd/MM/yyyy` in pt-BR, `MM/dd/yyyy` in en-US), the reader types the digits and the separators are added for them.
// A text is a value only when it is complete and names a real moment: `31/02/2026` is not.
import { format, isValid, parse } from 'date-fns';
import type { Locale } from 'date-fns';

import type { DatePickerLabels } from '#src/forms/date-pickers/labels.ts';

export type FieldKind = 'date' | 'time' | 'dateTime';

export type SegmentName = 'day' | 'month' | 'year' | 'hours' | 'minutes' | 'meridiem';

/** A part of the text typed with digits (or, for the meridiem, with a letter), of a fixed length. */
export interface Segment {
	name: SegmentName;
	length: number;
}

export type PatternPart = Segment | { separator: string };

export interface FieldPattern {
	parts: readonly PatternPart[];
	/** The date-fns format of the whole text. */
	format: string;
	/** Length of a complete text. */
	length: number;
	twelveHour: boolean;
}

const segmentFormats: Readonly<Record<SegmentName, (twelveHour: boolean) => string>> = {
	day: (): string => 'dd',
	month: (): string => 'MM',
	year: (): string => 'yyyy',
	hours: (twelveHour: boolean): string => (twelveHour ? 'hh' : 'HH'),
	minutes: (): string => 'mm',
	meridiem: (): string => 'aa',
};

const segmentLengths: Readonly<Record<SegmentName, number>> = {
	day: 2,
	month: 2,
	year: 4,
	hours: 2,
	minutes: 2,
	meridiem: 2,
};

const dateSegmentOf: Readonly<Record<string, SegmentName>> = { d: 'day', M: 'month', y: 'year' };

export const isSegment = (part: PatternPart): part is Segment => 'name' in part;

/** Whether the text ends with AM or PM: a time on a 12-hour clock. */
export const hasMeridiem = (pattern: FieldPattern): boolean => {
	return pattern.parts.some(
		(part: PatternPart): boolean => isSegment(part) && part.name === 'meridiem',
	);
};

/** The parts of the short date of the locale, e.g. day, `/`, month, `/`, year. */
const datePartsOf = (locale: Locale): PatternPart[] => {
	const written: string = locale.formatLong.date({ width: 'short' });
	const runs: string[] = written.match(/([dMy])\1*|[^dMy]+/g) ?? [];

	const parts: PatternPart[] = runs.flatMap((run: string): PatternPart[] => {
		const name: SegmentName | undefined = dateSegmentOf[run.charAt(0)];
		return name === undefined ? [{ separator: run }] : [{ name, length: segmentLengths[name] }];
	});

	// Only separators between two segments: a locale may end its date with a dot, or start it with a word.
	const firstSegment: number = parts.findIndex(isSegment);
	const lastSegment: number = parts.findLastIndex(isSegment);
	return parts.slice(firstSegment, lastSegment + 1);
};

/** Whether the locale writes its times on a 12-hour clock, e.g. `h:mm a` in en-US. */
export const usesTwelveHourClock = (locale: Locale): boolean => {
	const written: string = locale.formatLong.time({ width: 'short' });
	return /[ahK]/.test(written);
};

const timePartsOf = (twelveHour: boolean): PatternPart[] => {
	return [
		{ name: 'hours', length: 2 },
		{ separator: ':' },
		{ name: 'minutes', length: 2 },
		...(twelveHour ? [{ separator: ' ' }, { name: 'meridiem', length: 2 } as Segment] : []),
	];
};

/** The pattern of a field of the given kind in the locale; `ampm` overrides the clock of the locale. */
export const fieldPatternOf = (
	locale: Locale,
	kind: FieldKind,
	ampm: boolean | undefined,
): FieldPattern => {
	const twelveHour: boolean = ampm ?? usesTwelveHourClock(locale);

	const parts: PatternPart[] =
		kind === 'date'
			? datePartsOf(locale)
			: kind === 'time'
				? timePartsOf(twelveHour)
				: [...datePartsOf(locale), { separator: ' ' }, ...timePartsOf(twelveHour)];

	return {
		parts,
		format: parts
			.map((part: PatternPart): string => {
				return isSegment(part) ? segmentFormats[part.name](twelveHour) : `'${part.separator}'`;
			})
			.join(''),
		length: parts.reduce((total: number, part: PatternPart): number => {
			return total + (isSegment(part) ? part.length : part.separator.length);
		}, 0),
		twelveHour,
	};
};

/** The texts of AM and PM in the locale, e.g. `AM` and `PM`. */
export const meridiemTextsOf = (locale: Locale): readonly [string, string] => {
	return [
		format(new Date(2000, 0, 1, 9), 'aa', { locale }),
		format(new Date(2000, 0, 1, 21), 'aa', { locale }),
	];
};

/**
 * The text of the field as typed, with the separators the pattern adds: digits fill the numeric segments in order and a
 * letter fills the meridiem (`a` or `p`, whatever follows). Anything else is dropped. A separator is added only before
 * the character that follows it, so erasing one does not bring it back.
 */
export const maskFieldText = (typed: string, pattern: FieldPattern, locale: Locale): string => {
	const [morning, evening]: readonly [string, string] = meridiemTextsOf(locale);
	const characters: string[] = typed.match(/[\da-z]/gi) ?? [];

	const take = (segment: Segment): string => {
		if (segment.name === 'meridiem') {
			const letterIndex: number = characters.findIndex((character: string): boolean => {
				return /[a-z]/i.test(character);
			});

			if (letterIndex === -1) return '';
			const [letter = '']: string[] = characters.splice(0, letterIndex + 1).slice(-1);
			characters.splice(0, characters.length);
			return letter.toLowerCase() === evening.charAt(0).toLowerCase() ? evening : morning;
		}

		const digits: string[] = [];

		while (digits.length < segment.length && characters.length > 0) {
			const character: string = characters.shift() ?? '';
			if (/\d/.test(character)) digits.push(character);
		}

		return digits.join('');
	};

	return pattern.parts
		.reduce(
			(
				state: { text: string; done: boolean },
				part: PatternPart,
			): { text: string; done: boolean } => {
				if (state.done) return state;
				if (!isSegment(part)) return { text: `${state.text}${part.separator}`, done: false };
				const filled: string = take(part);
				const complete: boolean = filled.length === part.length;
				const text: string = `${state.text}${filled}`;
				return { text, done: !complete || characters.length === 0 };
			},
			{ text: '', done: false },
		)
		.text.replace(/[^\da-z]+$/i, '');
};

/** The moment a complete text names, keeping the date of `reference` for a time, or `null`. */
export const parseFieldText = (
	text: string,
	pattern: FieldPattern,
	locale: Locale,
	reference: Date,
): Date | null => {
	if (text.length !== pattern.length) return null;
	const parsed: Date = parse(text, pattern.format, reference, { locale });
	// `parse` rolls an impossible day over to the next month; writing it back tells it apart.
	return isValid(parsed) && format(parsed, pattern.format, { locale }) === text ? parsed : null;
};

export const formatFieldValue = (value: Date, pattern: FieldPattern, locale: Locale): string => {
	return format(value, pattern.format, { locale });
};

const placeholderSources: Readonly<Record<SegmentName, keyof DatePickerLabels | undefined>> = {
	day: 'dayPlaceholder',
	month: 'monthPlaceholder',
	year: 'yearPlaceholder',
	hours: 'hourPlaceholder',
	minutes: 'minutePlaceholder',
	meridiem: undefined,
};

/** The placeholder of a field, e.g. `mm/dd/yyyy` or `hh:mm AM`. */
export const fieldPlaceholderOf = (
	pattern: FieldPattern,
	labels: DatePickerLabels,
	locale: Locale,
): string => {
	return pattern.parts
		.map((part: PatternPart): string => {
			if (!isSegment(part)) return part.separator;
			const source: keyof DatePickerLabels | undefined = placeholderSources[part.name];
			const text: unknown = source === undefined ? undefined : labels[source];
			return typeof text === 'string' ? text : meridiemTextsOf(locale)[0];
		})
		.join('');
};
