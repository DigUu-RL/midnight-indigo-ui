// Public entry of `@midnight-indigo/ui/icons`: the `Icon` primitive and Iconify icons rendered offline.
// The root entry re-exports `Icon` only, so it never loads the Iconify renderer nor the collection registry.
export { Icon, iconAccessibilityProps } from '@/src/icons/icon/index';
export type {
	IconAccessibility,
	IconAccessibilityAttributes,
	IconProps,
	IconSize,
} from '@/src/icons/icon/index';
export { getIconData, renderIconData, scopeIdentifiers } from '@/src/icons/icon-data/index';
export type {
	IconifyAliasData,
	IconifyCollection,
	IconifyDimensions,
	IconifyIconData,
	IconifyTransformations,
	IconName,
	RenderedIcon,
} from '@/src/icons/icon-data/index';
export {
	listRegisteredIconCollections,
	registerIconCollection,
	resolveIconName,
	unregisterIconCollection,
} from '@/src/icons/icon-registry/index';
export { IconifyIcon } from '@/src/icons/iconify-icon/index';
export type { IconifyIconProps } from '@/src/icons/iconify-icon/index';
