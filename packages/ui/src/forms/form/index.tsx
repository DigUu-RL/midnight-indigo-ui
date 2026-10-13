'use client';
// `<form>` that validates on submit (native constraints plus an optional sync or async function), shows an error
// summary, tracks the submission and shares the errors with its fields.
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import type {
	ComponentPropsWithRef,
	FocusEvent,
	SubmitEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { Glyph } from '#src/shared/glyphs/index.tsx';
import { mergeReferences } from '#src/shared/merge-references.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { ErrorSummary, findControlByName } from '#src/forms/error-summary/index.tsx';
import type { ErrorSummaryItem, ErrorSummaryLabels } from '#src/forms/error-summary/index.tsx';
import { FormContext } from '#src/forms/form-context.ts';
import type { FormErrors, FormStatus, FormSubmission } from '#src/forms/form-context.ts';

const { spacing, typography, intent }: typeof themeVariables = themeVariables;

/** A control that takes part in constraint validation. */
export type ValidatableElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Texts of the form. Translate them with the rest of the interface. */
export interface FormLabels extends ErrorSummaryLabels {
	/** Message of a failed native constraint (`required`, `type`, `min`, ...), in the language of the interface. */
	constraint: (element: ValidatableElement) => string;
	/** Announced when `onSubmit` throws or rejects. */
	submissionError: string;
}

const constraintMessage = ({ validity }: ValidatableElement): string => {
	if (validity.valueMissing) return 'Fill in this field.';

	if (validity.typeMismatch || validity.patternMismatch || validity.badInput) {
		return 'Enter a valid value.';
	}

	if (validity.tooShort) return 'Enter a longer value.';
	if (validity.tooLong) return 'Enter a shorter value.';
	if (validity.rangeUnderflow) return 'Enter a larger value.';
	if (validity.rangeOverflow) return 'Enter a smaller value.';
	if (validity.stepMismatch) return 'Enter an allowed value.';
	return 'Check this field.';
};

export const defaultFormLabels: Readonly<FormLabels> = Object.freeze({
	title: (count: number): string => {
		return count === 1
			? 'There is 1 problem with this form'
			: `There are ${String(count)} problems with this form`;
	},
	constraint: constraintMessage,
	submissionError: 'The form could not be sent. Try again.',
});

export type FormRevalidation = 'blur' | 'submit';

export interface FormProps extends Omit<ComponentPropsWithRef<'form'>, 'onSubmit'> {
	/** Called with the form data once validation passes; a returned promise keeps the form `submitting`. */
	onSubmit?: ((data: FormData, form: HTMLFormElement) => void | Promise<void>) | undefined;
	/**
	 * Errors by field name, from the data; may be async (e.g. a check on the server). It runs on submit and, after a
	 * failed submission, on `revalidateOn` — never at each keystroke. Native constraints are checked as well.
	 */
	validate?: ((data: FormData) => FormErrors | Promise<FormErrors>) | undefined;
	/** Errors from outside (e.g. returned by the server), shown over the validation ones. */
	errors?: FormErrors | undefined;
	/** When errors are checked again after a failed submission. Defaults to `'blur'`. */
	revalidateOn?: FormRevalidation | undefined;
	/** Shows the error summary above the fields; without it, focus goes to the first invalid field. Defaults to `true`. */
	errorSummary?: boolean | undefined;
	/** Announced after a successful submission, e.g. `'Profile saved.'`. */
	successMessage?: ReactNode;
	/** Overrides some or all of `defaultFormLabels`. */
	labels?: Partial<FormLabels> | undefined;
}

const Root = styled('form')({ display: 'flex', flexDirection: 'column', gap: spacing[4] });

const Message = styled('div')({
	display: 'flex',
	alignItems: 'flex-start',
	gap: spacing[2],
	...typography.body,
	'&:empty': { display: 'none' },
	'& > svg': { marginBlockStart: '0.25em', flexShrink: 0 },
});

const isValidatable = (element: Element): element is ValidatableElement => {
	return (
		element instanceof HTMLInputElement ||
		element instanceof HTMLSelectElement ||
		element instanceof HTMLTextAreaElement
	);
};

/** Messages of the native constraints that fail, by name; the first failing control of a name wins. */
const nativeErrors = (
	form: HTMLFormElement,
	message: (element: ValidatableElement) => string,
): Record<string, string> => {
	const errors: Record<string, string> = {};

	[...form.elements].filter(isValidatable).forEach((element: ValidatableElement): void => {
		if (element.name === '' || !element.willValidate || element.validity.valid) return;
		errors[element.name] ??= message(element);
	});

	return errors;
};

const definedErrors = (errors: FormErrors): Record<string, string> => {
	return Object.fromEntries(
		Object.entries(errors).filter(
			(entry: [string, string | undefined]): entry is [string, string] => {
				return entry[1] !== undefined && entry[1] !== '';
			},
		),
	);
};

/**
 * Native `<form noValidate>`: the browser checks nothing by itself, so its constraint attributes are turned into
 * messages of the interface and shown like any other error. On a failed submission the error summary takes focus
 * once; each field shows its message, read with it. The outcome of `onSubmit` is announced (`role="status"`, or
 * `role="alert"` for a failure). Data, requests and schemas stay with the application.
 */
export const Form = ({
	onSubmit,
	validate,
	errors: externalErrors = {},
	revalidateOn = 'blur',
	errorSummary = true,
	successMessage,
	labels,
	children,
	ref,
	onBlur,
	...attributes
}: FormProps): ReactElement => {
	const texts: FormLabels = { ...defaultFormLabels, ...labels };
	const formReference: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement>(null);
	const validationRun: RefObject<number> = useRef<number>(0);
	const pointerPressed: RefObject<boolean> = useRef<boolean>(false);
	const [status, setStatus] = useState<FormStatus>('idle');
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const [attempts, setAttempts] = useState<number>(0);
	const errors: Record<string, string> = { ...validationErrors, ...definedErrors(externalErrors) };
	const pending: boolean = status === 'validating' || status === 'submitting';

	// Without a summary, focus goes to the first invalid field instead. Only a new attempt moves focus.
	useEffect((): void => {
		if (errorSummary || status !== 'invalid' || formReference.current === null) return;
		const firstName: string | undefined = Object.keys(errors)[0];
		if (firstName !== undefined) findControlByName(formReference.current, firstName)?.focus();
	}, [attempts]);

	const collectErrors = async (form: HTMLFormElement): Promise<Record<string, string> | null> => {
		validationRun.current += 1;
		const run: number = validationRun.current;
		const custom: FormErrors = validate === undefined ? {} : await validate(new FormData(form));
		// A newer validation started meanwhile: its result wins.
		if (run !== validationRun.current) return null;
		return { ...nativeErrors(form, texts.constraint), ...definedErrors(custom) };
	};

	const submit = async (form: HTMLFormElement): Promise<void> => {
		setStatus('validating');
		const found: Record<string, string> | null = await collectErrors(form);
		if (found === null) return;
		setValidationErrors(found);
		setAttempts((count: number): number => count + 1);

		if (Object.keys(found).length > 0 || Object.keys(definedErrors(externalErrors)).length > 0) {
			setStatus('invalid');
			return;
		}

		setStatus('submitting');

		try {
			await onSubmit?.(new FormData(form), form);
			setStatus('success');
		} catch {
			setStatus('error');
		}
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
		event.preventDefault();
		if (pending) return;
		void submit(event.currentTarget);
	};

	// Whether a pointer is pressed anywhere in the page: a press moves focus (and blurs the field) before its click.
	useEffect((): (() => void) => {
		const press = (): void => {
			pointerPressed.current = true;
		};

		const release = (): void => {
			pointerPressed.current = false;
		};

		document.addEventListener('pointerdown', press, true);
		document.addEventListener('pointerup', release, true);
		document.addEventListener('pointercancel', release, true);

		return (): void => {
			document.removeEventListener('pointerdown', press, true);
			document.removeEventListener('pointerup', release, true);
			document.removeEventListener('pointercancel', release, true);
		};
	}, []);

	// After a failed submission, leaving a field checks the form again and updates the messages in place.
	const handleBlur = (event: FocusEvent<HTMLFormElement>): void => {
		onBlur?.(event);
		if (revalidateOn !== 'blur' || attempts === 0 || pending) return;
		const form: HTMLFormElement = event.currentTarget;

		const revalidate = (): void => {
			void collectErrors(form).then((found: Record<string, string> | null): void => {
				if (found !== null) setValidationErrors(found);
			});
		};

		if (!pointerPressed.current) {
			revalidate();
			return;
		}

		// Focus left with a pointer press: messages appearing or disappearing now would move the layout between the
		// press and the release, and the click would miss its target (a checkbox would not toggle). Revalidating waits
		// for the release; the task after it runs once the click has been dispatched.
		const afterRelease = (): void => {
			document.removeEventListener('pointerup', afterRelease, true);
			document.removeEventListener('pointercancel', afterRelease, true);
			setTimeout(revalidate);
		};

		document.addEventListener('pointerup', afterRelease, true);
		document.addEventListener('pointercancel', afterRelease, true);
	};

	const summaryItems: ErrorSummaryItem[] = Object.entries(errors).map(
		([name, message]: [string, string]): ErrorSummaryItem => ({ name, message }),
	);

	const submission: FormSubmission = { status, errors, pending };

	return (
		<FormContext value={submission}>
			<Root
				{...attributes}
				ref={mergeReferences(ref, formReference)}
				noValidate
				aria-busy={pending ? true : undefined}
				onSubmit={handleSubmit}
				onBlur={handleBlur}
			>
				{errorSummary && attempts > 0 ? (
					<ErrorSummary errors={summaryItems} focusKey={attempts} labels={{ title: texts.title }} />
				) : null}

				{children}

				<Message role='status' style={{ color: intent.success.text }}>
					{status === 'success' && successMessage !== undefined ? (
						<>
							<Glyph name='check' />
							<span>{successMessage}</span>
						</>
					) : null}
				</Message>

				<Message role='alert' style={{ color: intent.error.text }}>
					{status === 'error' ? (
						<>
							<Glyph name='alert' />
							<span>{texts.submissionError}</span>
						</>
					) : null}
				</Message>
			</Root>
		</FormContext>
	);
};
