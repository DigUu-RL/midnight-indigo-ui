'use client';
// The playground of the components of `@midnight-indigo/ui/forms`.
import {
	NumberField,
	PasswordField,
	SearchField,
	TextArea,
	TextField,
} from '@midnight-indigo/ui/forms';

import { createPlayground } from '#src/explorer/playground.tsx';
import type { PlaygroundComponent } from '#src/explorer/playground.tsx';

export const FormsPlayground: PlaygroundComponent = createPlayground({
	TextField,
	TextArea,
	PasswordField,
	SearchField,
	NumberField,
});
