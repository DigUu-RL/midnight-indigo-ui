# Forms

Form controls and the field infrastructure (F06). Every field is built on the native element (`input`, `select`,
`textarea`, `fieldset`), so the browser's keyboard behavior, autofill, IME, mobile pickers and HTML form submission
come with it. Styles use only the theme variables (`var(--mi-*)`); the contrast pairs are in
[tokens.md](./tokens.md#contrast-pairs).

## Imports

| Subpath                                     | Contents                                                                                                                                                                                                                                                  | Extra peers                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `@midnight-indigo/ui/forms`                 | `FormField`, `Fieldset`, `FormActions`, `TextField`, `TextArea`, `NumberField`, `PasswordField`, `SearchField`, `Select`, `Combobox`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Switch`, `Slider`, `FileUpload`, `Form`, `ErrorSummary`, `SubmitButton` | none                          |
| `@midnight-indigo/ui/forms/date-pickers`    | `DatePickersProvider`, `DatePicker`, `DateRangePicker`, `TimePicker`, `DateTimePicker`                                                                                                                                                                    | `date-fns` ^4 (MIT)           |
| `@midnight-indigo/ui/forms/react-hook-form` | `useFieldController`, `useCheckedController`, `toErrorSummaryItems`                                                                                                                                                                                       | `react-hook-form` ^7.55 (MIT) |

The two integrations are separate subpaths with **optional** peer dependencies: `@midnight-indigo/ui/forms` never
loads date-fns nor React Hook Form (the consumer fixture follows its import graph to prove it). Install them
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
| `size`            | 32 / 42 / 48 px: the button heights, except the medium field, 2 px taller (`controlHeight.field`).         |

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

**Combobox with many options.** The list renders at most `maxVisibleOptions` matches (default 100): opening a list of
thousands of `<li>` freezes the page (10 000 options took about 800 ms to open in Chromium). When more options
match, the list ends with `labels.moreOptions(shown, total)` — "Showing 100 of 10000 options. Type to narrow the list."
— also announced in the status, and typing narrows the matches. With the cap, opening and typing stay under 200 ms
with 100 000 options (fixtures/browser, `pnpm test:browser`). For options that live on a server, use `filter='none'`
and pass the matches of `inputValue`.

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
  **without moving focus and without live regions** — errors are never announced at each keystroke. When a pointer
  press moves focus, the messages change only after the release: changing them between the press and the release
  would move the layout under the pointer, and the click would miss its target (a checkbox would not toggle).
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

`DatePicker`, `DateRangePicker`, `TimePicker` and `DateTimePicker` are fields of the library (the same frame, label,
`description`, `error` with its icon, `required`, `disabled`, `readOnly`, `name` and `size` as the other fields), with
a panel of their own. Only `date-fns` (MIT) is needed, for the locales, the parsing and the formatting.

- **Typed or chosen.** A click in the field opens the panel and focus stays in the field, so the value can still be
  typed: the parts come in the order of the locale (`dd/mm/yyyy` in pt-BR) and the separators by themselves. A text is
  a value once it is complete and can be chosen; until then `onValueChange` gets `null` and the input is invalid, so a
  `Form` reports it. Down, or the button of the field, moves focus into the panel.
- **The panel.** Predefined dates or periods on the side (`presets`, or `false` for none), the calendars under a
  header with the previous and next arrows and the lists of the month and of the year (the years grow as the list is
  scrolled, and only those in view are rendered), and a footer: **Clear**, **Cancel** (outline, `brand`) and
  **Apply** (solid, `official`). The choice reaches the field only with Apply; Cancel, Escape or a click outside
  drop it.
- **Ranges.** `DateRangePicker` shows two months side by side (`calendars`), two fields (`startName`, `endName`) in one
  frame, previews the range under the pointer, and takes `maxDays`. Its presets: today, tomorrow, the next 7, 15, 30,
  60 and 90 days, this month, and the next month, quarter and year.
- **Constraints.** `minDate`, `maxDate`, `disablePast`, `disableFuture` and `shouldDisableDate(day)`; `minTime`,
  `maxTime`, `ampm` and `minuteStep` for the times.
- **Keyboard.** The days follow the date picker dialog of the WAI-ARIA Authoring Practices: arrows by day and week,
  Home and End, Page Up and Page Down by month (with Shift, by year), Enter or Space to choose.

The locale is given, never inferred, by `DatePickersProvider`; the texts (presets, buttons, placeholders) are the
component labels `datePicker`, translated by `I18nProvider` like the others or by the `labels` prop:

```tsx
import { DatePickersProvider, DateRangePicker } from '@midnight-indigo/ui/forms/date-pickers';
import { ptBR } from 'date-fns/locale/pt-BR';

<DatePickersProvider locale={ptBR}>
	<DateRangePicker label='Período' startName='start' endName='end' />
</DatePickersProvider>;
```

## Translation

Every default text is replaceable through a `labels` prop, with its defaults exported for reference
(`defaultFormLabels`, `defaultErrorSummaryLabels`, `defaultFormFieldLabels` via `fieldLabels`,
`defaultPasswordFieldLabels`, `defaultSearchFieldLabels`, `defaultNumberFieldLabels`, `defaultTextAreaLabels`,
`defaultComboboxLabels`, `defaultFileUploadLabels`, `defaultDatePickerLabels`). Texts with numbers are functions, so plurals and word order stay
in the translation (`title: (count) => ...`). Inside an `I18nProvider`, every field takes its texts from JSON
resources in pt-BR, en-US or a locale of the application, native validation messages included; the `labels` prop
still wins. See [i18n.md](./i18n.md).

## Tests

Testing Library and user-event for pointer and keyboard (Tab, Space, Enter, Escape, arrows), axe-core on the
rendered markup, CSS rule snapshots of the field states, React Hook Form adapter tests in their own file, and the
consumer fixture rendering the compiled fields on the server and checking that `forms` does not load the optional
peers. The browser suite (`fixtures/browser`) submits the profile form of the starter end to end, and its performance
project times the combobox with up to 100 000 options.
