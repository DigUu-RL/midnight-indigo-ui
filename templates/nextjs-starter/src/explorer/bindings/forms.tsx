// The components of `@midnight-indigo/ui/forms` in the explorer: see `explorer/bindings.ts`.
import {
	Checkbox,
	CheckboxGroup,
	Combobox,
	NumberField,
	PasswordField,
	RadioGroup,
	SearchField,
	Select,
	Slider,
	Switch,
	TextArea,
	TextField,
} from '@midnight-indigo/ui/forms';

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { CrewSelection } from '#src/explorer/examples/checkbox/select-all.tsx';
import { BountyTerms } from '#src/explorer/examples/checkbox/terms.tsx';
import { BountyAlerts } from '#src/explorer/examples/checkbox-group/channels.tsx';
import { PlanetFilter } from '#src/explorer/examples/checkbox-group/filters.tsx';
import { RegistrySearch } from '#src/explorer/examples/combobox/remote.tsx';
import { WingmanSearch } from '#src/explorer/examples/combobox/search.tsx';
import { CargoLoad } from '#src/explorer/examples/number-field/cargo.tsx';
import { BountyReward } from '#src/explorer/examples/number-field/reward.tsx';
import { HunterRegistration } from '#src/explorer/examples/password-field/new-password.tsx';
import { BebopSignIn } from '#src/explorer/examples/password-field/sign-in.tsx';
import { RewardPayment } from '#src/explorer/examples/radio-group/required.tsx';
import { FlightRoute } from '#src/explorer/examples/radio-group/routes.tsx';
import { BountySearch } from '#src/explorer/examples/search-field/filter.tsx';
import { ArchiveSearch } from '#src/explorer/examples/search-field/landmark.tsx';
import { MoonLanding } from '#src/explorer/examples/select/dependent.tsx';
import { HomePort } from '#src/explorer/examples/select/groups.tsx';
import { DeflectorSettings } from '#src/explorer/examples/slider/formatted.tsx';
import { RewardRange } from '#src/explorer/examples/slider/input.tsx';
import { Autopilot } from '#src/explorer/examples/switch/dependent.tsx';
import { BebopSettings } from '#src/explorer/examples/switch/settings.tsx';
import { Transmission } from '#src/explorer/examples/text-area/counter.tsx';
import { ShipLog } from '#src/explorer/examples/text-area/editing.tsx';
import { CrewLinks } from '#src/explorer/examples/text-field/adornments.tsx';
import { PilotContact } from '#src/explorer/examples/text-field/validation.tsx';
import { FormsPlayground } from '#src/explorer/playgrounds/forms.tsx';
import { formsSamples } from '#src/explorer/samples/forms.tsx';

export const formsBindings: SubpathBindings<'forms'> = {
	playground: FormsPlayground,
	samples: formsSamples,
	components: {
		TextField: {
			component: TextField,
			examples: { validation: PilotContact, adornments: CrewLinks },
		},
		TextArea: { component: TextArea, examples: { counter: Transmission, editing: ShipLog } },
		PasswordField: {
			component: PasswordField,
			examples: { signIn: BebopSignIn, newPassword: HunterRegistration },
		},
		SearchField: {
			component: SearchField,
			examples: { filter: BountySearch, landmark: ArchiveSearch },
		},
		NumberField: { component: NumberField, examples: { cargo: CargoLoad, reward: BountyReward } },
		Checkbox: { component: Checkbox, examples: { terms: BountyTerms, selectAll: CrewSelection } },
		CheckboxGroup: {
			component: CheckboxGroup,
			examples: { channels: BountyAlerts, filters: PlanetFilter },
		},
		RadioGroup: {
			component: RadioGroup,
			examples: { routes: FlightRoute, required: RewardPayment },
		},
		Switch: { component: Switch, examples: { settings: BebopSettings, dependent: Autopilot } },
		Select: { component: Select, examples: { groups: HomePort, dependent: MoonLanding } },
		Combobox: { component: Combobox, examples: { search: WingmanSearch, remote: RegistrySearch } },
		Slider: {
			component: Slider,
			examples: { formatted: DeflectorSettings, input: RewardRange },
		},
	},
};
