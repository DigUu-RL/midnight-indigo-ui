// The components of `@midnight-indigo/ui/forms` in the explorer: see `explorer/bindings.ts`.
import {
	NumberField,
	PasswordField,
	SearchField,
	TextArea,
	TextField,
} from '@midnight-indigo/ui/forms';

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { CargoLoad } from '#src/explorer/examples/number-field/cargo.tsx';
import { BountyReward } from '#src/explorer/examples/number-field/reward.tsx';
import { HunterRegistration } from '#src/explorer/examples/password-field/new-password.tsx';
import { BebopSignIn } from '#src/explorer/examples/password-field/sign-in.tsx';
import { BountySearch } from '#src/explorer/examples/search-field/filter.tsx';
import { ArchiveSearch } from '#src/explorer/examples/search-field/landmark.tsx';
import { Transmission } from '#src/explorer/examples/text-area/counter.tsx';
import { ShipLog } from '#src/explorer/examples/text-area/editing.tsx';
import { CrewLinks } from '#src/explorer/examples/text-field/adornments.tsx';
import { PilotContact } from '#src/explorer/examples/text-field/validation.tsx';
import { FormsPlayground } from '#src/explorer/playgrounds/forms.tsx';

export const formsBindings: SubpathBindings<'forms'> = {
	playground: FormsPlayground,
	// The text fields take texts and numbers alone, so no prop of theirs takes a sample.
	samples: {},
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
	},
};
