// The components of `@midnight-indigo/ui/buttons` in the explorer: see `explorer/bindings.ts`.
import { Button, CopyButton, IconButton } from '@midnight-indigo/ui/buttons';

import type { SubpathBindings } from '@/src/explorer/bindings';
import { MissionActions } from '@/src/explorer/examples/button/actions';
import { SaveLogbook } from '@/src/explorer/examples/button/loading';
import { HyperspaceRoute } from '@/src/explorer/examples/copy-button/inline';
import { CrewInvite } from '@/src/explorer/examples/copy-button/invite';
import { CrewMemberActions } from '@/src/explorer/examples/icon-button/actions';
import { PlaybackControls } from '@/src/explorer/examples/icon-button/playback';
import { ButtonsPlayground } from '@/src/explorer/playgrounds/buttons';
import { buttonsSamples } from '@/src/explorer/samples/buttons';

export const buttonsBindings: SubpathBindings<'buttons'> = {
	playground: ButtonsPlayground,
	samples: buttonsSamples,
	components: {
		Button: { component: Button, examples: { actions: MissionActions, loading: SaveLogbook } },
		IconButton: {
			component: IconButton,
			examples: { actions: CrewMemberActions, playback: PlaybackControls },
		},
		CopyButton: {
			component: CopyButton,
			examples: { inline: HyperspaceRoute, invite: CrewInvite },
		},
	},
};
