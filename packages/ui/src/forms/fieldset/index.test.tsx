// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { TextField } from '@/src/forms/text-field/index';
import { Fieldset } from '@/src/forms/fieldset/index';

afterEach((): void => {
	cleanup();
});

describe('Fieldset', (): void => {
	it('names a group with its legend, describes it and disables every control inside', async (): Promise<void> => {
		const { container } = render(
			<Fieldset legend='Delivery address' description='Where the order goes.' disabled>
				<TextField label='Street' />
				<TextField label='City' />
			</Fieldset>,
		);

		const group: HTMLElement = screen.getByRole('group', { name: 'Delivery address' });

		expect(document.getElementById(group.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
			'Where the order goes.',
		);

		// A disabled fieldset disables its controls without setting their attribute.
		expect(screen.getByRole('textbox', { name: 'Street' }).matches(':disabled')).toBe(true);
		await expectNoAxeViolations(container);
	});
});
