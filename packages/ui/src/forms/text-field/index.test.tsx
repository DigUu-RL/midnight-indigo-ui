// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { TextField } from '@/src/forms/text-field/index';

afterEach((): void => {
	cleanup();
});

describe('TextField', (): void => {
	it('is named by its label, not by its placeholder', async (): Promise<void> => {
		const { container } = render(
			<TextField label='Email address' placeholder='name@example.com' />,
		);

		const input: HTMLElement = screen.getByRole('textbox', { name: 'Email address' });

		expect(input.getAttribute('placeholder')).toBe('name@example.com');
		await expectNoAxeViolations(container);
	});

	it('describes itself with the description, the adornments and the error, in that order', async (): Promise<void> => {
		const { container } = render(
			<TextField
				label='Price'
				description='Including taxes.'
				prefix='R$'
				suffix='per month'
				error='Enter a price.'
			/>,
		);

		const input: HTMLElement = screen.getByRole('textbox', { name: 'Price' });

		expect(input.getAttribute('aria-invalid')).toBe('true');

		const description: string = (input.getAttribute('aria-describedby') ?? '')
			.split(' ')
			.map((id: string): string => document.getElementById(id)?.textContent ?? '')
			.join(' | ');

		expect(description).toBe('Including taxes. | Enter a price. | R$ | per month');
		expect(screen.getByText('Enter a price.').parentElement?.querySelector('svg')).not.toBeNull();
		await expectNoAxeViolations(container);
	});

	it('is not invalid without an error, and never renders an empty message', (): void => {
		render(<TextField label='Name' error='' />);
		const input: HTMLElement = screen.getByRole('textbox', { name: 'Name' });

		expect(input.hasAttribute('aria-invalid')).toBe(false);
		expect(input.hasAttribute('aria-describedby')).toBe(false);
	});

	it('marks required with an asterisk hidden from assistive technologies and the native attribute', (): void => {
		render(<TextField label='Name' required />);
		const input: HTMLElement = screen.getByRole('textbox', { name: 'Name' });

		expect(input.hasAttribute('required')).toBe(true);
		expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true');
	});

	it('works uncontrolled and controlled, with onChange and onValueChange', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		const Controlled = (): ReactElement => {
			const [value, setValue] = useState<string>('');
			return <TextField label='Controlled' value={value} onValueChange={setValue} />;
		};

		render(
			<>
				<TextField label='Uncontrolled' defaultValue='a' onValueChange={handleValue} />
				<Controlled />
			</>,
		);

		await user.type(screen.getByRole('textbox', { name: 'Uncontrolled' }), 'b');
		await user.type(screen.getByRole('textbox', { name: 'Controlled' }), 'xy');

		expect(handleValue).toHaveBeenLastCalledWith('ab');
		expect(screen.getByRole('textbox', { name: 'Controlled' })).toHaveProperty('value', 'xy');
	});

	it('keeps disabled, read-only and loading distinct', (): void => {
		render(
			<>
				<TextField label='Disabled' disabled />
				<TextField label='Read only' readOnly defaultValue='fixed' />
				<TextField label='Loading' loading />
			</>,
		);

		expect(screen.getByRole('textbox', { name: 'Disabled' }).hasAttribute('disabled')).toBe(true);
		expect(screen.getByRole('textbox', { name: 'Read only' }).hasAttribute('readonly')).toBe(true);

		const loading: HTMLElement = screen.getByRole('textbox', { name: 'Loading' });
		expect(loading.getAttribute('aria-busy')).toBe('true');

		expect(
			document.getElementById(loading.getAttribute('aria-describedby') ?? '')?.textContent,
		).toBe('Loading');
	});

	it('submits with its name in a plain form', (): void => {
		const { container } = render(
			<form>
				<TextField label='City' name='city' defaultValue='Recife' />
			</form>,
		);

		const form: HTMLFormElement | null = container.querySelector('form');
		expect(new FormData(form ?? undefined).get('city')).toBe('Recife');
	});

	it('forwards ref and attributes to the input, className to the root', (): void => {
		const reference: { current: HTMLInputElement | null } = { current: null };

		const { container } = render(
			<TextField label='Name' ref={reference} autoComplete='name' className='custom' />,
		);

		expect(reference.current?.getAttribute('autocomplete')).toBe('name');
		expect(container.firstElementChild?.classList.contains('custom')).toBe(true);
	});

	it('keeps the same visual states (regression)', (): void => {
		render(
			<>
				<TextField label='Rest' data-testid='field' />
				<TextField label='Invalid' error='Wrong' data-testid='field' />
				<TextField label='Disabled' disabled data-testid='field' />
				<TextField label='Read only' readOnly data-testid='field' />
			</>,
		);

		const snapshot: Record<string, string[]> = Object.fromEntries(
			screen.getAllByTestId('field').map((input: HTMLElement): [string, string[]] => {
				const label: string = (input as HTMLInputElement).labels?.[0]?.textContent ?? '';
				return [label, styleRulesOf(input.parentElement ?? input)];
			}),
		);

		expect(snapshot).toMatchSnapshot();
	});
});
