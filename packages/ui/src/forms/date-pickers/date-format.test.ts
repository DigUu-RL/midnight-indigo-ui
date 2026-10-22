import { enGB } from 'date-fns/locale/en-GB';
import { enUS } from 'date-fns/locale/en-US';
import { ptBR } from 'date-fns/locale/pt-BR';
import { describe, expect, it } from 'vitest';

import {
	fieldPatternOf,
	fieldPlaceholderOf,
	formatFieldValue,
	maskFieldText,
	parseFieldText,
} from '#src/forms/date-pickers/date-format.ts';
import type { FieldPattern } from '#src/forms/date-pickers/date-format.ts';
import { defaultDatePickerLabels } from '#src/forms/date-pickers/labels.ts';

const reference: Date = new Date(2026, 9, 21);

describe('the pattern of a field', (): void => {
	it('follows the order of the date and the clock of the locale', (): void => {
		expect(fieldPatternOf(enUS, 'date', undefined).format).toBe("MM'/'dd'/'yyyy");
		expect(fieldPatternOf(ptBR, 'date', undefined).format).toBe("dd'/'MM'/'yyyy");
		expect(fieldPatternOf(enUS, 'time', undefined).twelveHour).toBe(true);
		expect(fieldPatternOf(ptBR, 'time', undefined).twelveHour).toBe(false);
		expect(fieldPatternOf(enGB, 'dateTime', undefined).length).toBe('15/06/2071 09:30'.length);
		expect(fieldPatternOf(ptBR, 'time', true).twelveHour).toBe(true);
	});

	it('has a placeholder of the texts of the labels', (): void => {
		const pattern: FieldPattern = fieldPatternOf(ptBR, 'date', undefined);

		expect(fieldPlaceholderOf(pattern, defaultDatePickerLabels, ptBR)).toBe('dd/mm/yyyy');

		expect(
			fieldPlaceholderOf(
				fieldPatternOf(enUS, 'time', undefined),
				{ ...defaultDatePickerLabels, hourPlaceholder: 'HH' },
				enUS,
			),
		).toBe('HH:mm AM');
	});
});

describe('the text of a field', (): void => {
	const date: FieldPattern = fieldPatternOf(ptBR, 'date', undefined);
	const time: FieldPattern = fieldPatternOf(enUS, 'time', undefined);

	it('adds the separators as the digits are typed, and drops anything else', (): void => {
		expect(maskFieldText('1', date, ptBR)).toBe('1');
		expect(maskFieldText('15', date, ptBR)).toBe('15');
		expect(maskFieldText('150', date, ptBR)).toBe('15/0');
		expect(maskFieldText('15062071', date, ptBR)).toBe('15/06/2071');
		expect(maskFieldText('15/06/2071999', date, ptBR)).toBe('15/06/2071');
		expect(maskFieldText('1x5-0', date, ptBR)).toBe('15/0');
	});

	it('takes the meridiem from its first letter', (): void => {
		expect(maskFieldText('0930p', time, enUS)).toBe('09:30 PM');
		expect(maskFieldText('0930a', time, enUS)).toBe('09:30 AM');
	});

	it('is a value only when complete and real', (): void => {
		expect(parseFieldText('15/06/2071', date, ptBR, reference)).toEqual(new Date(2071, 5, 15));
		expect(parseFieldText('31/02/2026', date, ptBR, reference)).toBeNull();
		expect(parseFieldText('15/06/20', date, ptBR, reference)).toBeNull();

		expect(parseFieldText('09:30 PM', time, enUS, reference)).toEqual(
			new Date(2026, 9, 21, 21, 30),
		);
	});

	it('writes a value in the pattern', (): void => {
		expect(formatFieldValue(new Date(2071, 5, 15), date, ptBR)).toBe('15/06/2071');
		expect(formatFieldValue(new Date(2026, 0, 1, 0, 5), time, enUS)).toBe('12:05 AM');
	});
});
