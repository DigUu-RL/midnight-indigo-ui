// Public subpath `@midnight-indigo/ui/navigation`: links, tabs, breadcrumbs, pagination and the application sidebar.
export { Breadcrumbs, defaultBreadcrumbsLabels } from '@/src/navigation/breadcrumbs/index';
export type {
	BreadcrumbItem,
	BreadcrumbsLabels,
	BreadcrumbsProps,
} from '@/src/navigation/breadcrumbs/index';
export { defaultLinkLabels, Link } from '@/src/navigation/link/index';
export type { LinkLabels, LinkProps, LinkVariant } from '@/src/navigation/link/index';
export { NavigationProvider, useLinkComponent } from '@/src/navigation/navigation-provider/index';
export type {
	LinkComponent,
	LinkComponentProps,
	NavigationProviderProps,
} from '@/src/navigation/navigation-provider/index';
export {
	defaultPaginationLabels,
	Pagination,
	paginationRange,
} from '@/src/navigation/pagination/index';
export type {
	PaginationEntry,
	PaginationLabels,
	PaginationProps,
} from '@/src/navigation/pagination/index';
export { defaultSidebarLabels, Sidebar, SidebarMenuButton } from '@/src/navigation/sidebar/index';
export type {
	SidebarEntry,
	SidebarGroup,
	SidebarItem,
	SidebarLabels,
	SidebarMenuButtonProps,
	SidebarProps,
} from '@/src/navigation/sidebar/index';
export {
	defaultTableOfContentsLabels,
	TableOfContents,
} from '@/src/navigation/table-of-contents/index';
export type {
	TableOfContentsItem,
	TableOfContentsLabels,
	TableOfContentsLevel,
	TableOfContentsProps,
} from '@/src/navigation/table-of-contents/index';
export { TabNavigation } from '@/src/navigation/tab-navigation/index';
export type { TabNavigationItem, TabNavigationProps } from '@/src/navigation/tab-navigation/index';
export { Tabs } from '@/src/navigation/tabs/index';
export type { TabItem, TabsActivation, TabsProps } from '@/src/navigation/tabs/index';
