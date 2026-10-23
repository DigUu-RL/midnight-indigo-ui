'use client';
// The content of the page of a missing path: a heading and an empty state that leads back to the sales overview.
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import { EmptyState } from '@midnight-indigo/ui/data-display';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { Link } from '@midnight-indigo/ui/navigation';
import type { ReactElement } from 'react';

import type { LocaleSegment } from '@/src/i18n/locales';

interface NotFoundContentProps {
	locale: LocaleSegment;
}

export const NotFoundContent = ({ locale }: NotFoundContentProps): ReactElement => {
	const { t }: I18nValue = useI18n();

	return (
		<>
			<PageHeader title={t('notFound.title')} />

			<EmptyState
				title={t('notFound.message')}
				description={t('notFound.description')}
				headingLevel={2}
				action={
					<Link href={`/${locale}`} variant='standalone'>
						{t('notFound.home')}
					</Link>
				}
			/>
		</>
	);
};
