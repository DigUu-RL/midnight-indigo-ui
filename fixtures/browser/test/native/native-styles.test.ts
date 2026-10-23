// What the browser draws by itself, styled by the baseline of `UiProvider`, in Chromium, Firefox and WebKit: scrollbars
// of the page and of an inner container, native controls and their states, the structural elements, a modal dialog,
// autofill, selection and focus, the high contrast modes, and no global style at all with the baseline turned off. A
// catalog of every form control, field state and content element guards the whole baseline against regressions: no
// control may keep the native appearance of the browser. Update the baselines on purpose only:
// `pnpm --filter @midnight-indigo/browser-tests test:visual:update` (see the wiki, "Testes e integração contínua").
import type { CDPSession, Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '@/test/support/accessibility';
import { expect, test } from '@/test/support/fixtures';

// `border.default`, the color of the scrollbar thumb, and `surface.field`, as browsers serialize them.
const borderDefault: string = 'rgb(44, 37, 88)';
const surfaceField: string = 'rgb(8, 6, 21)';

// `border.subtle`, `border.control`, `text.muted` and `intent.brand.main`, as browsers serialize them.
const borderSubtle: string = 'rgb(30, 25, 64)';
const borderControl: string = 'rgb(110, 98, 163)';
const textMuted: string = 'rgb(151, 144, 184)';
const brandMain: string = 'rgb(94, 72, 214)';

// Native controls reset to no background nor border, and the ones the theme then draws with its own.
const resetControls: string[] = [
	'Email',
	'Date',
	'Time',
	'Country',
	'Quantity',
	'Attachment',
	'Save',
];

const drawnControls: string[] = ['Subscribed', 'Monthly', 'Volume', 'Accent'];

// Every type an `input` can have, as written in the markup: an engine that does not know one reports `text` as its type.
const inputTypes: string[] = [
	'button',
	'checkbox',
	'color',
	'date',
	'datetime-local',
	'email',
	'file',
	'hidden',
	'image',
	'month',
	'number',
	'password',
	'radio',
	'range',
	'reset',
	'search',
	'submit',
	'tel',
	'text',
	'time',
	'url',
	'week',
];

// The other elements the browser gives a style of its own, which the scenario must show too.
const nativeElements: string[] = [
	'button[type="submit"]',
	'button[type="reset"]',
	'button[type="button"]',
	'button:disabled',
	'textarea',
	'select:not([multiple], [size])',
	'select[multiple]',
	'select[size]',
	'optgroup',
	'datalist',
	'output',
	'progress[value]',
	'progress:not([value])',
	'meter',
	'input:read-only:not([type="hidden"])',
	'input:disabled',
	'input:invalid',
	'input:placeholder-shown',
	'input:indeterminate',
	'fieldset',
	'legend',
	'details',
	'details[open]',
	'summary',
	'dialog',
	'table',
	'caption',
	'thead',
	'tbody',
	'tfoot',
	'th[scope="row"]',
	'ul',
	'ol',
	'menu',
	'dl',
	'pre',
	'blockquote',
	'figure',
	'figcaption',
	'address',
	'hr',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'a[href]',
	'abbr[title]',
	'b',
	'cite',
	'code',
	'del',
	'dfn',
	'em',
	'i',
	'ins',
	'kbd',
	'mark',
	'q',
	's',
	'samp',
	'small',
	'strong',
	'sub',
	'sup',
	'time',
	'u',
	'var',
];

// Every element the baseline resets: none of them may keep the native drawing of the browser.
const controlSelector: string = 'button, input, select, textarea, progress, meter';

const openScenario = async (page: Page, baseline: boolean = true): Promise<void> => {
	await page.goto(`/?scenario=native${baseline ? '' : '&baseline=false'}`);
	await page.waitForSelector('html[data-scenario-ready="true"]');

	await page.evaluate(async (): Promise<void> => {
		await document.fonts.ready;
	});
};

const computedStyleOf = async (
	locator: Locator,
	property: string,
	pseudoElement?: string,
): Promise<string> => {
	return locator.evaluate(
		(element: Element, [name, pseudo]: [string, string | undefined]): string => {
			return getComputedStyle(element, pseudo).getPropertyValue(name);
		},
		[property, pseudoElement] as [string, string | undefined],
	);
};

/**
 * A native control of the controls panel, by its label or, for a button, by its text. The label is matched as a prefix:
 * the name of a `select` wrapped in its label also carries the selected option.
 */
const controlNamed = (page: Page, name: string): Locator => {
	const controls: Locator = page.getByTestId('controls');

	return controls
		.getByLabel(new RegExp(`^\\s*${name}\\b`))
		.or(controls.getByRole('button', { name, exact: true }));
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
	await field.scrollIntoViewIfNeeded();

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

	expect(await computedStyleOf(page.locator('html'), 'scrollbar-color')).toContain(borderDefault);
	expect(await computedStyleOf(container, 'scrollbar-color')).toContain(borderDefault);
});

