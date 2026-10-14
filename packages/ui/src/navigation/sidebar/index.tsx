'use client';
// Main navigation of an application: a permanent sidebar that collapses to a rail, and a drawer on narrow viewports.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useEffect, useId, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { IconButton } from '#src/buttons/icon-button/index.tsx';
import type { IconButtonProps } from '#src/buttons/icon-button/index.tsx';
import { Drawer } from '#src/feedback/drawer/index.tsx';
import { TooltipBase } from '#src/feedback/tooltip/index.tsx';
import { useBreakpoint } from '#src/layout/use-breakpoint.ts';
import {
	colorTransitionStyles,
	forwardAllBut,
	visuallyHiddenStyles,
} from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { breakpointMediaQuery } from '#src/tokens/index.ts';
import type { Breakpoint } from '#src/tokens/index.ts';
import { useLinkAs } from '#src/navigation/navigation-provider/index.tsx';
import type { LinkComponent } from '#src/navigation/navigation-provider/index.tsx';

const {
	spacing,
	typography,
	fontWeight,
	radius,
	surface,
	text,
	border,
	state,
	focus,
	iconSize,
	intent,
	motion,
}: typeof themeVariables = themeVariables;

/** A destination (with `href`, a link) or an action (with `onSelect` only, a button), e.g. `'New report'`. */
export interface SidebarItem {
	/** Unique within the sidebar; used as the React key. */
	id: string;
	/** Visible label and accessible name; in the collapsed rail it is shown in a tooltip and still names the item. */
	label: string;
	/** Decorative icon, the only thing visible in the collapsed rail. */
	icon: ReactNode;
	href?: string | undefined;
	/** Runs on activation; with `href` too, it runs before the navigation. */
	onSelect?: (() => void) | undefined;
	/** Marks the link to the page being shown (`aria-current="page"`). */
	current?: boolean | undefined;
}

/** Items under a heading, e.g. `'Reports'`; in the collapsed rail the heading is replaced by a line. */
export interface SidebarGroup {
	id: string;
	label: string;
	items: readonly SidebarItem[];
}

export type SidebarEntry = SidebarItem | SidebarGroup;

/** Texts of the sidebar. Translate them with the rest of the interface. */
export interface SidebarLabels {
	collapse: string;
	expand: string;
	/** Name of the close button of the drawer. */
	close: string;
	/** Name of `SidebarMenuButton`. */
	open: string;
}

export const defaultSidebarLabels: Readonly<SidebarLabels> = Object.freeze({
	collapse: 'Collapse navigation',
	expand: 'Expand navigation',
	close: 'Close navigation',
	open: 'Open navigation',
});

export interface SidebarProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
	/** Name of the navigation landmark and title of the drawer, e.g. `'Main navigation'`. */
	label: string;
	items: readonly SidebarEntry[];
	/** Content above the items, e.g. the product logo. In the rail it must fit 3 rem. */
	header?: ReactNode;
	/** Content below the items, e.g. the user menu. */
	footer?: ReactNode;
	/** Shows the rail (icons only). Pass it with `onCollapsedChange` to control it. */
	collapsed?: boolean;
	/** Initial state when uncontrolled. Defaults to `false`. */
	defaultCollapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/**
	 * Shows the button that collapses and expands the sidebar. Defaults to `true`; without it, the sidebar keeps the form
	 * given by `collapsed` (e.g. always a rail).
	 */
	collapsible?: boolean;
	/**
	 * Whether the drawer is open below `permanentFrom`, where the sidebar is not shown. Open it from a
	 * `SidebarMenuButton`; the sidebar closes it after an item is chosen and when the viewport grows past the breakpoint.
	 */
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
	/** First breakpoint where the sidebar is part of the page. Defaults to `'expanded'` (840 px). */
	permanentFrom?: Breakpoint;
	/** Overrides some or all of `defaultSidebarLabels`. */
	labels?: Partial<SidebarLabels>;
}

