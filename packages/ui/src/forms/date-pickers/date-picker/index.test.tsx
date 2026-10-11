// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { ptBR as datePtBR } from 'date-fns/locale/pt-BR';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DatePicker } from '#src/forms/date-pickers/date-picker/index.tsx';
import { DatePickersProvider } from '#src/forms/date-pickers/date-pickers-provider/index.tsx';
import { DateTimePicker } from '#src/forms/date-pickers/date-time-picker/index.tsx';
import { TimePicker } from '#src/forms/date-pickers/time-picker/index.tsx';

afterEach((): void => {
	cleanup();
});

const sectionsOf = (group: HTMLElement): string[] => {
	return [...group.querySelectorAll('[role="spinbutton"]')].map((section: Element): string => {
		return section.getAttribute('aria-label') ?? '';
	});
};

describe('DatePicker, TimePicker and DateTimePicker', (): void => {
	it('are labelled, described and marked invalid with an icon beside the message', (): void => {
		render(
			<DatePickersProvider>
				<DatePicker
					label='Due date'
					description='Day the report is due.'
					error='Choose a future date.'
					required
					name='due'
				/>
			</DatePickersProvider>,
		);

		const field: HTMLElement = screen.getByRole('group', { name: /Due date/ });
		const message: HTMLElement = screen.getByText('Choose a future date.');

		expect(field.getAttribute('aria-invalid')).toBe('true');
		expect(field.getAttribute('aria-describedby')).not.toBeNull();
		expect(message.parentElement?.querySelector('svg')).not.toBeNull();
		expect(screen.getByText('Day the report is due.')).toBeDefined();
	});

	it('follow the locale given to the provider: section order and texts', (): void => {
		render(
			<DatePickersProvider
				locale={datePtBR}
				localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
			>
				<DatePicker label='Vencimento' />
				<TimePicker label='Horário' />
			</DatePickersProvider>,
		);

		expect(sectionsOf(screen.getByRole('group', { name: 'Vencimento' }))).toEqual([
			'Dia',
			'Mês',
			'Ano',
		]);

		expect(sectionsOf(screen.getByRole('group', { name: 'Horário' }))).toEqual([
			'Horas',
			'Minutos',
		]);

		expect(screen.getByRole('button', { name: /Escolha uma data/ })).toBeDefined();
	});

	it('report a complete date, typed in sections with the keyboard', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		render(
			<DatePickersProvider>
				<DateTimePicker label='Meeting' onValueChange={handleValue} />
			</DatePickersProvider>,
		);

		const [month]: HTMLElement[] = screen.getAllByRole('spinbutton');
		if (month === undefined) throw new Error('The picker has no sections.');
		await user.click(month);
		await user.keyboard('03152026');
		// A date typed only in part is not a value yet.
		expect(handleValue).not.toHaveBeenCalled();

		await user.keyboard('0930AM');
		const value: unknown = handleValue.mock.lastCall?.[0];

		expect(value).toBeInstanceOf(Date);
		expect((value as Date).getFullYear()).toBe(2026);
		expect((value as Date).getHours()).toBe(9);
	});
});