test('native controls render in the dark color scheme', async ({ page }): Promise<void> => {
	await openScenario(page);
	const controls: Locator = page.getByTestId('controls');

	expect(await computedStyleOf(page.locator('html'), 'color-scheme')).toBe('dark');
	await expect(controls).toHaveScreenshot('native-controls.png');
});

test('native controls show no default style of the browser', async ({
	page,
	browserName,
}): Promise<void> => {
	await openScenario(page);
	const pageFont: string = await computedStyleOf(page.locator('body'), 'font-family');
	const pageColor: string = await computedStyleOf(page.locator('body'), 'color');

	for (const name of resetControls) {
		const control: Locator = controlNamed(page, name);

		// Firefox hides the spin buttons of a number field only with the appearance of a plain text field.
		const appearance: string =
			browserName === 'firefox' && name === 'Quantity' ? 'textfield' : 'none';

		expect(await computedStyleOf(control, 'appearance'), name).toBe(appearance);
		expect(await computedStyleOf(control, 'background-color'), name).toBe('rgba(0, 0, 0, 0)');
		expect(await computedStyleOf(control, 'border-top-width'), name).toBe('0px');

		// WebKit draws the `select` in the inherited font (`native-controls.png` shows it), but its computed style reports
		// the default font of the engine, so there only that screenshot checks the font and the color.
		const tagName: string = await control.evaluate((element: Element): string => element.tagName);
		if (browserName === 'webkit' && tagName === 'SELECT') continue;

		expect(await computedStyleOf(control, 'font-family'), name).toBe(pageFont);
		expect(await computedStyleOf(control, 'color'), name).toBe(pageColor);
	}

	// Without the native drawing, the theme draws them, so they never become invisible.
	for (const name of drawnControls) {
		const control: Locator = controlNamed(page, name);

		expect(await computedStyleOf(control, 'appearance'), name).toBe('none');
	}

	expect(await computedStyleOf(controlNamed(page, 'Accent'), 'border-top-color')).toBe(
		borderControl,
	);

	// Checked, the box and the radio take the brand color.
	for (const name of ['Subscribed', 'Monthly']) {
		const control: Locator = controlNamed(page, name);

		expect(await computedStyleOf(control, 'border-top-color'), name).toBe(brandMain);
		expect(await computedStyleOf(control, 'background-color'), name).toBe(brandMain);
	}

	expect(await computedStyleOf(controlNamed(page, 'Subscribed'), 'background-image')).toContain(
		'data:image/svg+xml',
	);

	expect(await computedStyleOf(controlNamed(page, 'Country'), 'background-image')).toContain(
		'data:image/svg+xml',
	);
});

test('the scenario shows every type of input and every element the browser styles by itself', async ({
	page,
}): Promise<void> => {
	await openScenario(page);

	const types: string[] = await page.evaluate((): string[] => {
		return [...document.querySelectorAll('input')].map((input: HTMLInputElement): string => {
			return input.getAttribute('type') ?? 'text';
		});
	});

	expect([...new Set(types)].sort()).toEqual(inputTypes);

	const missing: string[] = await page.evaluate((selectors: string[]): string[] => {
		return selectors.filter(
			(selector: string): boolean => document.querySelector(selector) === null,
		);
	}, nativeElements);

	expect(missing).toEqual([]);
});

