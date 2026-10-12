// Public subpath `@midnight-indigo/ui/layout`: page and section layout, independent from navigation and dashboard.
export { Container } from '#src/layout/container/index.tsx';
export type {
	ContainerElement,
	ContainerProps,
	ContainerSize,
} from '#src/layout/container/index.tsx';
export { Grid, GridItem } from '#src/layout/grid/index.tsx';
export type {
	GridElement,
	GridItemElement,
	GridItemProps,
	GridProps,
	GridSpan,
} from '#src/layout/grid/index.tsx';
export { Stack } from '#src/layout/stack/index.tsx';
export type {
	StackAlign,
	StackDirection,
	StackElement,
	StackJustify,
	StackProps,
} from '#src/layout/stack/index.tsx';
export { useBreakpoint } from '#src/layout/use-breakpoint.ts';
export type { Responsive } from '#src/shared/responsive.ts';
