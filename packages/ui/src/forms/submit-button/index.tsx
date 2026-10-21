'use client';
// Submit button that shows the progress of the enclosing `Form`.
import type { ReactElement } from 'react';

import type { SemanticIntent } from '#src/tokens/index.ts';
import { Button } from '#src/buttons/button/index.tsx';
import type { ButtonProps, ButtonVariant } from '#src/buttons/button/index.tsx';
import { useFormSubmission } from '#src/forms/form-context.ts';
import type { FormSubmission } from '#src/forms/form-context.ts';

export interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'intent' | 'variant'> {
	/** Meaning of the action. Defaults to `'official'`: submitting is the main action of its form. */
	intent?: SemanticIntent;
	/** Emphasis. Defaults to `'solid'`. */
	variant?: ButtonVariant;
}

/**
 * `Button` with `type="submit"`, `intent='official'` and `variant='solid'` by default. While the enclosing `Form`
 * validates or submits it is `loading`: it keeps focus and ignores clicks, so the form is not sent twice.
 */
export const SubmitButton = ({
	intent = 'official',
	variant = 'solid',
	loading = false,
	...props
}: SubmitButtonProps): ReactElement => {
	const { pending }: FormSubmission = useFormSubmission();
	return (
		<Button
			{...props}
			type='submit'
			intent={intent}
			variant={variant}
			loading={loading || pending}
		/>
	);
};
