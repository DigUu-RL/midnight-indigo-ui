// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { ptBR } from 'date-fns/locale/pt-BR';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePickersProvider } from '#src/forms/date-pickers/date-pickers-provider/index.tsx';
import { DateTimePicker } from '#src/forms/date-pickers/date-time-picker/index.tsx';
import { TimePicker } from '#src/forms/date-pickers/time-picker/index.tsx';

beforeEach((): void => {
	vi.useFakeTimers({ now: new Date(2026, 9, 21, 10, 7), shouldAdvanceTime: true });
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

describe('TimePicker', (): void => {
	it('follows the clock of the locale, unless ampm is set', (): void => {
		render(
			<DatePickersProvider locale={ptBR}>
				<TimePicker label='Embarque' />
				<TimePicker label='Docking' ampm />
			</DatePickersProvider>,
		);

		expect(screen.getByRole('combobox', { name: 'Embarque' }).getAttribute('placeholder')).toBe(
			'hh:mm',
		);

		expect(screen.getByRole('combobox', { name: 'Docking' }).getAttribute('placeholder')).toBe(
			'hh:mm AM',
		);
	});

	it('chooses the hours and the minutes in lists, by steps, within its bounds', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider locale={ptBR}>
				<TimePicker
					label='Briefing'
					minuteStep={15}
					minTime={new Date(2026, 0, 1, 8)}
					maxTime={new Date(2026, 0, 1, 18)}
					onValueChange={handleValue}
				/>
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('button', { name: 'Choose a time' }));

		const panel: HTMLElement = screen.getByLabelText('Choose a time', {
			selector: '[role="dialog"]',
		});

		const hours: HTMLElement = within(panel).getByRole('listbox', { name: 'Hours' });

		expect(within(hours).getByRole('option', { name: '07' }).getAttribute('aria-disabled')).toBe(
			'true',
		);

		expect(within(panel).getByRole('listbox', { name: 'Minutes' }).children).toHaveLength(4);
		await user.click(within(hours).getByRole('option', { name: '09' }));
		await user.keyboard('{ArrowDown}');
		await user.click(within(panel).getByRole('option', { name: '45' }));
		await user.click(within(panel).getByText('Apply', { selector: 'button' }));

		expect(handleValue).toHaveBeenCalledWith(new Date(2026, 9, 21, 10, 45));
		expect(screen.getByRole('combobox', { name: 'Briefing' })).toHaveProperty('value', '10:45');
	});
});

describe('DateTimePicker', (): void => {
	it('types a date and a time, and reports them once complete', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DateTimePicker label='Rendezvous' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		const field: HTMLElement = screen.getByRole('combobox', { name: 'Rendezvous' });
		await user.type(field, '031520260930');
		expect(field).toHaveProperty('value', '03/15/2026 09:30');
		expect(handleValue).not.toHaveBeenCalled();

		await user.type(field, 'p');
		expect(field).toHaveProperty('value', '03/15/2026 09:30 PM');
		expect(handleValue).toHaveBeenLastCalledWith(new Date(2026, 2, 15, 21, 30));
	});

	it('chooses a day in the calendar and a time in the lists of the same panel', async (): Promise<void> => {
		const user: UserEvent = setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider locale={ptBR}>
				<DateTimePicker label='Salto' minuteStep={30} onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		await user.click(screen.getByRole('combobox', { name: 'Salto' }));
		await user.click(dayButton(/^sexta-feira, 23 de outubro de 2026/));

		await user.click(
			within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '14' }),
		);

		await user.click(
			within(screen.getByRole('listbox', { name: 'Minutes' })).getByRole('option', { name: '30' }),
		);

		await user.click(screen.getByText('Apply', { selector: 'button' }));

		expect(handleValue).toHaveBeenCalledWith(new Date(2026, 9, 23, 14, 30));

		expect(screen.getByRole('combobox', { name: 'Salto' })).toHaveProperty(
			'value',
			'23/10/2026 14:30',
		);
	});
});
