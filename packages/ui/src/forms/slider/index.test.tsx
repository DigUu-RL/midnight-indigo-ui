// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Slider } from '@/src/forms/slider/index';
import { expectNoAxeViolations } from '@/test/component-harness';

afterEach((): void => {
	cleanup();
});

describe('Slider', (): void => {
	it('is a named slider whose value is shown and announced as text', async (): Promise<void> => {
		const { container } = render(
			<Slider
				label='Opacity'
				defaultValue={40}
				formatValue={(value: number): string => `${String(value)} %`}
			/>,
		);

		const slider: HTMLElement = screen.getByRole('slider', { name: 'Opacity' });

		expect(slider.getAttribute('aria-valuetext')).toBe('40 %');
		expect(screen.getByText('40 %').tagName).toBe('OUTPUT');
		await expectNoAxeViolations(container);
	});

	it('reports a new value, clamped between min and max', (): void => {
		const handleValue = vi.fn();

		render(
			<Slider label='Volume' min={0} max={10} defaultValue={20} onValueChange={handleValue} />,
		);

		const slider: HTMLInputElement = screen.getByRole('slider', { name: 'Volume' });

		expect(slider.value).toBe('10');
		fireEvent.change(slider, { target: { value: '3' } });
		expect(handleValue).toHaveBeenCalledWith(3);
		expect(slider.getAttribute('aria-valuetext')).toBe('3');
	});

	it('accepts an input for precise values', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(<Slider label='Price limit' input={<button type='button'>Type a value</button>} />);

		await user.tab();
		await user.tab();
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Type a value' }));
	});
});