export interface SidebarMenuButtonProps extends Omit<
	IconButtonProps,
	'label' | 'children' | 'onClick'
> {
	/** The `mobileOpen` of the sidebar. */
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The `permanentFrom` of the sidebar, from where the button is hidden. Defaults to `'expanded'`. */
	permanentFrom?: Breakpoint;
	/** Accessible name. Defaults to the `open` label of the sidebar, `'Open navigation'`. */
	label?: string;
}

const isGroup = (entry: SidebarEntry): entry is SidebarGroup => 'items' in entry;

const expandedWidth: string = '16rem';
const railWidth: string = '4.5rem';

interface RootStyleProps {
	permanentFrom: Breakpoint;
	collapsed: boolean;
}

const Root = styled('div', {
	shouldForwardProp: forwardAllBut('permanentFrom', 'collapsed'),
})<RootStyleProps>(({ permanentFrom, collapsed }: RootStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'none',
		flexDirection: 'column',
		gap: spacing[2],
		flexShrink: 0,
		width: collapsed ? railWidth : expandedWidth,
		height: '100%',
		padding: spacing[3],
		overflow: 'hidden',
		borderInlineEnd: `1px solid ${border.subtle}`,
		backgroundColor: surface.base,
		color: text.secondary,
		transitionProperty: 'width',
		transitionDuration: motion.duration.moderate,
		transitionTimingFunction: motion.easing.standard,
		[`@media ${breakpointMediaQuery(permanentFrom)}`]: { display: 'flex' },
	};
});

const Section = styled('div')({ flexShrink: 0, minWidth: 0 });

const Navigation = styled('nav')({
	flex: '1 1 auto',
	minHeight: 0,
	marginInline: `calc(-1 * ${spacing[1]})`,
	paddingInline: spacing[1],
	overflowX: 'hidden',
	overflowY: 'auto',
});

const List = styled('ul')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	margin: 0,
	padding: 0,
	listStyle: 'none',
});

const GroupItem = styled('li')({ display: 'flex', flexDirection: 'column', gap: spacing[1] });

const GroupLabel = styled('span', {
	shouldForwardProp: forwardAllBut('collapsed'),
})<{ collapsed: boolean }>(({ collapsed }: { collapsed: boolean }): CSSObject => {
	return {
		marginBlockStart: spacing[3],
		paddingInline: spacing[3],
		...typography.caption,
		fontWeight: fontWeight.semibold,
		color: text.muted,
		...(collapsed ? visuallyHiddenStyles : {}),
	};
});

const GroupRule = styled('span')({
	display: 'block',
	height: '1px',
	marginBlock: spacing[2],
	marginInline: spacing[2],
	backgroundColor: border.subtle,
});

// The current item has a filled background, primary text, a heavier weight and a bar at its start edge.
const itemStyles = ({ collapsed }: { collapsed: boolean }): CSSObject => {
	return {
		position: 'relative',
		boxSizing: 'border-box',
		display: 'flex',
		alignItems: 'center',
		justifyContent: collapsed ? 'center' : 'flex-start',
		gap: spacing[3],
		width: '100%',
		minHeight: '2.5rem',
		margin: 0,
		paddingBlock: spacing[2],
		paddingInline: collapsed ? 0 : spacing[3],
		border: 0,
		borderRadius: radius.medium,
		background: 'none',
		color: text.secondary,
		...typography.label,
		textAlign: 'start',
		textDecoration: 'none',
		cursor: 'pointer',
		...colorTransitionStyles,
		'&:hover': { backgroundColor: state.hover, color: text.primary },
		'&[aria-current="page"]': {
			backgroundColor: state.selected,
			color: text.primary,
			fontWeight: fontWeight.semibold,
		},
		'&[aria-current="page"]::before': {
			content: '""',
			position: 'absolute',
			insetInlineStart: 0,
			insetBlock: spacing[2],
			width: '3px',
			borderRadius: radius.pill,
			backgroundColor: intent.official.main,
		},
		// Drawn inside, so the scrolling navigation never clips it.
		'&:focus-visible': {
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: `calc(-1 * ${focus.width})`,
		},
	};
};

