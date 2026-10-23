// The components of `@midnight-indigo/ui/code` in the explorer: see `explorer/bindings.ts`.
import { Code, CodeBlock } from '@midnight-indigo/ui/code';

import type { SubpathBindings } from '@/src/explorer/bindings';
import { CrewModule } from '@/src/explorer/examples/code-block/files';
import { HyperdriveCheck } from '@/src/explorer/examples/code-block/highlighted';
import { JumpInstructions } from '@/src/explorer/examples/code/sentence';
import { ShipSettings } from '@/src/explorer/examples/code/settings';
import { CodePlayground } from '@/src/explorer/playgrounds/code';
import { codeSamples } from '@/src/explorer/samples/code';

export const codeBindings: SubpathBindings<'code'> = {
	playground: CodePlayground,
	samples: codeSamples,
	components: {
		Code: { component: Code, examples: { sentence: JumpInstructions, settings: ShipSettings } },
		CodeBlock: {
			component: CodeBlock,
			examples: { highlighted: HyperdriveCheck, files: CrewModule },
		},
	},
};
