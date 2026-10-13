import { afterEach, describe, expect, it } from 'vitest';

import { createFormatters, FormattersConfigurationError } from '#src/i18n/formatters.ts';
import type { Formatters } from '#src/i18n/formatters.ts';

const originalTimeZone: string | undefined = process.env.TZ;

// A non-breaking space (U+00A0) or a narrow one (U+202F) separates some parts in `pt-BR`; compare with plain spaces.
const normalizeSpaces = (text: string): string => text.replaceAll(/[\u00A0\u202F]/g, ' ');

afterEach((): void => {
	process.env.TZ = originalTimeZone;
});

describe('createFormatters', (): void => {
	const brazilian: Formatters = createFormatters({
		locale: 'pt-BR',
		timeZone: 'America/Sao_Paulo',
		currency: 'BRL',
	});

	it('formats numbers, currencies and lists in the given locale', (): void => {
		expect(brazilian.formatNumber(1234567.891)).toBe('1.234.567,891');
		expect(brazilian.formatNumber(0.256, { style: 'percent' })).toBe('26%');
		expect(normalizeSpaces(brazilian.formatCurrency(1234.5))).toBe('R$ 1.234,50');

		expect(createFormatters({ locale: 'en-US', currency: 'USD' }).formatCurrency(1234.5)).toBe(
			'$1,234.50',
		);

		expect(brazilian.formatList(['vermelho', 'verde', 'azul'])).toBe('vermelho, verde e azul');
		expect(brazilian.formatRelativeTime(-1, 'day', { numeric: 'auto' })).toBe('ontem');
	});

	it('uses the currency of the call over the default one', (): void => {
		expect(normalizeSpaces(brazilian.formatCurrency(10, { currency: 'USD' }))).toBe('US$ 10,00');
	});

	it('never infers the currency from the locale', (): void => {
		const withoutCurrency: Formatters = createFormatters({ locale: 'pt-BR' });

		expect((): string => withoutCurrency.formatCurrency(10)).toThrow(FormattersConfigurationError);

		expect(normalizeSpaces(withoutCurrency.formatCurrency(10, { currency: 'EUR' }))).toBe(
			'€ 10,00',
		);
	});

	it('formats dates in the given time zone, whatever the time zone of the runtime', (): void => {
		const instant: Date = new Date('2026-10-13T02:30:00Z');
		const options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' };

		process.env.TZ = 'UTC';
		const onServer: string = brazilian.formatDate(instant, options);

		process.env.TZ = 'Asia/Tokyo';
		const inBrowser: string = brazilian.formatDate(instant, options);

		expect(onServer).toBe('12/10/2026, 23:30');
		expect(inBrowser).toBe(onServer);

		expect(brazilian.formatDate(instant, { ...options, timeZone: 'UTC' })).toBe(
			'13/10/2026, 02:30',
		);
	});

	it('requires a time zone for dates', (): void => {
		const withoutTimeZone: Formatters = createFormatters({ locale: 'en-US' });

		expect((): string => withoutTimeZone.formatDate(0)).toThrow(/needs a time zone/);
		expect(withoutTimeZone.formatDate(0, { timeZone: 'UTC', year: 'numeric' })).toBe('1970');
	});

	it('formats file sizes with locale-aware units', (): void => {
		const english: Formatters = createFormatters({ locale: 'en-US' });

		expect(english.formatFileSize(0)).toBe('0 bytes');
		expect(english.formatFileSize(1)).toBe('1 byte');
		expect(english.formatFileSize(512)).toBe('512 bytes');
		expect(english.formatFileSize(1536)).toBe('1.5 kB');
		expect(english.formatFileSize(20 * 1024 * 1024)).toBe('20 MB');
		expect(normalizeSpaces(brazilian.formatFileSize(1.5 * 1024 ** 3))).toBe('1,5 GB');
	});
});