const itemForwarding: { shouldForwardProp: (property: PropertyKey) => boolean } = {
	shouldForwardProp: forwardAllBut('collapsed'),
};

const ItemAnchor = styled('a', itemForwarding)<{ collapsed: boolean }>(itemStyles);

const ItemButton = styled('button', itemForwarding)<{ collapsed: boolean }>(itemStyles);

const ItemIcon = styled('span')({
	display: 'inline-flex',
	flexShrink: 0,
	fontSize: iconSize.medium,
});

const ItemLabel = styled('span', {
	shouldForwardProp: forwardAllBut('collapsed'),
})<{ collapsed: boolean }>(({ collapsed }: { collapsed: boolean }): CSSObject => {
	return collapsed ? visuallyHiddenStyles : { minWidth: 0, overflowWrap: 'anywhere' };
});

const CollapseControl = styled('div', {
	shouldForwardProp: forwardAllBut('collapsed'),
})<{ collapsed: boolean }>(({ collapsed }: { collapsed: boolean }): CSSObject => {
	return {
		display: 'flex',
		flexShrink: 0,
		justifyContent: collapsed ? 'center' : 'flex-end',
		// The chevron points to where the sidebar goes, in both reading directions.
		'[dir="rtl"] & svg': { transform: 'scaleX(-1)' },
	};
});

const MenuButton = styled(IconButton, {
	shouldForwardProp: forwardAllBut('hiddenFrom'),
})<{ hiddenFrom: Breakpoint }>(({ hiddenFrom }: { hiddenFrom: Breakpoint }): CSSObject => {
	return { [`@media ${breakpointMediaQuery(hiddenFrom)}`]: { display: 'none' } };
});

interface EntriesProps {
	items: readonly SidebarEntry[];
	collapsed: boolean;
	/** Whether the rail shows the labels in tooltips: only in the permanent sidebar. */
	tooltips: boolean;
	/** Called after an item is chosen, e.g. to close the drawer. */
	onChoose?: () => void;
}

const Entries = ({ items, collapsed, tooltips, onChoose }: EntriesProps): ReactElement => {
	const linkAs: { as?: LinkComponent } = useLinkAs();
	const groupIdPrefix: string = useId();

	const renderItem = (item: SidebarItem): ReactElement => {
		const content: ReactElement = (
			<>
				<ItemIcon aria-hidden='true'>{item.icon}</ItemIcon>
				<ItemLabel collapsed={collapsed}>{item.label}</ItemLabel>
			</>
		);

		const choose = (): void => {
			item.onSelect?.();
			onChoose?.();
		};

		const control: ReactElement =
			item.href === undefined ? (
				<ItemButton type='button' collapsed={collapsed} onClick={choose}>
					{content}
				</ItemButton>
			) : (
				<ItemAnchor
					{...linkAs}
					href={item.href}
					aria-current={item.current === true ? 'page' : undefined}
					collapsed={collapsed}
					onClick={choose}
				>
					{content}
				</ItemAnchor>
			);

		return (
			<li key={item.id}>
				{tooltips ? (
					<TooltipBase role='name' content={item.label} placement='end' disabled={!collapsed}>
						{control}
					</TooltipBase>
				) : (
					control
				)}
			</li>
		);
	};

	return (
		<List>
			{items.map((entry: SidebarEntry): ReactElement => {
				if (!isGroup(entry)) return renderItem(entry);

				const labelId: string = `${groupIdPrefix}-${entry.id}`;

				return (
					<GroupItem key={entry.id}>
						{collapsed ? <GroupRule aria-hidden='true' /> : null}

						<GroupLabel id={labelId} collapsed={collapsed}>
							{entry.label}
						</GroupLabel>

						<List aria-labelledby={labelId}>{entry.items.map(renderItem)}</List>
					</GroupItem>
				);
			})}
		</List>
	);
};

