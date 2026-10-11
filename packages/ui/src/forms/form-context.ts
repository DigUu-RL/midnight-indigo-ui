'use client';
// State that `Form` shares with the fields inside it: the submission status and the error of each field name.
import { createContext, useContext } from 'react';
import type { Context } from 'react';

/**
 * `validating` and `submitting` are in progress; `invalid` means validation failed and nothing was sent; `success`
 * and `error` are the outcome of `onSubmit`.
 */
export type FormStatus = 'idle' | 'validating' | 'invalid' | 'submitting' | 'success' | 'error';

/** Error messages by field `name`; a field without an entry, or with `undefined`, is valid. */
export type FormErrors = Readonly<Record<string, string | undefined>>;

export interface FormSubmission {
	status: FormStatus;
	errors: FormErrors;
	/** Validation or submission is running. */
	pending: boolean;
}

export const FormContext: Context<FormSubmission | null> = createContext<FormSubmission | null>(
	null,
);

const outsideForm: FormSubmission = Object.freeze({ status: 'idle', errors: {}, pending: false });

/** Status and errors of the enclosing `Form`; outside a `Form` it is always `idle`, without errors. */
export const useFormSubmission = (): FormSubmission => useContext(FormContext) ?? outsideForm;

/** The error that the enclosing `Form` holds for `name`. */
export const useFormError = (name: string | undefined): string | undefined => {
	const { errors }: FormSubmission = useFormSubmission();
	return name === undefined ? undefined : errors[name];
};
