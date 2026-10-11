// Helpers for component tests: accessibility audit and the style rules that Emotion generated for an element.
import axe from 'axe-core';
import type { AxeResults, Result } from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core on rendered markup. Contrast is skipped because jsdom does not paint: the token pairs used by the
 * components are checked by `auditContrast` instead.
 */
export const expectNoAxeViolations = async (container: Element): Promise<void> => {
	const results: AxeResults = await axe.run(container, {
		rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
	});

	const violations: string[] = results.violations.map((violation: Result): string => {
		return `${violation.id}: ${violation.help}`;
	});

	expect(violations).toEqual([]);
};

const emotionClassPattern: RegExp = /^css-[\da-z]+$/;

/**
 * Every rule Emotion inserted for the element (outside production Emotion writes one `<style>` per rule), with the
 * generated class replaced by `&`: a readable record of the resting, hover, pressed, focus and disabled looks.
 */
export const styleRulesOf = (element: Element): string[] => {
	const classNames: string[] = [...element.classList].filter((className: string): boolean => {
		return emotionClassPattern.test(className);
	});

	expect(classNames, 'The element has no Emotion class.').not.toHaveLength(0);

	const rules: string[] = [...document.querySelectorAll('style[data-emotion]')].map(
		(style: Element): string => style.textContent,
	);

	return classNames.flatMap((className: string): string[] => {
		const selector: string = `.${className}`;

		return rules
			.filter((rule: string): boolean => rule.includes(selector))
			.map((rule: string): string => rule.replaceAll(selector, '&'));
	});
};

/** The declarations of the first rule whose selector (with `&` for the element) is exactly `selector`. */
export const declarationsOf = (element: Element, selector: string): string => {
	const prefix: string = `${selector}{`;

	const rule: string | undefined = styleRulesOf(element).find((candidate: string): boolean => {
		return candidate.startsWith(prefix);
	});

	expect(rule, `No rule for ${selector}.`).toBeDefined();
	return rule?.slice(prefix.length, -1) ?? '';
};