/**
 * From `permanentFrom` up, a column at the start of the page (16 rem, or a 4.5 rem rail of icons), with a button at
 * its end that collapses and expands it. Below that breakpoint, the same items open in a modal drawer from the start
 * edge, controlled by `mobileOpen`. Every item is a link or a button in the tab order, so the navigation works by
 * keyboard in both forms, and nothing depends on hover: the rail's tooltips only repeat the names.
 */
export const Sidebar = ({
	label,
	items,
	header,
	footer,
	collapsed: controlledCollapsed,
	defaultCollapsed = false,
	onCollapsedChange,
	collapsible = true,
	mobileOpen,
	onMobileOpenChange,
	permanentFrom = 'expanded',
	labels,
	...attributes
}: SidebarProps): ReactElement => {
	const texts: SidebarLabels = useComponentLabels('sidebar', defaultSidebarLabels, labels);
	const navigationId: string = useId();
	const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState<boolean>(defaultCollapsed);
	const collapsed: boolean = controlledCollapsed ?? uncontrolledCollapsed;
	const permanent: boolean = useBreakpoint(permanentFrom);

	// A drawer left open while the viewport grows would cover the permanent sidebar that replaces it.
	useEffect((): void => {
		if (permanent && mobileOpen) onMobileOpenChange(false);
	}, [permanent, mobileOpen, onMobileOpenChange]);

	const toggle = (): void => {
		if (controlledCollapsed === undefined) setUncontrolledCollapsed(!collapsed);
		onCollapsedChange?.(!collapsed);
	};

	const close = (): void => {
		onMobileOpenChange(false);
	};

	return (
		<>
			<Root {...attributes} permanentFrom={permanentFrom} collapsed={collapsed}>
				{header === undefined ? null : <Section>{header}</Section>}

				<Navigation id={navigationId} aria-label={label}>
					<Entries items={items} collapsed={collapsed} tooltips />
				</Navigation>

				{footer === undefined ? null : <Section>{footer}</Section>}

				{collapsible ? (
					<CollapseControl collapsed={collapsed}>
						<IconButton
							label={collapsed ? texts.expand : texts.collapse}
							aria-expanded={!collapsed}
							aria-controls={navigationId}
							onClick={toggle}
						>
							<Glyph name={collapsed ? 'chevronRight' : 'chevronLeft'} />
						</IconButton>
					</CollapseControl>
				) : null}
			</Root>

			<Drawer
				open={mobileOpen && !permanent}
				onClose={close}
				title={label}
				placement='start'
				size='small'
				closeOnOutsideClick
				labels={{ close: texts.close }}
			>
				<Navigation aria-label={label}>
					<Entries items={items} collapsed={false} tooltips={false} onChoose={close} />
				</Navigation>

				{footer === undefined ? null : <Section>{footer}</Section>}
			</Drawer>
		</>
	);
};

/**
 * Opens the drawer of the sidebar below its `permanentFrom` breakpoint and is hidden from there up, where the sidebar
 * is visible. Place it at the start of the page header.
 */
export const SidebarMenuButton = ({
	open,
	onOpenChange,
	permanentFrom = 'expanded',
	label,
	...attributes
}: SidebarMenuButtonProps): ReactElement => {
	const texts: SidebarLabels = useComponentLabels('sidebar', defaultSidebarLabels, undefined);

	return (
		<MenuButton
			{...attributes}
			label={label ?? texts.open}
			aria-haspopup='dialog'
			aria-expanded={open}
			hiddenFrom={permanentFrom}
			onClick={(): void => {
				onOpenChange(!open);
			}}
		>
			<Glyph name='menu' />
		</MenuButton>
	);
};
