// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { NumberField } from '#src/forms/number-field/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('NumberField', (): void => {
	it('reports numbers, and null while empty', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();
		const { container } = render(<NumberField label='Quantity' onValueChange={handleValue} />);
		const input: HTMLElement = screen.getByRole('spinbutton', { name: 'Quantity' });

		await user.type(input, '12');
		expect(handleValue).toHaveBeenLastCalledWith(12);
		await user.clear(input);
		expect(handleValue).toHaveBeenLastCalledWith(null);
		await expectNoAxeViolations(container);
	});

	it('steps with pointer-only buttons within min and max', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		const { container } = render(
			<NumberField
				label='Seats'
				steppers
				min={1}
				max={2}
				defaultValue={1}
				onValueChange={handleValue}
			/>,
		);

		const increase: HTMLElement = screen.getByRole('button', { name: 'Increase' });
		expect(increase.getAttribute('tabindex')).toBe('-1');

		await user.click(increase);
		await user.click(increase);
		expect(screen.getByRole('spinbutton', { name: 'Seats' })).toHaveProperty('value', '2');
		await user.click(screen.getByRole('button', { name: 'Decrease' }));

		expect(handleValue).toHaveBeenLastCalledWith(1);
		await expectNoAxeViolations(container);
	});
});
