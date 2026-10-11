// Gives one element to several refs: the one a consumer passed and the one a component keeps for itself.
import type { Ref, RefCallback } from 'react';

export const mergeReferences = <Element>(
	...references: (Ref<Element> | undefined)[]
): RefCallback<Element> => {
	return (element: Element | null): void => {
		references.forEach((reference: Ref<Element> | undefined): void => {
			if (typeof reference === 'function') {
				reference(element);
				return;
			}

			if (reference !== null && reference !== undefined) reference.current = element;
		});
	};
};

/**
 * Sets the value of a native field as the user would, so that React and form libraries receive the `input` event,
 * whether the field is controlled or not.
 */
export const setNativeValue = (
	element: HTMLInputElement | HTMLTextAreaElement,
	value: string,
): void => {
	const prototype: HTMLInputElement | HTMLTextAreaElement =
		element instanceof HTMLTextAreaElement
			? HTMLTextAreaElement.prototype
			: HTMLInputElement.prototype;

	Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
	element.dispatchEvent(new Event('input', { bubbles: true }));
};
