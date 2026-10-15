'use server';
// Server Actions of the customer form, standing in for a backend: nothing is stored. The form calls `validateCustomer`
// before submitting, so the messages appear next to the fields; `createCustomer` validates again, since a request can
// always skip the form.
import type { FormErrors } from '@midnight-indigo/ui/forms';
import type { TFunction } from 'i18next';

import { regions } from '#src/dashboard/demo-data.ts';
import type { Region } from '#src/dashboard/demo-data.ts';
import { defaultLocaleSegment, isLocaleSegment } from '#src/i18n/locales.ts';
import { getTranslator } from '#src/i18n/server.ts';

/** Addresses already registered, to show an error that only the server can find. */
const registeredEmails: ReadonlySet<string> = new Set<string>([
	'ana.souza@aurora.example',
	'bruno.lima@aurora.example',
]);

const latencyInMilliseconds: number = 400;
const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const textOf = (data: FormData, field: string): string => {
	const value: FormDataEntryValue | null = data.get(field);
	return typeof value === 'string' ? value.trim() : '';
};

const wait = async (): Promise<void> => {
	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, latencyInMilliseconds);
	});
};

/** The locale comes from the browser, so it is checked like any other input. */
const translatorFor = async (locale: string): Promise<TFunction> => {
	return getTranslator(isLocaleSegment(locale) ? locale : defaultLocaleSegment);
};

const errorsOf = (data: FormData, translate: TFunction): FormErrors => {
	const name: string = textOf(data, 'name');
	const email: string = textOf(data, 'email').toLowerCase();
	const phoneDigits: string = textOf(data, 'phone').replaceAll(/\D/g, '');
	const region: string = textOf(data, 'region');

	return {
		name: name.length < 3 ? translate('customers.errors.nameTooShort') : undefined,
		email: !emailPattern.test(email)
			? translate('customers.errors.emailInvalid')
			: registeredEmails.has(email)
				? translate('customers.errors.emailTaken')
				: undefined,
		phone:
			phoneDigits === '' || phoneDigits.length === 10 || phoneDigits.length === 11
				? undefined
				: translate('customers.errors.phone'),
		region: regions.includes(region as Region) ? undefined : translate('customers.errors.region'),
	};
};

const hasErrors = (errors: FormErrors): boolean => {
	return Object.values(errors).some(
		(message: string | undefined): boolean => message !== undefined,
	);
};

export const validateCustomer = async (locale: string, data: FormData): Promise<FormErrors> => {
	await wait();
	return errorsOf(data, await translatorFor(locale));
};

/** Resolves with the number of the new customer; rejects when the data is invalid. */
export const createCustomer = async (locale: string, data: FormData): Promise<string> => {
	await wait();

	if (hasErrors(errorsOf(data, await translatorFor(locale)))) {
		throw new Error('Invalid customer data.');
	}

	return `CLI-${String(Date.now()).slice(-6)}`;
};
