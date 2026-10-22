// The samples of the components of `@midnight-indigo/ui/forms/date-pickers`: see `explorer/samples.tsx`.
import { DatePicker } from '@midnight-indigo/ui/forms/date-pickers';

import type { SubpathSamples } from '#src/explorer/samples.tsx';

export const formsDatePickersSamples: SubpathSamples<'forms/date-pickers'> = {
	// The page passes the instant to the browser, which shows it in the time zone of the reader: at noon, it is the same
	// day from twelve hours behind the server to twelve hours ahead.
	departureDay: new Date(2071, 5, 15, 12),
	departurePicker: <DatePicker label='Departure day' />,
};
