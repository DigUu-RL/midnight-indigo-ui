// The components of `@midnight-indigo/ui/code` in the explorer: see `explorer/bindings.ts`.
import { Code, CodeBlock } from '@midnight-indigo/ui/code';

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { CrewModule } from '#src/explorer/examples/code-block/files.tsx';
import { HyperdriveCheck } from '#src/explorer/examples/code-block/highlighted.tsx';
import { JumpInstructions } from '#src/explorer/examples/code/sentence.tsx';
import { ShipSettings } from '#src/explorer/examples/code/settings.tsx';
import { CodePlayground } from '#src/explorer/playgrounds/code.tsx';
import { codeSamples } from '#src/explorer/samples/code.tsx';

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
