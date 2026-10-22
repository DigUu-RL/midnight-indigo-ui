'use client';
import {
	DatePicker,
	DatePickersProvider,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';
import { Stack } from '@midnight-indigo/ui/layout';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { ReactElement } from 'react';

// date-fns gives the order of the sections, the names of the months and the 24-hour clock; MUI X gives the texts of
// the buttons, the dialogs and the empty sections.
export const BrazilianPortuguese = (): ReactElement => {
	return (
		<DatePickersProvider
			locale={ptBR}
			localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText}
		>
			<Stack gap='4' style={{ width: '100%', maxWidth: '20rem' }}>
				<DatePicker name='partida' label='Data da partida' />
				<TimePicker name='embarque' label='Horário do embarque' />
			</Stack>
		</DatePickersProvider>
	);
};
