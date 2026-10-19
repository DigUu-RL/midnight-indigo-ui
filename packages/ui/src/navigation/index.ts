// Public subpath `@midnight-indigo/ui/navigation`: links, tabs, breadcrumbs, pagination and the application sidebar.
export { Breadcrumbs, defaultBreadcrumbsLabels } from '#src/navigation/breadcrumbs/index.tsx';
export type {
	BreadcrumbItem,
	BreadcrumbsLabels,
	BreadcrumbsProps,
} from '#src/navigation/breadcrumbs/index.tsx';
export { defaultLinkLabels, Link } from '#src/navigation/link/index.tsx';
export type { LinkLabels, LinkProps, LinkVariant } from '#src/navigation/link/index.tsx';
export {
	NavigationProvider,
	useLinkComponent,
} from '#src/navigation/navigation-provider/index.tsx';
export type {
	LinkComponent,
	LinkComponentProps,
	NavigationProviderProps,
} from '#src/navigation/navigation-provider/index.tsx';
export {
	defaultPaginationLabels,
	Pagination,
	paginationRange,
} from '#src/navigation/pagination/index.tsx';
export type {
	PaginationEntry,
	PaginationLabels,
	PaginationProps,
} from '#src/navigation/pagination/index.tsx';
export {
	defaultSidebarLabels,
	Sidebar,
	SidebarMenuButton,
} from '#src/navigation/sidebar/index.tsx';
export type {
	SidebarEntry,
	SidebarGroup,
	SidebarItem,
	SidebarLabels,
	SidebarMenuButtonProps,
	SidebarProps,
} from '#src/navigation/sidebar/index.tsx';
export {
	defaultTableOfContentsLabels,
	TableOfContents,
} from '#src/navigation/table-of-contents/index.tsx';
export type {
	TableOfContentsItem,
	TableOfContentsLabels,
	TableOfContentsLevel,
	TableOfContentsProps,
} from '#src/navigation/table-of-contents/index.tsx';
export { TabNavigation } from '#src/navigation/tab-navigation/index.tsx';
export type {
	TabNavigationItem,
	TabNavigationProps,
} from '#src/navigation/tab-navigation/index.tsx';
export { Tabs } from '#src/navigation/tabs/index.tsx';
export type { TabItem, TabsActivation, TabsProps } from '#src/navigation/tabs/index.tsx';
