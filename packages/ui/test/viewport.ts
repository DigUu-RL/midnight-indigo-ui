// Viewport width for component tests. jsdom has no layout: it has no `matchMedia` and ignores `@media` rules when it
// computes styles, so a component hidden below a breakpoint (`display: none`, shown again inside `@media`) would stay
// hidden from the accessibility tree at every width. This emulates both for the `min-width` queries of the breakpoints.
import { act } from '@testing-library/react';

type ChangeListener = (event: MediaQueryListEvent) => void;

interface EmulatedMediaQueryList {
	media: string;
	matches: boolean;
	onchange: null;
	addEventListener: (type: string, listener: ChangeListener) => void;
	removeEventListener: (type: string, listener: ChangeListener) => void;
	addListener: (listener: ChangeListener) => void;
	removeListener: (listener: ChangeListener) => void;
	dispatchEvent: () => boolean;
}

interface MediaQueryRecord {
	list: EmulatedMediaQueryList;
	listeners: Set<ChangeListener>;
}

// Media queries always measure `em` against the browser default font size.
const pixelsPerEm: number = 16;
const minimumWidthQuery: RegExp = /^\(min-width: ([\d.]+)em\)$/;
const minimumWidthRule: RegExp = /^@media \(min-width: ([\d.]+)em\)\{(.*)\}$/s;
const records: Set<MediaQueryRecord> = new Set<MediaQueryRecord>();
let viewportWidth: number = 1024;
let styleObserver: MutationObserver | undefined;

const reaches = (minimumWidthInEm: string): boolean => {
	return viewportWidth >= Number(minimumWidthInEm) * pixelsPerEm;
};

// Queries other than `min-width` (e.g. reduced motion) never match.
const evaluate = (query: string): boolean => {
	const minimumWidth: string | undefined = minimumWidthQuery.exec(query)?.[1];
	return minimumWidth !== undefined && reaches(minimumWidth);
};

const matchMedia = (query: string): MediaQueryList => {
	const listeners: Set<ChangeListener> = new Set<ChangeListener>();

	const list: EmulatedMediaQueryList = {
		media: query,
		matches: evaluate(query),
		onchange: null,
		addEventListener: (_type: string, listener: ChangeListener): void => {
			listeners.add(listener);
		},
		removeEventListener: (_type: string, listener: ChangeListener): void => {
			listeners.delete(listener);
		},
		addListener: (listener: ChangeListener): void => {
			listeners.add(listener);
		},
		removeListener: (listener: ChangeListener): void => {
			listeners.delete(listener);
		},
		dispatchEvent: (): boolean => true,
	};

	records.add({ list, listeners });
	return list as unknown as MediaQueryList;
};

/**
 * Emotion writes one `<style>` per rule outside production. A `@media (min-width)` rule that matches the viewport is
 * replaced by its inner rule, which comes after the base rule and wins as it would in a browser; the original is kept
 * in `data-test-media-rule` to restore it.
 */
const applyToStyle = (style: HTMLStyleElement): void => {
	const original: string = style.dataset.testMediaRule ?? style.textContent;
	const match: RegExpExecArray | null = minimumWidthRule.exec(original);
	const minimumWidth: string | undefined = match?.[1];
	const body: string | undefined = match?.[2];
	if (minimumWidth === undefined || body === undefined) return;

	style.dataset.testMediaRule = original;
	style.textContent = reaches(minimumWidth) ? body : original;
};

const emotionStyles = (): HTMLStyleElement[] => {
	return [...document.querySelectorAll<HTMLStyleElement>('style[data-emotion]')];
};

/** Applies the viewport to the styles inserted so far, e.g. right after `render`; later ones are applied on their own. */
export const applyViewportStyles = (): void => {
	for (const style of emotionStyles()) applyToStyle(style);
};

/** Sets the width before rendering: `matchMedia` answers for it. Undo it with `resetViewport` after each test. */
export const setViewportWidth = (width: number): void => {
	viewportWidth = width;

	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		writable: true,
		value: matchMedia,
	});

	styleObserver?.disconnect();

	// Emotion inserts the `<style>` and then its text, so the observer applies the viewport once both are there.
	styleObserver = new MutationObserver((): void => {
		applyViewportStyles();
	});

	styleObserver.observe(document.head, { childList: true });
};

/** Changes the width of a rendered page: notifies the media queries that change and reapplies the styles. */
export const resizeViewport = (width: number): void => {
	act((): void => {
		viewportWidth = width;
		applyViewportStyles();

		for (const { list, listeners } of records) {
			const matches: boolean = evaluate(list.media);
			if (matches === list.matches) continue;
			list.matches = matches;

			for (const listener of listeners) {
				listener({ matches, media: list.media } as MediaQueryListEvent);
			}
		}
	});

	applyViewportStyles();
};

/** Restores `matchMedia` and the original `@media` rules, which Emotion keeps between the tests of a file. */
export const resetViewport = (): void => {
	styleObserver?.disconnect();
	styleObserver = undefined;
	records.clear();

	for (const style of emotionStyles()) {
		const original: string | undefined = style.dataset.testMediaRule;
		if (original === undefined) continue;
		style.textContent = original;
		delete style.dataset.testMediaRule;
	}

	Reflect.deleteProperty(window, 'matchMedia');
};
