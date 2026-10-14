// Public subpath `@midnight-indigo/ui/dashboard`: the shell and the page patterns of administrative applications. It is
// opt-in: neither the root entry nor any other subpath reaches it, and it never loads the chart engine.
export {
	DashboardLayout,
	defaultDashboardLayoutLabels,
} from '#src/dashboard/dashboard-layout/index.tsx';
export type {
	DashboardLayoutLabels,
	DashboardLayoutProps,
	DashboardNavigation,
	DashboardSidebarVariant,
} from '#src/dashboard/dashboard-layout/index.tsx';
export { DashboardPanel } from '#src/dashboard/dashboard-panel/index.tsx';
export type { DashboardPanelProps } from '#src/dashboard/dashboard-panel/index.tsx';
export { defaultFilterBarLabels, FilterBar } from '#src/dashboard/filter-bar/index.tsx';
export type { FilterBarLabels, FilterBarProps } from '#src/dashboard/filter-bar/index.tsx';
export { KpiGrid } from '#src/dashboard/kpi-grid/index.tsx';
export type { KpiGridProps, KpiItem } from '#src/dashboard/kpi-grid/index.tsx';
export { PageHeader } from '#src/dashboard/page-header/index.tsx';
export type { PageHeaderHeadingLevel, PageHeaderProps } from '#src/dashboard/page-header/index.tsx';
