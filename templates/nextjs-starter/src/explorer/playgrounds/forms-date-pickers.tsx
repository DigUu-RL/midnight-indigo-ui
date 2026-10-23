'use client';
// The playground of the components of `@midnight-indigo/ui/forms/date-pickers`.
import {
	DatePicker,
	DatePickersProvider,
	DateRangePicker,
	DateTimePicker,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';

import { createPlayground } from '@/src/explorer/playground';
import type { PlaygroundComponent } from '@/src/explorer/playground';

export const FormsDatePickersPlayground: PlaygroundComponent = createPlayground({
	DatePicker,
	DateRangePicker,
	TimePicker,
	DateTimePicker,
	DatePickersProvider,
});
