// The components of `@midnight-indigo/ui/forms` in the explorer: see `explorer/bindings.ts`.
import {
	Checkbox,
	CheckboxGroup,
	Combobox,
	ErrorSummary,
	Fieldset,
	FileUpload,
	Form,
	FormActions,
	FormField,
	NumberField,
	PasswordField,
	RadioGroup,
	SearchField,
	Select,
	Slider,
	SubmitButton,
	Switch,
	TextArea,
	TextField,
} from '@midnight-indigo/ui/forms';

import type { SubpathBindings } from '@/src/explorer/bindings';
import { CrewSelection } from '@/src/explorer/examples/checkbox/select-all';
import { BountyTerms } from '@/src/explorer/examples/checkbox/terms';
import { BountyAlerts } from '@/src/explorer/examples/checkbox-group/channels';
import { PlanetFilter } from '@/src/explorer/examples/checkbox-group/filters';
import { RegistrySearch } from '@/src/explorer/examples/combobox/remote';
import { WingmanSearch } from '@/src/explorer/examples/combobox/search';
import { CargoManifest } from '@/src/explorer/examples/error-summary/manifest';
import { MissionBriefing } from '@/src/explorer/examples/error-summary/own-form';
import { LandingSite } from '@/src/explorer/examples/fieldset/address';
import { CargoSection } from '@/src/explorer/examples/fieldset/optional-section';
import { BountyDossier } from '@/src/explorer/examples/file-upload/dossier';
import { HunterPortrait } from '@/src/explorer/examples/file-upload/portrait';
import { HunterSignUp } from '@/src/explorer/examples/form/validation';
import { CrewInvite } from '@/src/explorer/examples/form/without-summary';
import { AlertSettings } from '@/src/explorer/examples/form-actions/settings';
import { BountySteps } from '@/src/explorer/examples/form-actions/steps';
import { DepartureDay } from '@/src/explorer/examples/form-field/form-error';
import { HullPaint } from '@/src/explorer/examples/form-field/native-control';
import { CargoLoad } from '@/src/explorer/examples/number-field/cargo';
import { BountyReward } from '@/src/explorer/examples/number-field/reward';
import { HunterRegistration } from '@/src/explorer/examples/password-field/new-password';
import { BebopSignIn } from '@/src/explorer/examples/password-field/sign-in';
import { RewardPayment } from '@/src/explorer/examples/radio-group/required';
import { FlightRoute } from '@/src/explorer/examples/radio-group/routes';
import { BountySearch } from '@/src/explorer/examples/search-field/filter';
import { ArchiveSearch } from '@/src/explorer/examples/search-field/landmark';
import { MoonLanding } from '@/src/explorer/examples/select/dependent';
import { HomePort } from '@/src/explorer/examples/select/groups';
import { DeflectorSettings } from '@/src/explorer/examples/slider/formatted';
import { RewardRange } from '@/src/explorer/examples/slider/input';
import { BountyReport } from '@/src/explorer/examples/submit-button/pending';
import { HangarSignIn } from '@/src/explorer/examples/submit-button/sign-in';
import { Autopilot } from '@/src/explorer/examples/switch/dependent';
import { BebopSettings } from '@/src/explorer/examples/switch/settings';
import { Transmission } from '@/src/explorer/examples/text-area/counter';
import { ShipLog } from '@/src/explorer/examples/text-area/editing';
import { CrewLinks } from '@/src/explorer/examples/text-field/adornments';
import { PilotContact } from '@/src/explorer/examples/text-field/validation';
import { FormsPlayground } from '@/src/explorer/playgrounds/forms';
import { formsSamples } from '@/src/explorer/samples/forms';

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
		Form: { component: Form, examples: { validation: HunterSignUp, withoutSummary: CrewInvite } },
		FormField: {
			component: FormField,
			examples: { nativeControl: HullPaint, formError: DepartureDay },
		},
		Fieldset: {
			component: Fieldset,
			examples: { address: LandingSite, optionalSection: CargoSection },
		},
		FormActions: {
			component: FormActions,
			examples: { steps: BountySteps, settings: AlertSettings },
		},
		SubmitButton: {
			component: SubmitButton,
			examples: { pending: BountyReport, signIn: HangarSignIn },
		},
		ErrorSummary: {
			component: ErrorSummary,
			examples: { ownForm: MissionBriefing, manifest: CargoManifest },
		},
		FileUpload: {
			component: FileUpload,
			examples: { dossier: BountyDossier, portrait: HunterPortrait },
		},
	},
};