// The regression guard of the whole baseline: a control that a new engine, a new type or a change of the baseline leaves
// with the native drawing of the browser fails here, whatever panel it is in.
test('no control keeps the native appearance of the browser', async ({
	page,
	browserName,
}): Promise<void> => {
	await openScenario(page);

	const appearances: { control: string; appearance: string }[] = await page.evaluate(
		(selector: string): { control: string; appearance: string }[] => {
			return [...document.querySelectorAll(selector)].map(
				(element: Element): { control: string; appearance: string } => {
					const type: string | null = element.getAttribute('type');

					const name: string = (
						element.closest('label')?.textContent ?? element.textContent
					).trim();

					return {
						control: `${element.tagName.toLowerCase()}${type === null ? '' : `[type="${type}"]`} ${name}`,
						appearance: getComputedStyle(element).getPropertyValue('appearance'),
					};
				},
			);
		},
		controlSelector,
	);

	expect(appearances.length).toBeGreaterThan(inputTypes.length);

	// Firefox hides the spin buttons of a number field only with the appearance of a plain text field.
	const expectedAppearance = (control: string): string => {
		return browserName === 'firefox' && control.startsWith('input[type="number"]')
			? 'textfield'
			: 'none';
	};

	const native: string[] = appearances
		.filter(({ control, appearance }: { control: string; appearance: string }): boolean => {
			return appearance !== expectedAppearance(control);
		})
		.map(({ control, appearance }: { control: string; appearance: string }): string => {
			return `${control}: ${appearance}`;
		});

	expect(native).toEqual([]);
});

test('every form control and every state of a field follow the theme', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const catalog: Locator = page.getByTestId('catalog');
	const fieldStates: Locator = page.getByTestId('field-states');

	await expect(catalog).toHaveScreenshot('form-catalog.png');

	await fieldStates.getByLabel('Hovered').hover();
	await fieldStates.getByLabel('Focused').focus();

	await expect(fieldStates).toHaveScreenshot('field-states.png');
	await expectNoAxeViolations(page);
});

test('the content elements show no default style of the browser', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const content: Locator = page.getByTestId('content');

	expect(await computedStyleOf(content.locator('tfoot tr'), 'border-top-color')).toBe(borderSubtle);
	await expect(content).toHaveScreenshot('content-elements.png');
});

test('the states of the controls, progress bars and meters follow the theme', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const states: Locator = page.getByTestId('states');

	expect(await computedStyleOf(states.getByLabel('Partially selected'), 'background-color')).toBe(
		brandMain,
	);

	for (const bar of [states.getByLabel('Upload'), states.getByLabel('Disk')]) {
		expect(await computedStyleOf(bar, 'appearance')).toBe('none');
		expect(await computedStyleOf(bar, 'background-color')).toBe(borderSubtle);
		expect(await computedStyleOf(bar, 'background-image')).toBe('none');
	}

	await expect(states).toHaveScreenshot('control-states.png');
});

