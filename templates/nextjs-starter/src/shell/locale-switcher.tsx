'use client';
// Links to the page being shown in the other languages. Each is named in its own language and marked with it (`lang`),
// so that a screen reader pronounces it right, and `hrefLang` says what the page behind it is in. Following one
// remembers the choice in a cookie, which the proxy reads to open `/` in that language; without JavaScript the link
// still leads to the translated page.
import { Link } from '@midnight-indigo/ui/navigation';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';

import {
	localeCookieOf,
	localeNames,
	localeSegments,
	localeTags,
	localizePath,
} from '@/src/i18n/locales';
import type { LocaleSegment } from '@/src/i18n/locales';
import { publicPathOf } from '@/src/explorer/routes';

interface LocaleSwitcherProps {
	locale: LocaleSegment;
}

export const LocaleSwitcher = ({ locale }: LocaleSwitcherProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const pathname: string = publicPathOf(usePathname());

	return (
		<nav aria-label={t('shell.language')} className='locale-switcher'>
			<ul>
				{localeSegments
					.filter((segment: LocaleSegment): boolean => segment !== locale)
					.map((segment: LocaleSegment): ReactElement => {
						return (
							<li key={segment}>
								<Link
									href={localizePath(pathname, segment)}
									lang={localeTags[segment]}
									hrefLang={localeTags[segment]}
									variant='standalone'
									onClick={(): void => {
										document.cookie = localeCookieOf(segment);
									}}
								>
									{localeNames[segment]}
								</Link>
							</li>
						);
					})}
			</ul>
		</nav>
	);
};
