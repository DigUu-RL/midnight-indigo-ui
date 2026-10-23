// Public subpath `@midnight-indigo/ui/layout`: page and section layout, independent from navigation and dashboard.
export { Container } from '@/src/layout/container/index';
export type { ContainerElement, ContainerProps, ContainerSize } from '@/src/layout/container/index';
export { Grid, GridItem } from '@/src/layout/grid/index';
export type {
	GridElement,
	GridItemElement,
	GridItemProps,
	GridProps,
	GridSpan,
} from '@/src/layout/grid/index';
export { Stack } from '@/src/layout/stack/index';
export type {
	StackAlign,
	StackDirection,
	StackElement,
	StackJustify,
	StackProps,
} from '@/src/layout/stack/index';
export { useBreakpoint } from '@/src/layout/use-breakpoint';
export type { Responsive } from '@/src/shared/responsive';
