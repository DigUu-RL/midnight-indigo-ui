// What the browser draws by itself, styled by the baseline of `UiProvider`, in Chromium, Firefox and WebKit: scrollbars
// of the page and of an inner container, native controls, autofill, selection and focus, the high contrast modes, and no
// global style at all with the baseline turned off. Update the baselines on purpose only:
// `pnpm --filter @midnight-indigo/browser-tests test:visual:update` (see the wiki, "Testes e integração contínua").
import type { CDPSession, Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '#test/support/accessibility.ts';
import { expect, test } from '#test/support/fixtures.ts';

// `border.strong`, the color of the scrollbar thumb, as browsers serialize it.
const borderStrong: string = 'rgb(110, 98, 163)';

const openScenario = async (page: Page, baseline: boolean = true): Promise<void> => {
	await page.goto(`/?scenario=native${baseline ? '' : '&baseline=false'}`);
	await page.waitForSelector('html[data-scenario-ready="true"]');

	await page.evaluate(async (): Promise<void> => {
		await document.fonts.ready;
	});
};

const computedStyleOf = async (locator: Locator, property: string): Promise<string> => {
	return locator.evaluate((element: Element, name: string): string => {
		return getComputedStyle(element).getPropertyValue(name);
	}, property);
};

// WebKit has no `scrollbar-color` and draws the `::-webkit-scrollbar` pseudo-elements instead.
const supportsScrollbarColor = async (page: Page): Promise<boolean> => {
	return page.evaluate((): boolean => CSS.supports('scrollbar-color', 'red blue'));
};

/** The rules of the document stylesheets whose selector contains `fragment`. */
const rulesMatching = async (page: Page, fragment: string): Promise<string[]> => {
	return page.evaluate((selectorFragment: string): string[] => {
		return [...document.styleSheets].flatMap((sheet: CSSStyleSheet): string[] => {
			return [...sheet.cssRules]
				.filter((rule: CSSRule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
				.filter((rule: CSSStyleRule): boolean => rule.selectorText.includes(selectorFragment))
				.map((rule: CSSStyleRule): string => rule.cssText);
		});
	}, fragment);
};

// Only Chromium draws classic scrollbars under Playwright: headless Firefox hides them and WebKit overlays them, so
// there the computed style (Firefox) and the parsed pseudo-elements (WebKit) show that the engine applies the theme.
// The end of a field, inside its border, where a short value never reaches: what the user sees as its background.
const interiorOf = async (page: Page, field: Locator): Promise<Buffer> => {
	const box: { x: number; y: number; width: number; height: number } | null =
		await field.boundingBox();

	if (box === null) throw new Error('The field is not visible.');

	return page.screenshot({
		clip: {
			x: box.x + box.width * 0.75,
			y: box.y + 4,
			width: box.width * 0.2,
			height: box.height - 8,
		},
		animations: 'allow',
		caret: 'hide',
	});
};

const isAutofilled = (element: Element): boolean => element.matches(':autofill');

/** Fills the card form from `selector` the way the user accepts a saved card, through the DevTools protocol. */
const autofillCard = async (page: Page, selector: string): Promise<void> => {
	const session: CDPSession = await page.context().newCDPSession(page);

	const { result }: { result: { objectId?: string } } = await session.send('Runtime.evaluate', {
		expression: `document.querySelector(${JSON.stringify(selector)})`,
	});

	if (result.objectId === undefined) throw new Error(`No element matches ${selector}.`);

	const { node }: { node: { backendNodeId: number } } = await session.send('DOM.describeNode', {
		objectId: result.objectId,
	});

	await session.send('Autofill.trigger', {
		fieldId: node.backendNodeId,
		card: {
			number: '4444444444444444',
			name: 'Samus Aran',
			expiryMonth: '01',
			expiryYear: '2030',
			cvc: '123',
		},
	});
};

test('the page and an inner container draw their scrollbars in the theme colors', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const container: Locator = page.getByRole('region', { name: 'Scrolling content' });

	await expect(page).toHaveScreenshot('page.png');
	await expect(container).toHaveScreenshot('scrolling-container.png');

	if (!(await supportsScrollbarColor(page))) {
		expect(await rulesMatching(page, '::-webkit-scrollbar-thumb')).toEqual(
			expect.arrayContaining([expect.stringContaining('background-color')]),
		);

		return;
	}

	expect(await computedStyleOf(page.locator('html'), 'scrollbar-color')).toContain(borderStrong);
	expect(await computedStyleOf(container, 'scrollbar-color')).toContain(borderStrong);
});

test('native controls render in the dark color scheme', async ({ page }): Promise<void> => {
	await openScenario(page);
	const controls: Locator = page.getByTestId('controls');

	expect(await computedStyleOf(page.locator('html'), 'color-scheme')).toBe('dark');
	await expect(controls).toHaveScreenshot('native-controls.png');
});

test('the engine parses the rule that keeps the colors of autofilled fields', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const rules: string[] = await rulesMatching(page, 'autofill');

	expect(rules.length).toBeGreaterThan(0);

	rules.forEach((rule: string): void => {
		expect(rule).toMatch(/box-shadow: .*inset/);
	});
});

// Only Chromium can autofill a field from a test, through the DevTools protocol, and only with a payment card.
test('an autofilled field keeps its background and text colors', async ({
	page,
	browserName,
}): Promise<void> => {
	test.skip(browserName !== 'chromium', 'Only Chromium can autofill a field from a test.');
	await openScenario(page);

	const card: Locator = page.getByTestId('card');

	// A native field and a field of the library, neither of which the autofill focuses.
	const fields: Locator[] = [card.getByLabel('Security code'), card.getByLabel('Name on card')];

	const interiorsBefore: Buffer[] = await Promise.all(
		fields.map(async (field: Locator): Promise<Buffer> => interiorOf(page, field)),
	);

	await autofillCard(page, '[name="card-number"]');

	for (const [index, field] of fields.entries()) {
		await expect.poll(async (): Promise<boolean> => field.evaluate(isAutofilled)).toBe(true);

		expect((await interiorOf(page, field)).equals(interiorsBefore[index] ?? Buffer.alloc(0))).toBe(
			true,
		);
	}

	await expect(card).toHaveScreenshot('autofilled-card.png');
});

test('the text elements, the selection and the focus ring follow the theme', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const text: Locator = page.getByTestId('text');

	await page.getByRole('link', { name: 'documentation' }).focus();
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Tab');

	await text.locator('blockquote').evaluate((element: Element): void => {
		window.getSelection()?.selectAllChildren(element);
	});

	await expect(text).toHaveScreenshot('text-selection-focus.png');
	await expectNoAxeViolations(page);
});

