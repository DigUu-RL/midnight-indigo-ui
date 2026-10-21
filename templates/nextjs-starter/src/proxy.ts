// Runs before every page. A path without a locale (`/`, `/orders`) is redirected to the same page in the language the
// user chose last (the cookie written by the language links) or, until they choose one, the language the browser
// prefers (`Accept-Language`), else English. A path with a locale is served as is, except the page of a component of
// the explorer, served by the route of its subpath (`explorer/routes.ts`).
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { findComponent } from '#src/explorer/catalog.ts';
import { routePathOf } from '#src/explorer/routes.ts';
import {
	defaultLocaleSegment,
	isLocaleSegment,
	localeCookieName,
	localeHeaderName,
	localeOfPath,
	localizePath,
	negotiateLocale,
} from '#src/i18n/locales.ts';
import type { LocaleSegment } from '#src/i18n/locales.ts';

const preferredLocale = (request: NextRequest): LocaleSegment => {
	const chosen: string | undefined = request.cookies.get(localeCookieName)?.value;

	return isLocaleSegment(chosen)
		? chosen
		: (negotiateLocale(request.headers.get('accept-language')) ?? defaultLocaleSegment);
};

export const proxy = (request: NextRequest): NextResponse => {
	const locale: LocaleSegment | undefined = localeOfPath(request.nextUrl.pathname);

	if (locale === undefined) {
		const target: URL = request.nextUrl.clone();
		target.pathname = localizePath(request.nextUrl.pathname, preferredLocale(request));

		return NextResponse.redirect(target);
	}

	// For `app/global-not-found.tsx`, which has no route parameters to read the locale from.
	const requestHeaders: Headers = new Headers(request.headers);
	requestHeaders.set(localeHeaderName, locale);

	const routePath: string | undefined = routePathOf(
		request.nextUrl.pathname,
		(slug: string): string | undefined => findComponent(slug)?.subpath,
	);

	if (routePath !== undefined) {
		const target: URL = request.nextUrl.clone();
		target.pathname = routePath;

		return NextResponse.rewrite(target, { request: { headers: requestHeaders } });
	}

	return NextResponse.next({ request: { headers: requestHeaders } });
};

export const config: { matcher: string[] } = {
	// Pages only: not the assets of Next.js, its development endpoints, files (`/favicon.ico`) or the component
	// gallery, which is not translated.
	matcher: ['/((?!_next|__nextjs|gallery|.*\\.).*)'],
};