// Chromium and WebKit draw the icon of a date or time field and the spin buttons of a number field as pseudo-elements,
// whose computed style they do not expose: the parsed rules show that the engine applies them, `native-controls.png`
// shows the icons. Firefox has neither (its spin buttons go away with `appearance: none`).
test('date fields show the icon of the theme on the indicator that opens the picker, number fields no spin buttons', async ({
	page,
	browserName,
}): Promise<void> => {
	test.skip(browserName === 'firefox', 'Firefox draws no indicator pseudo-element.');
	await openScenario(page);

	const indicatorRules: string[] = await rulesMatching(page, '::-webkit-calendar-picker-indicator');

	expect(indicatorRules).toEqual(
		expect.arrayContaining([
			expect.stringMatching(
				/^:where\(input\)::-webkit-calendar-picker-indicator \{.*data:image\/svg\+xml/,
			),
			expect.stringMatching(
				/^:where\(input\[type="time"\]\)::-webkit-calendar-picker-indicator \{.*data:image\/svg\+xml/,
			),
		]),
	);

	// Hidden, not removed: a click on the indicator still opens the picker.
	indicatorRules.forEach((rule: string): void => {
		expect(rule).not.toMatch(/display: none|pointer-events: none/);
	});

	expect(await rulesMatching(page, '::-webkit-inner-spin-button')).toEqual(
		expect.arrayContaining([expect.stringContaining('display: none')]),
	);
});

test('tables, lists, preformatted text, disclosures and fieldsets show no default style of the browser', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	const structure: Locator = page.getByTestId('structure');
	const header: Locator = structure.getByRole('columnheader', { name: 'Name' });

	expect(await computedStyleOf(header, 'text-transform')).toBe('uppercase');
	expect(await computedStyleOf(header, 'font-size')).toBe('11px');
	expect(await computedStyleOf(header, 'font-weight')).toBe('600');
	expect(await computedStyleOf(header, 'text-align')).toBe('start');

	const secondRow: Locator = structure.getByRole('row', { name: /Faye Valentine/ });
	expect(await computedStyleOf(secondRow, 'border-top-color')).toBe(borderSubtle);

	const summary: Locator = structure.locator('summary').first();
	expect(await computedStyleOf(summary, 'list-style-type')).toBe('none');

	expect(await computedStyleOf(summary, 'background-image', '::before')).toContain(
		'data:image/svg+xml',
	);

	expect(await computedStyleOf(structure.locator('li').first(), 'color', '::marker')).toBe(
		textMuted,
	);

	expect(await computedStyleOf(structure.locator('pre'), 'border-top-color')).toBe(borderSubtle);

	expect(await computedStyleOf(structure.locator('fieldset'), 'border-top-color')).toBe(
		borderSubtle,
	);

	await expect(structure).toHaveScreenshot('structural-elements.png');
	await expectNoAxeViolations(page);
});

test('a modal dialog dims the page with the scrim of the theme', async ({
	page,
}): Promise<void> => {
	await openScenario(page);
	await page.getByRole('button', { name: 'Open dialog' }).click();

	const dialog: Locator = page.getByRole('dialog', { name: 'Native dialog' });
	await expect(dialog).toBeVisible();

	expect(await computedStyleOf(dialog, 'background-color', '::backdrop')).toBe(
		'rgba(5, 4, 14, 0.72)',
	);

	await expect(page).toHaveScreenshot('dialog.png');
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
test('an autofilled field keeps the colors of the theme', async ({
	page,
	browserName,
}): Promise<void> => {
	test.skip(browserName !== 'chromium', 'Only Chromium can autofill a field from a test.');
	await openScenario(page);

	const card: Locator = page.getByTestId('card');

	// A field of the library and a native field, neither of which the autofill focuses.
	const libraryField: Locator = card.getByLabel('Name on card');
	const nativeField: Locator = card.getByLabel('Security code');
	const interiorBefore: Buffer = await interiorOf(page, libraryField);

	await autofillCard(page, '[name="card-number"]');

	for (const field of [libraryField, nativeField]) {
		await expect.poll(async (): Promise<boolean> => field.evaluate(isAutofilled)).toBe(true);
	}

	expect((await interiorOf(page, libraryField)).equals(interiorBefore)).toBe(true);

	// The native field has no background of its own, so the autofill paints the field of the theme.
	expect(await computedStyleOf(nativeField, 'box-shadow')).toContain(surfaceField);

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

	// The controls, progress bars and meters get their system look back, so their boundaries stay visible. A file input
	// has no appearance of its own: its button does.
	const controls: string[] = [...resetControls, ...drawnControls].filter(
		(name: string): boolean => name !== 'Attachment',
	);

	for (const name of controls) {
		expect(await computedStyleOf(controlNamed(page, name), 'appearance'), name).not.toBe('none');
	}

	const states: Locator = page.getByTestId('states');

	for (const name of ['Upload', 'Disk']) {
		expect(await computedStyleOf(states.getByLabel(name), 'appearance'), name).not.toBe('none');
	}

	// The marker of the system takes the place of the chevron, an image in a fixed color.
	const summary: Locator = page.getByTestId('structure').locator('summary').first();

	expect(await computedStyleOf(summary, 'display')).toBe('list-item');
	expect(await computedStyleOf(summary, 'display', '::before')).toBe('none');
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