test('the high contrast modes keep the system colors', async ({ page }): Promise<void> => {
	await page.emulateMedia({ forcedColors: 'active' });
	await openScenario(page);

	const active: boolean = await page.evaluate((): boolean => {
		return (
			matchMedia('(forced-colors: active)').matches && CSS.supports('forced-color-adjust', 'auto')
		);
	});

	test.skip(!active, 'This engine has no high contrast modes (WebKit).');

	expect(await computedStyleOf(page.locator('html'), 'scrollbar-color')).toBe('auto');

	expect(
		await computedStyleOf(page.getByRole('link', { name: 'documentation' }), 'forced-color-adjust'),
	).toBe('auto');
});

test('with the baseline turned off, no global style is applied', async ({
	page,
}): Promise<void> => {
	await openScenario(page, false);

	// The components keep their own styles (the `TextField` its autofill colors); only the global ones are gone.
	expect(await page.locator('style[data-emotion*="global"]').count()).toBe(0);
	expect(await rulesMatching(page, ':where(')).toEqual([]);

	// The browser defaults: the margin of `body`, no background, the scrollbar of the system.
	expect(await computedStyleOf(page.locator('body'), 'margin')).toBe('8px');
	expect(await computedStyleOf(page.locator('body'), 'background-color')).toBe('rgba(0, 0, 0, 0)');

	if (await supportsScrollbarColor(page)) {
		expect(await computedStyleOf(page.locator('html'), 'scrollbar-color')).toBe('auto');
	}
});
