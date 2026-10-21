// The samples of the components of `@midnight-indigo/ui/forms`: see `explorer/samples.tsx`.
import {
	sampleBountyOptions,
	sampleCheckedCrew,
	sampleCrewOptions,
	samplePlanetOptions,
	sampleShipOptions,
} from '#src/explorer/sample-code.ts';
import type { SubpathSamples } from '#src/explorer/samples.tsx';

export const formsSamples: SubpathSamples<'forms'> = {
	crewOptions: sampleCrewOptions,
	checkedCrew: sampleCheckedCrew,
	shipOptions: sampleShipOptions,
	planetOptions: samplePlanetOptions,
	bountyOptions: sampleBountyOptions,
};
