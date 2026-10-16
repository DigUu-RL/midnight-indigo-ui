// Icon in the Iconify format, rendered as inline SVG from data already in the bundle: no request, so it renders the same
// on the server and the client, offline and under a strict Content Security Policy.
import { useId } from 'react';
import type { ReactElement } from 'react';

import { Icon } from '#src/icons/icon/index.tsx';
import type { IconAccessibility, IconProps } from '#src/icons/icon/index.tsx';
import { renderIconData, scopeIdentifiers } from '#src/icons/icon-data/index.ts';
import type { IconifyIconData, IconName, RenderedIcon } from '#src/icons/icon-data/index.ts';
import { resolveIconName } from '#src/icons/icon-registry/index.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

// `Omit` flattens the union of `IconAccessibility`, so it is added back.
export type IconifyIconProps = Omit<IconProps, 'children' | 'viewBox' | 'label' | 'decorative'> &
	IconAccessibility & {
		/**
		 * The icon data (tree-shakable: only the icons imported reach the bundle), or its name in a collection registered
		 * with `registerIconCollection`, e.g. `'tabler:home'`.
		 */
		icon: IconifyIconData | IconName;
	};

// `useId` may contain characters (`:`, `«`) that break `url(#...)` references.
const toIdentifierScope = (reactIdentifier: string): string => {
	return `icon${reactIdentifier.replaceAll(/[^\w-]/g, '')}`;
};

/**
 * Renders an Iconify icon with the accessibility rule of `Icon`: a `label` for a functional icon, or `decorative`.
 * The height follows `size`; a wide or tall icon keeps its proportions. Works in Server Components.
 */
export const IconifyIcon = ({
	icon,
	label,
	decorative,
	size = 'inherit',
	style,
	...svgAttributes
}: IconifyIconProps): ReactElement => {
	const identifierScope: string = toIdentifierScope(useId());
	const data: IconifyIconData = typeof icon === 'string' ? resolveIconName(icon) : icon;
	const rendered: RenderedIcon = renderIconData(data);
	const accessibility: IconAccessibility = decorative === true ? { decorative } : { label };
	const height: string = size === 'inherit' ? '1em' : themeVariables.iconSize[size];
	const ratio: string = String(rendered.aspectRatio);

	const width: string =
		rendered.aspectRatio === 1
			? height
			: size === 'inherit'
				? `${ratio}em`
				: `calc(${height} * ${ratio})`;

	return (
		<Icon
			{...svgAttributes}
			{...accessibility}
			size={size}
			viewBox={rendered.viewBox}
			style={{ width, ...style }}
		>
			<g dangerouslySetInnerHTML={{ __html: scopeIdentifiers(rendered.body, identifierScope) }} />
		</Icon>
	);
};
