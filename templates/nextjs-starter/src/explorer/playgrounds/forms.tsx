'use client';
// The playground of the components of `@midnight-indigo/ui/forms`.
import {
	Checkbox,
	CheckboxGroup,
	Combobox,
	NumberField,
	PasswordField,
	RadioGroup,
	SearchField,
	Select,
	Slider,
	Switch,
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
	Checkbox,
	CheckboxGroup,
	RadioGroup,
	Switch,
	Select,
	Combobox,
	Slider,
});
