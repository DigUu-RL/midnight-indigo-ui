// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { FormField } from '@/src/forms/form-field/index';
import type { FormFieldControlProps } from '@/src/forms/form-field/index';
import { expectNoAxeViolations } from '@/test/component-harness';

afterEach((): void => {
	cleanup();
});

describe('FormField', (): void => {
	it('gives a custom control its id, descriptions and states', async (): Promise<void> => {
		const { container } = render(
			<FormField
				label='Color'
				description='Used in charts.'
				error='Pick a color.'
				required
				controlId='color'
			>
				{(control: FormFieldControlProps): ReactNode => <input {...control} type='color' />}
			</FormField>,
		);

		const input: HTMLElement = screen.getByLabelText(/Color/);

		expect(input.id).toBe('color');
		expect(input.getAttribute('aria-describedby')).toBe('color-description color-error');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.hasAttribute('required')).toBe(true);
		await expectNoAxeViolations(container);
	});

	it('translates the loading text and hides the label visually only', (): void => {
		render(
			<FormField label='Search' hideLabel loading fieldLabels={{ loading: 'Carregando' }}>
				{(control: FormFieldControlProps): ReactNode => <input {...control} />}
			</FormField>,
		);

		const input: HTMLElement = screen.getByRole('textbox', { name: 'Search' });

		expect(document.getElementById(input.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
			'Carregando',
		);
	});
});
