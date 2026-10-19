'use client';
// Selection and keyboard behavior of a row of tabs (WAI-ARIA tabs pattern), shared by `Tabs` and the file tabs of
// `CodeBlock`, which differ in look and in what their panels hold.
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

/**
 * `automatic` selects a tab as soon as the arrow keys focus it; `manual` waits for Enter or Space, for panels that
 * are slow to show.
 */
export type TabsActivation = 'automatic' | 'manual';

export interface TabListItem {
	id: string;
	disabled?: boolean | undefined;
}

export interface TabListOptions {
	items: readonly TabListItem[];
	value: string | undefined;
	defaultValue: string | undefined;
	onValueChange: ((value: string) => void) | undefined;
	activation: TabsActivation;
}

export interface TabList {
	/** `id` of the selected tab: the requested one while it is enabled, else the first enabled tab. */
	selectedValue: string | undefined;
	tabId: (id: string) => string;
	panelId: (id: string) => string;
	select: (id: string) => void;
	/** Arrow keys (in the reading direction), Home and End, for the element with `role="tablist"`. */
	handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
	/** Ref callback of the tab button of `id`, so the keyboard can move the focus to it. */
	registerTab: (id: string) => (element: HTMLButtonElement | null) => () => void;
}

export const useTabList = ({
	items,
	value,
	defaultValue,
	onValueChange,
	activation,
}: TabListOptions): TabList => {
	const baseId: string = useId();
	const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);

	const tabElements: RefObject<Map<string, HTMLButtonElement>> = useRef(
		new Map<string, HTMLButtonElement>(),
	);

	const enabledItems: TabListItem[] = items.filter((item: TabListItem): boolean => {
		return item.disabled !== true;
	});

	const requestedValue: string | undefined = value ?? uncontrolledValue;

	const selectedValue: string | undefined = enabledItems.some((item: TabListItem): boolean => {
		return item.id === requestedValue;
	})
		? requestedValue
		: enabledItems[0]?.id;

	const select = (id: string): void => {
		if (id === selectedValue) return;
		if (value === undefined) setUncontrolledValue(id);
		onValueChange?.(id);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
		const focusedIndex: number = enabledItems.findIndex((item: TabListItem): boolean => {
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

		const target: TabListItem | undefined = enabledItems[targetIndex];
		if (target === undefined) return;
		tabElements.current.get(target.id)?.focus();
		if (activation === 'automatic') select(target.id);
	};

	const registerTab = (id: string): ((element: HTMLButtonElement | null) => () => void) => {
		return (element: HTMLButtonElement | null): (() => void) => {
			if (element !== null) tabElements.current.set(id, element);

			return (): void => {
				tabElements.current.delete(id);
			};
		};
	};

	return {
		selectedValue,
		tabId: (id: string): string => `${baseId}-tab-${id}`,
		panelId: (id: string): string => `${baseId}-panel-${id}`,
		select,
		handleKeyDown,
		registerTab,
	};
};
