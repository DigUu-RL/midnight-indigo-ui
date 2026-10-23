'use client';
// Panels of the same view, one shown at a time, switched by a row of tabs (WAI-ARIA tabs pattern).
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { focusRingStyles } from '@/src/shared/appearance';
import { themeVariables } from '@/src/theme/theme-variables';
import { tabIconStyles, tabRowStyles, tabStyles } from '@/src/navigation/tab-appearance/index';
import { useTabList } from '@/src/navigation/tab-list/index';
import type { TabList, TabsActivation } from '@/src/navigation/tab-list/index';

export type { TabsActivation } from '@/src/navigation/tab-list/index';

const { spacing, radius }: typeof themeVariables = themeVariables;

export interface TabItem {
	/** Unique within the tabs; the value given to `onValueChange`. */
	id: string;
	/** Visible label and accessible name of the tab. */
	label: ReactNode;
	/** Content of the panel. */
	content: ReactNode;
	/** Decorative icon before the label. */
	icon?: ReactNode;
	/** Keeps the tab visible but skipped by the arrow keys and not selectable. */
	disabled?: boolean | undefined;
}

export interface TabsProps extends Omit<
	ComponentPropsWithRef<'div'>,
	'children' | 'defaultValue' | 'onChange'
> {
	/** Accessible name of the row of tabs, e.g. `'Report sections'`. */
	label: string;
	items: readonly TabItem[];
	/** `id` of the selected tab, to control it. */
	value?: string;
	/** `id` of the tab selected at first when uncontrolled. Defaults to the first enabled tab. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Defaults to `'automatic'`. */
	activation?: TabsActivation;
	/** Keeps the content of hidden panels mounted, e.g. to preserve what was typed in them. Defaults to `false`. */
	keepMounted?: boolean;
}

const TabRow = styled('div')(tabRowStyles);

const Tab = styled('button')(tabStyles);

const TabIcon = styled('span')(tabIconStyles);

const Panel = styled('div')({
	paddingBlock: spacing[4],
	borderRadius: radius.controlSmall,
	...focusRingStyles,
});

/**
 * Tabs switch content inside the page; to move between pages use `TabNavigation`, whose items are links. The row is a
 * single tab stop: Tab enters it on the selected tab and leaves it for the panel; Left and Right (in the reading
 * direction) move between enabled tabs, wrapping, and Home and End jump to the ends.
 */
export const Tabs = ({
	label,
	items,
	value,
	defaultValue,
	onValueChange,
	activation = 'automatic',
	keepMounted = false,
	...attributes
}: TabsProps): ReactElement => {
	const { selectedValue, tabId, panelId, select, handleKeyDown, registerTab }: TabList = useTabList(
		{ items, value, defaultValue, onValueChange, activation },
	);

	return (
		<div {...attributes}>
			<TabRow role='tablist' aria-label={label} onKeyDown={handleKeyDown}>
				{items.map((item: TabItem): ReactElement => {
					const selected: boolean = item.id === selectedValue;
					const disabled: boolean = item.disabled === true;

					return (
						<Tab
							key={item.id}
							ref={registerTab(item.id)}
							type='button'
							role='tab'
							id={tabId(item.id)}
							aria-selected={selected}
							aria-controls={panelId(item.id)}
							aria-disabled={disabled ? true : undefined}
							tabIndex={selected ? 0 : -1}
							onClick={(): void => {
								if (!disabled) select(item.id);
							}}
						>
							{item.icon === undefined ? null : <TabIcon aria-hidden='true'>{item.icon}</TabIcon>}
							{item.label}
						</Tab>
					);
				})}
			</TabRow>

			{items.map((item: TabItem): ReactElement => {
				const selected: boolean = item.id === selectedValue;

				return (
					<Panel
						key={item.id}
						role='tabpanel'
						id={panelId(item.id)}
						aria-labelledby={tabId(item.id)}
						tabIndex={0}
						hidden={!selected}
					>
						{selected || keepMounted ? item.content : null}
					</Panel>
				);
			})}
		</div>
	);
};
