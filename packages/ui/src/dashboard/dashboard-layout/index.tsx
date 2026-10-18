'use client';
// Shell of an administrative application: the sidebar at the start, a top bar and the main content, with a link that
// skips to it. Navigation, branding and content are slots, so nothing in the shell assumes a route or a product.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useCallback, useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode, RefObject } from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { Container } from '#src/layout/container/index.tsx';
import type { ContainerSize } from '#src/layout/container/index.tsx';
import {
	defaultSidebarLabels,
	Sidebar,
	SidebarMenuButton,
} from '#src/navigation/sidebar/index.tsx';
import type { SidebarEntry, SidebarLabels } from '#src/navigation/sidebar/index.tsx';
import { forwardAllBut, visuallyHiddenStyles } from '#src/shared/appearance.ts';
import { stickyTopbarAttribute, topbarHeight } from '#src/shared/layout-metrics.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { breakpointMediaQuery } from '#src/tokens/index.ts';
import type { Breakpoint } from '#src/tokens/index.ts';

const {
	spacing,
	typography,
	fontWeight,
	radius,
	surface,
	text,
	border,
	focus,
	intent,
	layer,
}: typeof themeVariables = themeVariables;

/**
 * Form of the sidebar from `permanentFrom` up: `collapsible` (default) has a button that switches between the full
 * column and the rail, `expanded` is always the full column and `rail` always the icons.
 */
export type DashboardSidebarVariant = 'collapsible' | 'expanded' | 'rail';

/** The main navigation of the application: the items of the sidebar, also shown in the drawer on narrow viewports. */
export interface DashboardNavigation {
	/** Name of the navigation landmark and title of the drawer, e.g. `'Main navigation'`. */
	label: string;
	items: readonly SidebarEntry[];
	/** Content below the items, e.g. the user menu; shown in the drawer too. */
	footer?: ReactNode;
	/** Overrides the texts of the sidebar and of its menu button. */
	labels?: Partial<SidebarLabels>;
}

/** Texts of the layout. Translate them with the rest of the interface. */
export interface DashboardLayoutLabels {
	/** The first link of the page, shown on keyboard focus, which moves the focus to the main content. */
	skipToContent: string;
}

export const defaultDashboardLayoutLabels: Readonly<DashboardLayoutLabels> = Object.freeze({
	skipToContent: 'Skip to main content',
});

export interface DashboardLayoutProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
	navigation: DashboardNavigation;
	/** The product logo or name: at the top of the sidebar, and in the top bar where the sidebar is hidden. */
	brand?: ReactNode;
	/** Content at the end of the top bar, e.g. a search field, notifications and the user menu. */
	topbar?: ReactNode;
	/** Content above the page, e.g. `Breadcrumbs`. */
	breadcrumbs?: ReactNode;
	/** The page, e.g. a `PageHeader` followed by its panels. */
	children: ReactNode;
	/** Defaults to `'collapsible'`. */
	sidebarVariant?: DashboardSidebarVariant;
	/** Whether the collapsible sidebar is a rail. Pass it with `onCollapsedChange` to control it. */
	collapsed?: boolean;
	/** Initial state of the collapsible sidebar when uncontrolled. Defaults to `false`. */
	defaultCollapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Whether the navigation drawer is open on narrow viewports. Pass it with `onNavigationOpenChange` to control it. */
	navigationOpen?: boolean;
	onNavigationOpenChange?: (open: boolean) => void;
	/** First breakpoint where the sidebar is part of the page. Defaults to `'expanded'` (840 px). */
	permanentFrom?: Breakpoint;
	/** Maximum width of the content (a `Container` size). Defaults to `'large'` (80 rem). */
	contentSize?: ContainerSize;
	/** Overrides some or all of `defaultDashboardLayoutLabels`. */
	labels?: Partial<DashboardLayoutLabels>;
}

const Root = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	minHeight: '100dvh',
	backgroundColor: surface.canvas,
	color: text.primary,
});

// Keeps the sidebar in view while the page scrolls; below the breakpoint the sidebar is not shown and this is empty.
const SidebarSlot = styled('div')({
	position: 'sticky',
	insetBlockStart: 0,
	display: 'flex',
	flexShrink: 0,
	alignSelf: 'flex-start',
	height: '100dvh',
});

const Column = styled('div')({
	display: 'flex',
	flex: '1 1 auto',
	flexDirection: 'column',
	minWidth: 0,
});

interface TopbarStyleProps {
	permanentFrom: Breakpoint;
	/** Whether the top bar has content from the breakpoint up, where the menu button and the brand are hidden. */
	persistent: boolean;
}

const Topbar = styled('header', {
	shouldForwardProp: forwardAllBut('permanentFrom', 'persistent'),
})<TopbarStyleProps>(({ permanentFrom, persistent }: TopbarStyleProps): CSSObject => {
	return {
		position: 'sticky',
		insetBlockStart: 0,
		zIndex: layer.sticky,
		boxSizing: 'border-box',
		display: 'flex',
		alignItems: 'center',
		gap: spacing[3],
		minHeight: topbarHeight,
		paddingBlock: spacing[2],
		paddingInline: spacing[4],
		borderBlockEnd: `1px solid ${border.subtle}`,
		backgroundColor: surface.sidebar,
		[`@media ${breakpointMediaQuery(permanentFrom)}`]: {
			display: persistent ? 'flex' : 'none',
			paddingInline: spacing[8],
		},
	};
});

