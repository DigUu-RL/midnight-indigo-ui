// Public entry of `@midnight-indigo/ui/icons`: the `Icon` primitive and Iconify icons rendered offline.
// The root entry re-exports `Icon` only, so it never loads the Iconify renderer nor the collection registry.
export { Icon, iconAccessibilityProps } from '#src/icons/icon/index.tsx';
export type {
	IconAccessibility,
	IconAccessibilityAttributes,
	IconProps,
	IconSize,
} from '#src/icons/icon/index.tsx';
export { getIconData, renderIconData, scopeIdentifiers } from '#src/icons/icon-data/index.ts';
export type {
	IconifyAliasData,
	IconifyCollection,
	IconifyDimensions,
	IconifyIconData,
	IconifyTransformations,
	IconName,
	RenderedIcon,
} from '#src/icons/icon-data/index.ts';
export {
	listRegisteredIconCollections,
	registerIconCollection,
	resolveIconName,
	unregisterIconCollection,
} from '#src/icons/icon-registry/index.ts';
export { IconifyIcon } from '#src/icons/iconify-icon/index.tsx';
export type { IconifyIconProps } from '#src/icons/iconify-icon/index.tsx';
