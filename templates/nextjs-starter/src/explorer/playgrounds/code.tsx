'use client';
// The playground of the components of `@midnight-indigo/ui/code`.
import { Code, CodeBlock } from '@midnight-indigo/ui/code';

import { createPlayground } from '@/src/explorer/playground';
import type { PlaygroundComponent } from '@/src/explorer/playground';

export const CodePlayground: PlaygroundComponent = createPlayground({ Code, CodeBlock });
