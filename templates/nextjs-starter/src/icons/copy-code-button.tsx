'use client';
// Copies a snippet to the clipboard and confirms it with a toast, which assistive technologies announce.
import { Button } from '@midnight-indigo/ui/buttons';
import { useToast } from '@midnight-indigo/ui/feedback';
import type { ToastApi } from '@midnight-indigo/ui/feedback';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import type { ReactElement } from 'react';

interface CopyCodeButtonProps {
	code: string;
	/** Visible label, which says what is copied. */
	label: string;
}

export const CopyCodeButton = ({ code, label }: CopyCodeButtonProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const toast: ToastApi = useToast();

	const copy = (): void => {
		navigator.clipboard.writeText(code).then(
			(): void => {
				toast.show({ intent: 'success', message: t('icons.snippets.copied') });
			},
			(): void => {
				toast.show({ intent: 'error', message: t('icons.snippets.copyFailed') });
			},
		);
	};

	return (
		<Button size='small' variant='outline' onClick={copy}>
			{label}
		</Button>
	);
};
