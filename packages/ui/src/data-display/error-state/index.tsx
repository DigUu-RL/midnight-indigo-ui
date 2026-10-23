'use client';
// Tells that content could not be loaded, and offers to try again.
import type { ReactElement } from 'react';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import { Button } from '@/src/buttons/button/index';
import { Glyph, intentGlyphs } from '@/src/shared/glyphs/index';
import { themeVariables } from '@/src/theme/theme-variables';
import { StateMessage } from '@/src/data-display/state-message/index';
import type { StateMessageContentProps } from '@/src/data-display/state-message/index';

/** Texts of the error state. Translate them with the rest of the interface. */
export interface ErrorStateLabels {
	/** Text of the retry button. */
	retry: string;
}

export const defaultErrorStateLabels: Readonly<ErrorStateLabels> = Object.freeze({
	retry: 'Try again',
});

export interface ErrorStateProps extends Omit<StateMessageContentProps, 'role'> {
	/**
	 * Announces the error when it appears (`role="alert"`). Defaults to `true`; turn it off when the error is part of
	 * the page from the first render, e.g. rendered by the server.
	 */
	announce?: boolean;
	/** Shows a retry button that calls it, unless an `action` is given. */
	onRetry?: () => void;
	/** Overrides some or all of `defaultErrorStateLabels`. */
	labels?: Partial<ErrorStateLabels>;
}

/** Marked by the error glyph and color, and by its text: never by color alone. */
export const ErrorState = ({
	announce = true,
	onRetry,
	labels,
	action,
	...props
}: ErrorStateProps): ReactElement => {
	const texts: ErrorStateLabels = useComponentLabels('errorState', defaultErrorStateLabels, labels);

	const retry: ReactElement | undefined =
		onRetry === undefined ? undefined : <Button onClick={onRetry}>{texts.retry}</Button>;

	return (
		<StateMessage
			{...props}
			role={announce ? 'alert' : undefined}
			action={action ?? retry}
			iconColor={themeVariables.intent.error.text}
			defaultIcon={<Glyph name={intentGlyphs.error} />}
		/>
	);
};
