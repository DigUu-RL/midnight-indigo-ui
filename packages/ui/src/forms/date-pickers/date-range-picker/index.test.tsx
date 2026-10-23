// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePickersProvider } from '#src/forms/date-pickers/date-pickers-provider/index.tsx';
import { DateRangePicker } from '#src/forms/date-pickers/date-range-picker/index.tsx';

beforeEach((): void => {
	vi.useFakeTimers({ now: new Date(2026, 9, 21, 10), shouldAdvanceTime: true });
});

afterEach((): void => {
	cleanup();
	vi.useRealTimers();
});

const setup = (): UserEvent => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

// By its name, which is cheaper to find than a role among the many days of a calendar.
const dayButton = (name: string | RegExp): HTMLElement => {
	return screen.getByLabelText(name, { selector: 'button' });
};

const selectionOf = (name: string): string | null | undefined => {
	return dayButton(name).closest('td')?.getAttribute('data-selection');
};

describe('DateRangePicker', (): void => {
	it('names its two fields by the label and by their end', (): void => {
		render(
			<DatePickersProvider>
				<DateRangePicker label='Shore leave' startName='leaveStart' endName='leaveEnd' />
			</DatePickersProvider>,
		);

		expect(screen.getByRole('combobox', { name: 'Shore leave Start' })).toHaveProperty(
			'name',
			'leaveStart',
		);

		expect(screen.getByRole('combobox', { name: 'Shore leave End' })).toHaveProperty(
			'name',
			'leaveEnd',
		);
	});

	it('shows two months, previews the range under the pointer and applies it', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DateRangePicker label='Shore leave' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('combobox', { name: 'Shore leave Start' }));

		const panel: HTMLElement = screen.getByLabelText('Choose a period', {
			selector: '[role="dialog"]',
		});

		expect(panel.querySelectorAll('[role="grid"]')).toHaveLength(2);
		await user.click(dayButton('Monday, October 26th, 2026'));

		expect(within(panel).getByText('Apply', { selector: 'button' })).toHaveProperty(
			'disabled',
			true,
		);

		await user.hover(dayButton('Wednesday, November 4th, 2026'));
		expect(selectionOf('Saturday, October 31st, 2026')).toBe('preview');

		await user.click(dayButton('Wednesday, November 4th, 2026'));
		expect(selectionOf('Monday, October 26th, 2026, start of the period')).toBe('start');
		expect(selectionOf('Saturday, October 31st, 2026')).toBe('inside');
		expect(selectionOf('Wednesday, November 4th, 2026, end of the period')).toBe('end');

		await user.click(within(panel).getByText('Apply', { selector: 'button' }));

		expect(handleValue).toHaveBeenCalledWith({
			start: new Date(2026, 9, 26),
			end: new Date(2026, 10, 4),
		});

		expect(screen.getByRole('combobox', { name: 'Shore leave Start' })).toHaveProperty(
			'value',
			'10/26/2026',
		);

		expect(screen.getByRole('combobox', { name: 'Shore leave End' })).toHaveProperty(
			'value',
			'11/04/2026',
		);
	});

	it('offers periods, and keeps out the ends past its longest length', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DateRangePicker label='Shore leave' maxDays={10} onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('combobox', { name: 'Shore leave Start' }));

		expect(screen.getByText('Next 30 days', { selector: 'button' })).toHaveProperty(
			'disabled',
			true,
		);

		await user.click(screen.getByText('Next 7 days', { selector: 'button' }));
		await user.click(screen.getByText('Apply', { selector: 'button' }));

		expect(handleValue).toHaveBeenCalledWith({
			start: new Date(2026, 9, 21),
			end: new Date(2026, 9, 27),
		});

		await user.click(screen.getByRole('combobox', { name: 'Shore leave Start' }));
		await user.click(screen.getByText('Clear', { selector: 'button' }));
		await user.click(dayButton('Thursday, October 22nd, 2026'));

		expect(dayButton('Saturday, October 31st, 2026').getAttribute('aria-disabled')).toBeNull();

		expect(dayButton('Sunday, November 1st, 2026').getAttribute('aria-disabled')).toBe('true');
	});

	it('types each end, and refuses an end before the start', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DateRangePicker label='Shore leave' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		await user.type(screen.getByRole('combobox', { name: 'Shore leave Start' }), '11102026');
		expect(handleValue).toHaveBeenLastCalledWith({ start: new Date(2026, 10, 10), end: null });

		const end: HTMLInputElement = screen.getByRole('combobox', { name: 'Shore leave End' });
		await user.type(end, '11012026');
		expect(end.validity.customError).toBe(true);
		await user.clear(end);
		await user.type(end, '11202026');

		expect(handleValue).toHaveBeenLastCalledWith({
			start: new Date(2026, 10, 10),
			end: new Date(2026, 10, 20),
		});
	});
});
