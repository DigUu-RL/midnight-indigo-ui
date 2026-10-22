// The public path of the page of a component, `/[locale]/components/<slug>`, and the path of the route that serves it,
// `/[locale]/components/<segment of the subpath>/<slug>` (see `explorer/component-page.tsx`). The proxy rewrites the
// first to the second; the code that reads the URL turns the second back into the first, since a page built ahead of
// time reads the path of its route there, and the browser the public one. No import of the catalog: the shell of every
// page uses it.
const explorerSegment: string = 'components';

/**
 * The one segment that stands for a subpath in the path of its route and in the names of its files: `forms` →
 * `forms`; `forms/date-pickers` → `forms-date-pickers`.
 */
export const routeSegmentOf = (subpath: string): string => subpath.replaceAll('/', '-');

/**
 * `/en-us/components/chip` → `/en-us/components/data-display/chip`, given the subpath of each slug; `undefined` for
 * any other path.
 */
export const routePathOf = (
	pathname: string,
	subpathOf: (slug: string) => string | undefined,
): string | undefined => {
	const [, locale = '', section, slug, ...rest]: string[] = pathname.split('/');
	if (section !== explorerSegment || slug === undefined || rest.length > 0) return undefined;
	const subpath: string | undefined = subpathOf(slug);

	return subpath === undefined
		? undefined
		: `/${locale}/${explorerSegment}/${routeSegmentOf(subpath)}/${slug}`;
};

/** `/en-us/components/data-display/chip` → `/en-us/components/chip`; any other path as it is. */
export const publicPathOf = (pathname: string): string => {
	const [, locale = '', section, subpath, slug, ...rest]: string[] = pathname.split('/');
	if (section !== explorerSegment || subpath === undefined || slug === undefined) return pathname;
	return rest.length === 0 ? `/${locale}/${explorerSegment}/${slug}` : pathname;
};
