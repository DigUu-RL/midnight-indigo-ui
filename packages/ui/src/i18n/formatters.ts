// Locale-aware formatting of numbers, currencies, dates, lists and file sizes, on top of `Intl`. The locale, the time
// zone and the currency are always given by the application: none is inferred from another, nor from the runtime, so
// the server and the browser produce the same text.

export interface FormattersOptions {
	/** BCP 47 tag, e.g. `'pt-BR'`. */
	locale: string;
	/** IANA time zone of the dates, e.g. `'America/Sao_Paulo'`. Required to format dates. */
	timeZone?: string | undefined;
	/** ISO 4217 code, e.g. `'BRL'`. Required to format currencies without a `currency` of their own. */
	currency?: string | undefined;
}

export interface Formatters {
	readonly locale: string;
	readonly timeZone: string | undefined;
	readonly currency: string | undefined;
	formatNumber: (value: number | bigint, options?: Intl.NumberFormatOptions) => string;
	/** Uses `options.currency`, or the currency of the formatters. */
	formatCurrency: (value: number | bigint, options?: Intl.NumberFormatOptions) => string;
	/** Uses `options.timeZone`, or the time zone of the formatters. */
	formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) => string;
	formatRelativeTime: (
		value: number,
		unit: Intl.RelativeTimeFormatUnit,
		options?: Intl.RelativeTimeFormatOptions,
	) => string;
	formatList: (items: readonly string[], options?: Intl.ListFormatOptions) => string;
	/** Bytes in the largest fitting unit up to gigabytes, e.g. `'1.5 MB'` (`'1,5 MB'` in `pt-BR`). */
	formatFileSize: (bytes: number) => string;
}

export class FormattersConfigurationError extends Error {
	override name: string = 'FormattersConfigurationError';
}

const fileSizeUnits: readonly string[] = ['byte', 'kilobyte', 'megabyte', 'gigabyte'];

/** Formatters for one locale. Each `Intl` object is created once per set of options and reused. */
export const createFormatters = ({ locale, timeZone, currency }: FormattersOptions): Formatters => {
	const cache: Map<string, unknown> = new Map<string, unknown>();

	const cached = <Format>(kind: string, options: object, create: () => Format): Format => {
		const key: string = `${kind}:${JSON.stringify(options)}`;

		if (!cache.has(key)) cache.set(key, create());
		return cache.get(key) as Format;
	};

	const numberFormat = (options: Intl.NumberFormatOptions): Intl.NumberFormat => {
		return cached(
			'number',
			options,
			(): Intl.NumberFormat => new Intl.NumberFormat(locale, options),
		);
	};

	const formatCurrency = (
		value: number | bigint,
		options: Intl.NumberFormatOptions = {},
	): string => {
		const code: string | undefined = options.currency ?? currency;

		if (code === undefined) {
			throw new FormattersConfigurationError(
				'[Midnight Indigo: UI] formatCurrency needs a currency: pass `currency` to the provider or to the call. ' +
					'It is never inferred from the locale.',
			);
		}

		return numberFormat({ ...options, style: 'currency', currency: code }).format(value);
	};

	const formatDate = (value: Date | number, options: Intl.DateTimeFormatOptions = {}): string => {
		const zone: string | undefined = options.timeZone ?? timeZone;

		if (zone === undefined) {
			throw new FormattersConfigurationError(
				'[Midnight Indigo: UI] formatDate needs a time zone: pass `timeZone` to the provider or to the call. ' +
					'The time zone of the runtime differs between the server and the browser.',
			);
		}

		const dateOptions: Intl.DateTimeFormatOptions = { ...options, timeZone: zone };

		return cached('date', dateOptions, (): Intl.DateTimeFormat => {
			return new Intl.DateTimeFormat(locale, dateOptions);
		}).format(value);
	};

	const formatRelativeTime = (
		value: number,
		unit: Intl.RelativeTimeFormatUnit,
		options: Intl.RelativeTimeFormatOptions = {},
	): string => {
		return cached('relative', options, (): Intl.RelativeTimeFormat => {
			return new Intl.RelativeTimeFormat(locale, options);
		}).format(value, unit);
	};

	const formatList = (items: readonly string[], options: Intl.ListFormatOptions = {}): string => {
		return cached(
			'list',
			options,
			(): Intl.ListFormat => new Intl.ListFormat(locale, options),
		).format(items);
	};

	const formatFileSize = (bytes: number): string => {
		const exponent: number = Math.min(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)), 3);
		const amount: number = bytes / 1024 ** exponent;

		// One decimal below 10 (1.5 MB), none above or for bytes (2 KB, not 2.0 KB). Bytes are spelled out, since their
		// short form is "byte" in English.
		return numberFormat({
			style: 'unit',
			unit: fileSizeUnits[exponent] ?? 'byte',
			unitDisplay: exponent === 0 ? 'long' : 'short',
			maximumFractionDigits: exponent === 0 || amount >= 10 ? 0 : 1,
		}).format(amount);
	};

	return Object.freeze({
		locale,
		timeZone,
		currency,
		formatNumber: (value: number | bigint, options: Intl.NumberFormatOptions = {}): string => {
			return numberFormat(options).format(value);
		},
		formatCurrency,
		formatDate,
		formatRelativeTime,
		formatList,
		formatFileSize,
	});
};
