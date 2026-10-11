'use client';
// Submit button that shows the progress of the enclosing `Form`.
import type { ReactElement } from 'react';

import { Button } from '#src/buttons/button/index.tsx';
import type { ButtonProps } from '#src/buttons/button/index.tsx';
import { useFormSubmission } from '#src/forms/form-context.ts';
import type { FormSubmission } from '#src/forms/form-context.ts';

export type SubmitButtonProps = Omit<ButtonProps, 'type'>;

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
