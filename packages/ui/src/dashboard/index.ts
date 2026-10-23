// Public subpath `@midnight-indigo/ui/dashboard`: the shell and the page patterns of administrative applications. It is
// opt-in: neither the root entry nor any other subpath reaches it, and it never loads the chart engine.
export {
	DashboardLayout,
	defaultDashboardLayoutLabels,
} from '@/src/dashboard/dashboard-layout/index';
export type {
	DashboardLayoutLabels,
	DashboardLayoutProps,
	DashboardNavigation,
	DashboardSidebarVariant,
} from '@/src/dashboard/dashboard-layout/index';
export { DashboardPanel } from '@/src/dashboard/dashboard-panel/index';
export type { DashboardPanelProps } from '@/src/dashboard/dashboard-panel/index';
export { defaultFilterBarLabels, FilterBar } from '@/src/dashboard/filter-bar/index';
export type { FilterBarLabels, FilterBarProps } from '@/src/dashboard/filter-bar/index';
export { KpiGrid } from '@/src/dashboard/kpi-grid/index';
export type { KpiGridProps, KpiItem } from '@/src/dashboard/kpi-grid/index';
export { PageHeader } from '@/src/dashboard/page-header/index';
export type { PageHeaderHeadingLevel, PageHeaderProps } from '@/src/dashboard/page-header/index';
