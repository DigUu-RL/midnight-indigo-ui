'use client';
// The playground of the components of `@midnight-indigo/ui/layout`.
import { Container, Grid, Stack } from '@midnight-indigo/ui/layout';

import { createPlayground } from '@/src/explorer/playground';
import type { PlaygroundComponent } from '@/src/explorer/playground';

export const LayoutPlayground: PlaygroundComponent = createPlayground({ Container, Grid, Stack });
