// The components of `@midnight-indigo/ui/forms/date-pickers` in the explorer: see `explorer/bindings.ts`. The layout of
// their route puts them inside the `DatePickersProvider` of the locale of the page.
import {
	DatePicker,
	DatePickersProvider,
	DateRangePicker,
	DateTimePicker,
	TimePicker,
} from '@midnight-indigo/ui/forms/date-pickers';

import type { SubpathBindings } from '@/src/explorer/bindings';
import { ShoreLeave } from '@/src/explorer/examples/date-picker/trip';
import { PaymentDay } from '@/src/explorer/examples/date-picker/workdays';
import { BrazilianPortuguese } from '@/src/explorer/examples/date-pickers-provider/brazilian-portuguese';
import { BritishEnglish } from '@/src/explorer/examples/date-pickers-provider/british-english';
import { HuntWindow } from '@/src/explorer/examples/date-range-picker/presets';
import { ShoreLeave as ShoreLeaveRange } from '@/src/explorer/examples/date-range-picker/shore-leave';
import { Rendezvous } from '@/src/explorer/examples/date-time-picker/rendezvous';
import { GateJump } from '@/src/explorer/examples/date-time-picker/window';
import { BriefingTime } from '@/src/explorer/examples/time-picker/briefing';
import { DockingSlot } from '@/src/explorer/examples/time-picker/docking';
import { FormsDatePickersPlayground } from '@/src/explorer/playgrounds/forms-date-pickers';
import { formsDatePickersSamples } from '@/src/explorer/samples/forms-date-pickers';

export const formsDatePickersBindings: SubpathBindings<'forms/date-pickers'> = {
	playground: FormsDatePickersPlayground,
	samples: formsDatePickersSamples,
	components: {
		DatePicker: { component: DatePicker, examples: { workdays: PaymentDay, trip: ShoreLeave } },
		DateRangePicker: {
			component: DateRangePicker,
			examples: { shoreLeave: ShoreLeaveRange, presets: HuntWindow },
		},
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
