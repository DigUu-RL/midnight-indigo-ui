// Renders the compiled form fields on the server, as a consumer's Server Component or SSR framework would.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	Checkbox,
	Combobox,
	FileUpload,
	Form,
	RadioGroup,
	Select,
	SubmitButton,
	Switch,
	TextField,
} from '@midnight-indigo/ui/forms';
import { DatePicker, DatePickersProvider } from '@midnight-indigo/ui/forms/date-pickers';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

test('the compiled fields render on the server with labels, descriptions and states', (): void => {
	const page: ReactElement = createElement(
		Form,
		null,
		createElement(TextField, {
			label: 'Email',
			name: 'email',
			description: 'Work address.',
			error: 'Enter an email.',
			required: true,
		}),
		createElement(Select, {
			label: 'Role',
			placeholder: 'Choose',
			options: [{ value: 'admin', label: 'Admin' }],
		}),
		createElement(Combobox, { label: 'City', options: [{ value: 'rec', label: 'Recife' }] }),
		createElement(RadioGroup, {
			legend: 'Plan',
			options: [
				{ value: 'free', label: 'Free' },
				{ value: 'team', label: 'Team' },
			],
		}),
		createElement(Checkbox, { label: 'Accept', description: 'Required to continue.' }),
		createElement(Switch, { label: 'Email notifications' }),
		createElement(FileUpload, { label: 'Attachment', accept: '.pdf' }),
		createElement(SubmitButton, null, 'Save'),
	);

	const html: string = renderToString(page);

	assert.match(html, /<form[^>]*novalidate=""/i);
	assert.match(html, /<label[^>]*for="([^"]+)"[^>]*>Email.*<input[^>]*id="\1"/);
	assert.match(html, /aria-invalid="true"/);
	assert.match(html, /role="combobox"/);
	assert.match(html, /role="radiogroup"/);
	assert.match(html, /role="switch"/);
	assert.match(html, /type="file"/);
	assert.match(html, /<button type="submit"/);
	assert.match(html, /var\(--mi-border-strong\)/);
});

test('the compiled date picker renders on the server inside its provider', (): void => {
	const html: string = renderToString(
		createElement(DatePickersProvider, null, createElement(DatePicker, { label: 'Due date' })),
	);

	assert.match(html, /Due date/);
	assert.match(html, /role="spinbutton"/);
});
