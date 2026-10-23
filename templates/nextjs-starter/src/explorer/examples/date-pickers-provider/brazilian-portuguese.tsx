'use client';
import {
	DatePicker,
	DatePickersProvider,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';
import { Stack } from '@midnight-indigo/ui/layout';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactElement } from 'react';

// date-fns gives the order of the parts, the names of the months and of the days, the week from Sunday and the 24-hour
// clock. The texts of the buttons and of the presets come from the messages of `I18nProvider`.
export const BrazilianPortuguese = (): ReactElement => {
	return (
		<DatePickersProvider locale={ptBR}>
			<Stack gap='4' style={{ width: '100%', maxWidth: '20rem' }}>
				<DatePicker name='partida' label='Data da partida' />
				<TimePicker name='embarque' label='Horário do embarque' />
			</Stack>
		</DatePickersProvider>
	);
};
