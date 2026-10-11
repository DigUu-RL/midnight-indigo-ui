# Forms

Form controls and the field infrastructure (F06). Every field is built on the native element (`input`, `select`,
`textarea`, `fieldset`), so the browser's keyboard behavior, autofill, IME, mobile pickers and HTML form submission
come with it. Styles use only the theme variables (`var(--mi-*)`); the contrast pairs are in
[tokens.md](./tokens.md#contrast-pairs).

## Imports

| Subpath                                     | Contents                                                                                                                                                                                                                                                  | Extra peers                                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `@midnight-indigo/ui/forms`                 | `FormField`, `Fieldset`, `FormActions`, `TextField`, `TextArea`, `NumberField`, `PasswordField`, `SearchField`, `Select`, `Combobox`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `Slider`, `FileUpload`, `Form`, `ErrorSummary`, `SubmitButton` | none                                             |
| `@midnight-indigo/ui/forms/date-pickers`    | `DatePickersProvider`, `DatePicker`, `TimePicker`, `DateTimePicker`                                                                                                                                                                                       | `@mui/x-date-pickers` ^9.14, `date-fns` ^4 (MIT) |
| `@midnight-indigo/ui/forms/react-hook-form` | `useFieldController`, `useCheckedController`, `toErrorSummaryItems`                                                                                                                                                                                       | `react-hook-form` ^7.55 (MIT)                    |

The two integrations are separate subpaths with **optional** peer dependencies: `@midnight-indigo/ui/forms` never
loads MUI X, date-fns nor React Hook Form (the consumer fixture follows its import graph to prove it). Install them
only if you use those subpaths. The root entry does not re-export forms.

## One field API

Every field takes the same props directly — there is no wrapper to compose:

```tsx
<TextField
	label='Email address'
	description='We will only use it to contact you.'
	error={errors.email}
	name='email'
	type='email'
	autoComplete='email'
	required
/>
```

| Prop              | Meaning                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `label`           | Visible, persistent label, associated with `for`/`id`. A placeholder never replaces it.                    |
| `hideLabel`       | Keeps the label for assistive technologies only (e.g. a search bar whose context shows it).                |
| `description`     | Help text, read after the label (`aria-describedby`).                                                      |
| `error`           | Message; sets `aria-invalid`, adds it to `aria-describedby` and shows it with an icon (never color alone). |
| `required`        | Native `required` (announced) plus an asterisk hidden from assistive technologies.                         |
| `disabled`        | Native: skipped by Tab, not submitted, `state.disabled*` look.                                             |
| `readOnly`        | Focusable and submitted, not editable; dashed boundary instead of the filled look.                         |
| `loading`         | `aria-busy`, a ring in the field and a hidden `'Loading'` text in the description.                         |
| `prefix`/`suffix` | Units, currency, decorative icons; their text is read in the description, so the name stays the label.     |
| `size`            | 32 / 40 / 48 px, the button heights, so fields and buttons align.                                          |

Other attributes and `ref` reach the native element (so `autoComplete`, `inputMode`, `pattern`, `onBlur` and
libraries that need the element work); `className` and `style` go to the root of the field. Every field works
controlled (`value` + `onValueChange`/`onChange`) or uncontrolled (`defaultValue`), and is submitted with its `name`.
`FormField` is public for **custom controls**: it lays out the label, description and error and gives the control
its attributes through a render function.

```tsx
<FormField label='Color' description='Used in charts.' error={error}>
	{(control) => <input {...control} type='color' />}
</FormField>
```

## Controls

| Control                   | Element                               | Keyboard                                                        | Notes                                                                                       |
| ------------------------- | ------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| TextField                 | `input` (`text`/`email`/`tel`/`url`)  | native                                                          | prefix/suffix                                                                               |
| TextArea                  | `textarea`                            | native                                                          | `resize`, `showCount` (counter in the description, not a live region)                       |
| NumberField               | `input type=number`                   | Arrow Up/Down step                                              | `onValueChange(number \| null)`; `steppers` are pointer-only (`tabIndex=-1`)                |
| PasswordField             | `input type=password`                 | native                                                          | toggle with fixed name and `aria-pressed`; value, caret and autofill kept                   |
| SearchField               | `input type=search`                   | Escape clears                                                   | clear button returns focus; put it in your `<form role="search">`                           |
| Select                    | `select`                              | native (type-ahead, arrows)                                     | `placeholder` = explicit empty option; `required` rejects it                                |
| Combobox                  | `input role=combobox` + `listbox`     | Down/Up open and move, Enter chooses, Escape closes then clears | filters as you type; `loading`/empty announced once in a status; submitted via hidden input |
| Checkbox, Switch          | `input type=checkbox` (`role=switch`) | Space                                                           | optional `label` (bold) and `description`; `indeterminate`                                  |
| CheckboxGroup, RadioGroup | `fieldset` + `legend`                 | Tab per checkbox; one tab stop and arrows for radios            | group error on the legend's group; `orientation`                                            |
| Slider                    | `input type=range`                    | arrows, Page Up/Down, Home/End                                  | `aria-valuetext` from `formatValue`; `input` slot for a precise NumberField (WCAG 2.5.7)    |
| FileUpload                | `input type=file`                     | Tab, Enter/Space opens the dialog                               | drop zone is an addition, never the only way; limits stated before and enforced after       |

**Checkbox and Switch** take an optional `label` — in bold, what the control turns on — and an optional
`description` — what happens when it is on — read after the name:

```tsx
<Switch
	label='Enable email notifications'
	description='Sends a notification by email for each new report.'
/>
```

Without `label`, name the control with `aria-label` or `aria-labelledby` (e.g. a row checkbox in a table); a control
with no name at all throws. Options inside `CheckboxGroup` and `RadioGroup` keep regular text, under the legend.

## Validation, submission and focus

The core has no schema engine: the application decides what is valid. Two ways to build a form:

**Without any library — `Form`.** A native `<form noValidate>`:

- On submit, native constraints (`required`, `type`, `min`, `pattern`...) become messages of the interface
  (`labels.constraint`, translatable — the browser's own messages would follow the browser language, not the app's),
  and `validate(data)` adds yours; it may be **async**. Stale async results are dropped.
- With errors: nothing is sent, each field shows its message (fields read the error of their `name` from the form),
  and the **error summary takes focus once** and is read with its count. Its links move focus to each field.
  `errorSummary={false}` focuses the first invalid field instead.
- After a failed submission, leaving a field (`revalidateOn='blur'`) checks again and updates the messages in place,
  **without moving focus and without live regions** — errors are never announced at each keystroke.
- `onSubmit(data, form)` may return a promise: the form is `aria-busy` and `SubmitButton` shows `loading` (it keeps
  focus and ignores clicks, so nothing is sent twice). Success announces `successMessage` (`role="status"`); a
  rejection announces `labels.submissionError` (`role="alert"`). Server errors come back through `errors`.
- `useFormSubmission()` exposes `status` (`idle`, `validating`, `invalid`, `submitting`, `success`, `error`),
  `errors` and `pending` to any component inside.

```tsx
<Form
	validate={async (data) => ({
		email: (await isTaken(data.get('email'))) ? 'This email is taken.' : undefined,
	})}
	onSubmit={saveProfile}
	successMessage='Profile saved.'
>
	<TextField label='Email' name='email' type='email' required />
	<FormActions>
		<SubmitButton>Save</SubmitButton>
	</FormActions>
</Form>
```

**With React Hook Form — the adapter.** Spread the controller on any field; `ref` reaches the native control, so
`setFocus` and `shouldFocusError` work. Use `ErrorSummary` with `toErrorSummaryItems(formState.errors)` and
`focusKey={formState.submitCount}` (and `shouldFocusError: false`), or let React Hook Form focus the first field.

```tsx
import { toErrorSummaryItems, useCheckedController, useFieldController } from '@midnight-indigo/ui/forms/react-hook-form';

<TextField label='Email' {...useFieldController({ control, name: 'email', rules: { required: 'Enter your email.' } })} />
<Switch label='Weekly digest' {...useCheckedController({ control, name: 'digest' })} />
```

## Date and time

`DatePicker`, `TimePicker` and `DateTimePicker` wrap the **MIT-licensed community pickers of MUI X** (no paid MUI X
Pro/Premium feature is used) with the field API of the library: `label`, `description`, `error` (with its icon),
`required`, `disabled`, `readOnly`, `name`, `value`/`defaultValue`/`onValueChange(Date | null)` — `null` while a
date is typed only in part. Other MUI X options (`minDate`, `maxDate`, `views`, `ampm`, `format`...) pass through.
Fields are typed in sections (arrows change the focused section) or chosen in a calendar/time dialog.

Localization is given, never inferred, by `DatePickersProvider`:

```tsx
import { DatePickersProvider } from '@midnight-indigo/ui/forms/date-pickers';
import { ptBR as pickersPtBR } from '@mui/x-date-pickers/locales';
import { ptBR } from 'date-fns/locale/pt-BR';

<DatePickersProvider
	locale={ptBR} // order of sections, month and day names, first weekday, 12/24 h
	localeText={pickersPtBR.components.MuiLocalizationProvider.defaultProps.localeText} // texts of the controls
>
	{children}
</DatePickersProvider>;
```

| Dependency            | License | Why                                                                         |
| --------------------- | ------- | --------------------------------------------------------------------------- |
| `@mui/x-date-pickers` | MIT     | Accessible sectioned fields, calendar and time lists on the same MUI base.  |
| `date-fns`            | MIT     | Adapter: parsing, formatting and locales imported one by one (tree-shaken). |

Pickers are styled by the MUI theme that `UiProvider` derives from the tokens.

**Known typing issue of MUI X (NodeNext without `skipLibCheck`).** The declarations of `@mui/x-date-pickers` import
`react-transition-group/CSSTransition` without an extension, which ESM resolution cannot find, so `tsc` reports TS7016
inside `node_modules`. `Bundler` resolution and `skipLibCheck: true` (the default of most templates) are not
affected. Otherwise, add `@types/react-transition-group` and this declaration (as the consumer fixture does):

```ts
declare module 'react-transition-group/CSSTransition' {
	export * from 'react-transition-group/CSSTransition.js';
	export { default } from 'react-transition-group/CSSTransition.js';
}
```

## Translation

Every default text is replaceable through a `labels` prop, with its defaults exported for reference
(`defaultFormLabels`, `defaultErrorSummaryLabels`, `defaultFormFieldLabels` via `fieldLabels`,
`defaultPasswordFieldLabels`, `defaultSearchFieldLabels`, `defaultNumberFieldLabels`, `defaultTextAreaLabels`,
`defaultComboboxLabels`, `defaultFileUploadLabels`). Texts with numbers are functions, so plurals and word order stay
in the translation (`title: (count) => ...`). The i18n provider (F11) will feed these props from JSON resources.

## Tests

Testing Library and user-event for pointer and keyboard (Tab, Space, Enter, Escape, arrows), axe-core on the
rendered markup, CSS rule snapshots of the field states, React Hook Form adapter tests in their own file, and the
consumer fixture rendering the compiled fields on the server and checking that `forms` does not load the optional
peers.
