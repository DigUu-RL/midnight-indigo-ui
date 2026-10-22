'use client';
// The playground of the components of `@midnight-indigo/ui/forms/date-pickers`.
import {
	DatePicker,
	DatePickersProvider,
	DateTimePicker,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';

import { createPlayground } from '#src/explorer/playground.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';

export const FormsDatePickersPlayground: PlaygroundComponent = createPlayground({
	DatePicker,
	TimePicker,
	DateTimePicker,
	DatePickersProvider,
});