const TopbarBrand = styled('div', {
	shouldForwardProp: forwardAllBut('hiddenFrom'),
})<{ hiddenFrom: Breakpoint }>(({ hiddenFrom }: { hiddenFrom: Breakpoint }): CSSObject => {
	return {
		display: 'flex',
		alignItems: 'center',
		minWidth: 0,
		[`@media ${breakpointMediaQuery(hiddenFrom)}`]: { display: 'none' },
	};
});

const TopbarEnd = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	justifyContent: 'flex-end',
	gap: spacing[2],
	minWidth: 0,
	marginInlineStart: 'auto',
});

// Only focused from the skip link (it is not a tab stop), so the whole region needs no ring.
const Main = styled('main')({
	flex: '1 1 auto',
	minWidth: 0,
	paddingBlock: spacing[6],
	'&:focus': { outline: 'none' },
});

const Content = styled('div')({ display: 'flex', flexDirection: 'column', gap: spacing[6] });

const SkipLink = styled('a')({
	...visuallyHiddenStyles,
	'&:focus': {
		position: 'fixed',
		insetBlockStart: spacing[2],
		insetInlineStart: spacing[2],
		zIndex: layer.toast,
		width: 'auto',
		height: 'auto',
		margin: 0,
		paddingBlock: spacing[2],
		paddingInline: spacing[4],
		overflow: 'visible',
		clip: 'auto',
		whiteSpace: 'normal',
		borderRadius: radius.control,
		backgroundColor: intent.official.main,
		color: intent.official.contrastText,
		...typography.label,
		fontWeight: fontWeight.semibold,
		textDecoration: 'none',
		outline: `${focus.width} solid ${focus.ring}`,
		outlineOffset: focus.offset,
	},
});

/**
 * From `permanentFrom` up, the sidebar is a column at the start of the page that stays in view while the content
 * scrolls; below it, a menu button in the top bar opens the same items in a drawer. The page has one `header`
 * (banner), one `nav` per form of the sidebar and one `main`, which the skip link focuses. The top bar is hidden from
 * the breakpoint up when it has nothing to show there.
 */
export const DashboardLayout = ({
	navigation,
	brand,
	topbar,
	breadcrumbs,
	children,
	sidebarVariant = 'collapsible',
	collapsed,
	defaultCollapsed,
	onCollapsedChange,
	navigationOpen: controlledNavigationOpen,
	onNavigationOpenChange,
	permanentFrom = 'expanded',
	contentSize = 'large',
	labels,
	...attributes
}: DashboardLayoutProps): ReactElement => {
	const texts: DashboardLayoutLabels = useComponentLabels(
		'dashboardLayout',
		defaultDashboardLayoutLabels,
		labels,
	);

	const sidebarTexts: SidebarLabels = useComponentLabels(
		'sidebar',
		defaultSidebarLabels,
		navigation.labels,
	);

	const mainId: string = useId();
	const mainReference: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
	const [uncontrolledNavigationOpen, setUncontrolledNavigationOpen] = useState<boolean>(false);
	const navigationOpen: boolean = controlledNavigationOpen ?? uncontrolledNavigationOpen;

	const changeNavigationOpen = useCallback(
		(open: boolean): void => {
			if (controlledNavigationOpen === undefined) setUncontrolledNavigationOpen(open);
			onNavigationOpenChange?.(open);
		},
		[controlledNavigationOpen, onNavigationOpenChange],
	);

	// The link works without JavaScript; with it, the focus moves without changing the URL of a routed application.
	const skipToContent = (event: MouseEvent<HTMLAnchorElement>): void => {
		event.preventDefault();
		mainReference.current?.focus();
	};

	const sidebarForm: { collapsed?: boolean; collapsible: boolean } =
		sidebarVariant === 'collapsible'
			? { ...(collapsed === undefined ? {} : { collapsed }), collapsible: true }
			: { collapsed: sidebarVariant === 'rail', collapsible: false };

	return (
		<Root {...attributes}>
			<SkipLink href={`#${mainId}`} onClick={skipToContent}>
				{texts.skipToContent}
			</SkipLink>

			<SidebarSlot>
				<Sidebar
					label={navigation.label}
					items={navigation.items}
					header={brand}
					footer={navigation.footer}
					{...sidebarForm}
					{...(defaultCollapsed === undefined ? {} : { defaultCollapsed })}
					{...(onCollapsedChange === undefined ? {} : { onCollapsedChange })}
					mobileOpen={navigationOpen}
					onMobileOpenChange={changeNavigationOpen}
					permanentFrom={permanentFrom}
					labels={sidebarTexts}
				/>
			</SidebarSlot>

			<Column>
				<Topbar
					permanentFrom={permanentFrom}
					persistent={topbar !== undefined}
					{...{ [stickyTopbarAttribute]: '' }}
				>
					<SidebarMenuButton
						open={navigationOpen}
						onOpenChange={changeNavigationOpen}
						permanentFrom={permanentFrom}
						label={sidebarTexts.open}
					/>

					{brand === undefined ? null : (
						<TopbarBrand hiddenFrom={permanentFrom}>{brand}</TopbarBrand>
					)}

					{topbar === undefined ? null : <TopbarEnd>{topbar}</TopbarEnd>}
				</Topbar>

				<Main id={mainId} ref={mainReference} tabIndex={-1}>
					<Container size={contentSize}>
						<Content>
							{breadcrumbs}
							{children}
						</Content>
					</Container>
				</Main>
			</Column>
		</Root>
	);
};
