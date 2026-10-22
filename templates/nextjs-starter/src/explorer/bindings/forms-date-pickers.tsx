// The components of `@midnight-indigo/ui/forms/date-pickers` in the explorer: see `explorer/bindings.ts`. The layout of
// their route puts them inside the `DatePickersProvider` of the locale of the page.
import {
	DatePicker,
	DatePickersProvider,
	DateTimePicker,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { ShoreLeave } from '#src/explorer/examples/date-picker/trip.tsx';
import { PaymentDay } from '#src/explorer/examples/date-picker/workdays.tsx';
import { BrazilianPortuguese } from '#src/explorer/examples/date-pickers-provider/brazilian-portuguese.tsx';
import { BritishEnglish } from '#src/explorer/examples/date-pickers-provider/british-english.tsx';
import { Rendezvous } from '#src/explorer/examples/date-time-picker/rendezvous.tsx';
import { GateJump } from '#src/explorer/examples/date-time-picker/window.tsx';
import { BriefingTime } from '#src/explorer/examples/time-picker/briefing.tsx';
import { DockingSlot } from '#src/explorer/examples/time-picker/docking.tsx';
import { FormsDatePickersPlayground } from '#src/explorer/playgrounds/forms-date-pickers.tsx';
import { formsDatePickersSamples } from '#src/explorer/samples/forms-date-pickers.tsx';

export const formsDatePickersBindings: SubpathBindings<'forms/date-pickers'> = {
	playground: FormsDatePickersPlayground,
	samples: formsDatePickersSamples,
	components: {
		DatePicker: { component: DatePicker, examples: { workdays: PaymentDay, trip: ShoreLeave } },
		TimePicker: {
			component: TimePicker,
			examples: { briefing: BriefingTime, docking: DockingSlot },
		},
		DateTimePicker: {
			component: DateTimePicker,
			examples: { rendezvous: Rendezvous, window: GateJump },
		},
		DatePickersProvider: {
			component: DatePickersProvider,
			examples: { brazilianPortuguese: BrazilianPortuguese, britishEnglish: BritishEnglish },
		},
	},
};
