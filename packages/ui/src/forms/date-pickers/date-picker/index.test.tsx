// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { ptBR } from 'date-fns/locale/pt-BR';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePicker } from '#src/forms/date-pickers/date-picker/index.tsx';
import { DatePickersProvider } from '#src/forms/date-pickers/date-pickers-provider/index.tsx';

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

describe('DatePicker', (): void => {
	it('is labelled, described and marked invalid with an icon beside the message', (): void => {
		render(
			<DatePickersProvider>
				<DatePicker
					label='Bounty deadline'
					description='Day the bounty expires.'
					error='Choose a future date.'
					required
					name='deadline'
				/>
			</DatePickersProvider>,
		);

		const field: HTMLElement = screen.getByRole('combobox', { name: /Bounty deadline/ });

		expect(field.getAttribute('aria-invalid')).toBe('true');
		expect(field.getAttribute('placeholder')).toBe('mm/dd/yyyy');
		expect(field).toHaveProperty('required', true);

		expect(
			screen.getByText('Choose a future date.').parentElement?.querySelector('svg'),
		).not.toBeNull();

		expect(screen.getByText('Day the bounty expires.')).toBeDefined();
	});

	it('types the date in the order of the locale, adding the separators', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider locale={ptBR}>
				<DatePicker label='Partida' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		const field: HTMLElement = screen.getByRole('combobox', { name: 'Partida' });
		await user.type(field, '1506');
		expect(field).toHaveProperty('value', '15/06');
		expect(handleValue).not.toHaveBeenCalled();

		await user.type(field, '2071');
		expect(field).toHaveProperty('value', '15/06/2071');
		expect(handleValue).toHaveBeenLastCalledWith(new Date(2071, 5, 15));
	});

	it('marks a typed day that cannot be chosen as invalid, and reports no value', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DatePicker label='Payment day' disablePast onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		const field: HTMLInputElement = screen.getByRole('combobox', { name: 'Payment day' });
		await user.type(field, '10012026');

		expect(field.validity.customError).toBe(true);
		expect(handleValue).not.toHaveBeenCalled();
	});

	it('opens on a click while focus stays in the field, and applies a preset', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DatePicker label='Departure' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		const field: HTMLElement = screen.getByRole('combobox', { name: 'Departure' });
		await user.click(field);
		const panel: HTMLElement = screen.getByLabelText('Calendar', { selector: '[role="dialog"]' });

		expect(document.activeElement).toBe(field);
		expect(field.getAttribute('aria-expanded')).toBe('true');
		expect(within(panel).getByRole('group', { name: 'Periods' })).toBeDefined();
		await user.click(within(panel).getByText('Tomorrow', { selector: 'button' }));

		expect(
			within(panel).getByText('Tomorrow', { selector: 'button' }).getAttribute('aria-pressed'),
		).toBe('true');

		expect(handleValue).not.toHaveBeenCalled();
		await user.click(within(panel).getByText('Apply', { selector: 'button' }));

		expect(handleValue).toHaveBeenCalledWith(new Date(2026, 9, 22));
		expect(field).toHaveProperty('value', '10/22/2026');
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('moves through the days with the keyboard and drops the choice on Cancel', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DatePicker label='Departure' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		const field: HTMLElement = screen.getByRole('combobox', { name: 'Departure' });
		await user.click(field);
		await user.keyboard('{ArrowDown}');

		expect(document.activeElement?.getAttribute('aria-label')).toBe(
			'Wednesday, October 21st, 2026',
		);

		expect(document.activeElement?.getAttribute('aria-current')).toBe('date');

		await user.keyboard('{ArrowRight}{ArrowDown}{Enter}');

		const chosen: HTMLElement = dayButton('Thursday, October 29th, 2026');

		expect(chosen.closest('td')?.getAttribute('aria-selected')).toBe('true');

		await user.keyboard('{PageDown}');
		expect(screen.getByRole('grid', { name: 'November 2026' })).toBeDefined();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Sunday, November 29th, 2026');

		await user.click(screen.getByText('Cancel', { selector: 'button' }));
		expect(handleValue).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(field);
	});

	it('slides the days in from the side it moves toward, and not on the first render', async (): Promise<void> => {
		const user: UserEvent = setup();

		render(
			<DatePickersProvider>
				<DatePicker label='Departure' />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('combobox', { name: 'Departure' }));

		const slideOf = (month: string): string | null | undefined => {
			return screen
				.getByLabelText(month, { selector: 'table' })
				.parentElement?.getAttribute('data-slide');
		};

		expect(slideOf('October 2026')).toBeNull();
		await user.click(screen.getByLabelText('Show the next month', { selector: 'button' }));
		expect(slideOf('November 2026')).toBe('from-right');
		await user.click(screen.getByLabelText('Show the previous month', { selector: 'button' }));
		expect(slideOf('October 2026')).toBe('from-left');
	});

	it('closes on Escape, giving focus back to the field', async (): Promise<void> => {
		const user: UserEvent = setup();

		render(
			<DatePickersProvider>
				<DatePicker label='Departure' />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('button', { name: 'Choose a date' }));

		expect(document.activeElement?.getAttribute('aria-label')).toBe(
			'Wednesday, October 21st, 2026',
		);

		await user.keyboard('{Escape}');

		expect(screen.queryByRole('dialog')).toBeNull();
		expect(document.activeElement).toBe(screen.getByRole('combobox', { name: 'Departure' }));
	});

	it('lists the years as they are scrolled, rendering only those in view', async (): Promise<void> => {
		const user: UserEvent = setup();

		render(
			<DatePickersProvider>
				<DatePicker label='Departure' />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('combobox', { name: 'Departure' }));
		await user.click(screen.getByRole('button', { name: 'Year 2026' }));
		const years: HTMLElement = screen.getByRole('listbox', { name: 'Year' });

		expect(document.activeElement).toBe(years);
		expect(within(years).getAllByRole('option').length).toBeLessThan(20);
		await user.keyboard('{End}');
		expect(within(years).getByRole('option', { name: '2076' })).toBeDefined();
		await user.keyboard('{End}');
		expect(within(years).getByRole('option', { name: '2126' })).toBeDefined();
		await user.keyboard('{Home}{ArrowDown}{Enter}');

		expect(screen.getByRole('grid', { name: 'October 1901' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Year 1901' })).toBeDefined();
	});

	it('shows two months side by side, and chooses the month in a list', async (): Promise<void> => {
		const user: UserEvent = setup();

		render(
			<DatePickersProvider>
				<DatePicker label='Departure' calendars={2} presets={false} />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('combobox', { name: 'Departure' }));

		expect(
			screen
				.getAllByRole('grid')
				.map((grid: HTMLElement): string | null => grid.getAttribute('aria-label')),
		).toEqual(['October 2026', 'November 2026']);

		expect(screen.queryByRole('group', { name: 'Periods' })).toBeNull();
		await user.click(screen.getByRole('button', { name: 'Month October' }));
		// Typed letters move to the first month they start; only the months near the active one are rendered.
		await user.keyboard('mar');
		expect(screen.getByRole('option', { name: 'March' }).getAttribute('data-active')).toBe('true');
		await user.keyboard('{Enter}');

		expect(
			screen
				.getAllByRole('grid')
				.map((grid: HTMLElement): string | null => grid.getAttribute('aria-label')),
		).toEqual(['March 2026', 'April 2026']);
	});
});
