'use client';
// The playground of the components of `@midnight-indigo/ui/forms`.
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

import { createPlayground } from '@/src/explorer/playground';
import type { PlaygroundComponent } from '@/src/explorer/playground';

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
	Form,
	FormField,
	Fieldset,
	FormActions,
	SubmitButton,
	ErrorSummary,
	FileUpload,
});
