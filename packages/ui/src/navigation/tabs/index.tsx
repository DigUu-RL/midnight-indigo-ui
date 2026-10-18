'use client';
// Panels of the same view, one shown at a time, switched by a row of tabs (WAI-ARIA tabs pattern).
import { styled } from '@mui/material/styles';
import { useId, useRef, useState } from 'react';
import type {
	ComponentPropsWithRef,
	KeyboardEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { focusRingStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { tabIconStyles, tabRowStyles, tabStyles } from '#src/navigation/tab-appearance/index.ts';

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

/**
 * `automatic` selects a tab as soon as the arrow keys focus it; `manual` waits for Enter or Space, for panels that
 * are slow to show.
 */
export type TabsActivation = 'automatic' | 'manual';

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
	const baseId: string = useId();
	const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);

	const tabElements: RefObject<Map<string, HTMLButtonElement>> = useRef(
		new Map<string, HTMLButtonElement>(),
	);

	const enabledItems: TabItem[] = items.filter((item: TabItem): boolean => item.disabled !== true);
	const requestedValue: string | undefined = value ?? uncontrolledValue;

	const selectedValue: string | undefined = enabledItems.some((item: TabItem): boolean => {
		return item.id === requestedValue;
	})
		? requestedValue
		: enabledItems[0]?.id;

	const tabId = (id: string): string => `${baseId}-tab-${id}`;
	const panelId = (id: string): string => `${baseId}-panel-${id}`;

	const select = (id: string): void => {
		if (id === selectedValue) return;
		if (value === undefined) setUncontrolledValue(id);
		onValueChange?.(id);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		const focusedIndex: number = enabledItems.findIndex((item: TabItem): boolean => {
			return tabElements.current.get(item.id) === event.target;
		});

		if (focusedIndex < 0 || enabledItems.length === 0) return;

		const rightToLeft: boolean = getComputedStyle(event.currentTarget).direction === 'rtl';
		const forward: string = rightToLeft ? 'ArrowLeft' : 'ArrowRight';
		const backward: string = rightToLeft ? 'ArrowRight' : 'ArrowLeft';
		const count: number = enabledItems.length;

		const targets: Record<string, number> = {
			[forward]: (focusedIndex + 1) % count,
			[backward]: (focusedIndex - 1 + count) % count,
			Home: 0,
			End: count - 1,
		};

		const targetIndex: number | undefined = targets[event.key];
		if (targetIndex === undefined) return;
		event.preventDefault();

		const target: TabItem | undefined = enabledItems[targetIndex];
		if (target === undefined) return;
		tabElements.current.get(target.id)?.focus();
		if (activation === 'automatic') select(target.id);
	};

	return (
		<div {...attributes}>
			<TabRow role='tablist' aria-label={label} onKeyDown={handleKeyDown}>
				{items.map((item: TabItem): ReactElement => {
					const selected: boolean = item.id === selectedValue;
					const disabled: boolean = item.disabled === true;

					return (
						<Tab
							key={item.id}
							ref={(element: HTMLButtonElement | null): (() => void) => {
								if (element !== null) tabElements.current.set(item.id, element);

								return (): void => {
									tabElements.current.delete(item.id);
								};
							}}
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
