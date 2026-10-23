// The samples of the components of `@midnight-indigo/ui/forms`: see `explorer/samples.tsx`.
import { Button } from '@midnight-indigo/ui/buttons';
import { FormActions, SubmitButton, TextField } from '@midnight-indigo/ui/forms';

import { departureControl } from '@/src/explorer/client-samples';
import {
	sampleBountyOptions,
	sampleCheckedCrew,
	sampleCrewOptions,
	sampleMissionErrors,
	samplePlanetOptions,
	sampleShipOptions,
} from '@/src/explorer/sample-code';
import type { SubpathSamples } from '@/src/explorer/samples';

export const formsSamples: SubpathSamples<'forms'> = {
	crewOptions: sampleCrewOptions,
	checkedCrew: sampleCheckedCrew,
	shipOptions: sampleShipOptions,
	planetOptions: samplePlanetOptions,
	bountyOptions: sampleBountyOptions,
	hunterFields: (
		<>
			<TextField label='Callsign' name='callsign' required minLength={3} />
			<TextField label='Email' name='email' type='email' autoComplete='email' />

			<FormActions>
				<SubmitButton>Register the hunter</SubmitButton>
			</FormActions>
		</>
	),
	departureControl,
	landingFields: (
		<>
			<TextField label='Planet' name='planet' />
			<TextField label='Dock' name='dock' />
		</>
	),
	routeButtons: (
		<>
			<Button variant='solid'>Save the route</Button>
			<Button variant='ghost'>Cancel</Button>
		</>
	),
	missionErrors: sampleMissionErrors,
	noFocusKey: null,
};
