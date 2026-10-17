# Rich messages

[Português](../pt-br/rich-messages.md)

Bold, emphasis or a link on part of a sentence, written in the translation itself (F21), exported by
`@midnight-indigo/ui/i18n`. Splitting the sentence into several keys breaks the translation, because the order of the
words changes between languages; with tags, each language keeps the whole sentence:

```json
{
	"welcome": "Welcome, <strong>{{name}}</strong>. Read the <docs>guide</docs> to start.",
	"export": "Happy with it? <link>Export the theme</link>"
}
```

```json
{
	"welcome": "Boas-vindas, <strong>{{name}}</strong>. Leia o <docs>guia</docs> para começar.",
	"export": "Gostou? <link>Exporte o tema</link>"
}
```

The text is parsed and rendered as React elements, never given to the browser as HTML: there is no
`dangerouslySetInnerHTML`, and markdown or arbitrary HTML is not supported. Messages stay in the same JSON files, loaded
as before.

| Export                                     | Use it for                                                            |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `rich` and `plain` of `useI18n()`          | A message with tags, and its text without them, in a Client Component |
| `RichMessage`                              | The same as an element: `<RichMessage messageKey values tags />`      |
| `createRichTranslator(t, options?)`        | `rich` and `plain` over any `t` (Server Components, route handlers)   |
| `renderRichText(message, options?)`        | The tags of a text that is already translated                         |
| `toPlainText(message, options?)`           | The text of a message without its tags                                |
| `defaultRichTags`                          | The names of the tags every message can use                           |
| `RichTags`, `RichValues`, `RichTranslator` | Their types                                                           |

## Default tags

Every message can use, without configuration: `strong`, `b`, `em`, `i`, `u`, `s`, `code`, `kbd`, `mark`, `small`,
`sub`, `sup` and `br` (`<br>` or `<br/>`). They render their native element, which the baseline of `UiProvider` styles
with the theme tokens (`code` and `kbd` in the monospaced font, `kbd` as a key, `mark` in the warning container; see
[native-styles.md](./native-styles.md)).

## Tags of the application

Any other tag is a function of the application, `(children) => ReactNode`, given by name. A custom tag can wrap other
tags, and a tag of the same name as a default one replaces it. `<tag/>` calls the function with `null`.

```tsx
'use client';
import { RichMessage, useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue, RichTags } from '@midnight-indigo/ui/i18n';
import { Link } from '@midnight-indigo/ui/navigation';
import type { ReactElement, ReactNode } from 'react';

const tags: RichTags = {
	docs: (children: ReactNode): ReactNode => <Link href='/docs'>{children}</Link>,
};

export const Welcome = ({ name }: { name: string }): ReactElement => {
	const { rich, plain }: I18nValue = useI18n();

	return (
		<section aria-label={plain('welcome', { name })}>
			<p>{rich('welcome', { name }, tags)}</p>
			<RichMessage messageKey='welcome' values={{ name }} tags={tags} />
		</section>
	);
};
```

Attributes written in the translation are ignored: `<docs href="https://elsewhere.example">` renders the same link as
`<docs>`. Where the link goes is decided by the code, never by the translation.

## Values, plurals and contexts

`rich(key, values, tags)` takes the same values and options as `t`: interpolation, `count` (plurals), `context`,
formats (`{{count, number}}`) and `replace` work as usual. **An interpolated value is always text**: with
`"Hello <strong>{{name}}</strong>"` and `name = "<em>Spike</em>"`, the name is shown literally, inside the bold, and
never read as a tag. So a name typed by a user can be interpolated safely.

```json
{
	"orders": {
		"one": "<strong>{{count, number}}</strong> order of {{customer}}",
		"other": "<strong>{{count, number}}</strong> orders of {{customer}}"
	}
}
```

```tsx
rich('orders', { count: 1200, customer: 'Spike Spiegel' }); // <strong>1,200</strong> orders of Spike Spiegel
```

## Plain text

`plain(key, values)` returns the message without its tags, for what only takes a string: `aria-label`, `title`, the
`message` of a toast, an announcement or the page metadata. `<br>` becomes a space, and the values are kept as they
are. `toPlainText(message)` does the same for a text that is already translated.

## Server Components

`rich` and `plain` are pure functions and need no provider: create them over the `t` of `createI18n`.

```tsx
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import { createI18n, createRichTranslator } from '@midnight-indigo/ui/i18n';
import type { RichTranslator } from '@midnight-indigo/ui/i18n';
import type { i18n } from 'i18next';
import type { ReactElement } from 'react';

const CustomersPage = async (): Promise<ReactElement> => {
	const instance: i18n = await createI18n({ locale: 'pt-BR', fallbackLocale: 'en-US', resources });
	const { rich, plain }: RichTranslator = createRichTranslator(instance.t);

	return (
		<PageHeader title={plain('customers.title')} description={rich('customers.description')} />
	);
};
```

A tag function of a Server Component may return a Client Component (a `Link`), but is itself never sent to the
browser.

## Malformed messages

A malformed message never throws and never breaks the render: what cannot be read is shown as text.

| Message                           | Rendered                                         | Problem                |
| --------------------------------- | ------------------------------------------------ | ---------------------- |
| `Click <script>here</script>`     | `Click <script>here</script>`, as text           | `unknownTag`           |
| `An <strong>unclosed tag`         | `An <strong>unclosed tag`, as text               | `unclosedTag`          |
| `A closing</em> tag`              | `A closing</em> tag`, as text                    | `unexpectedClosingTag` |
| `<strong>a <em>b</strong> c</em>` | The `<em>` that closes is kept, the rest is text | both                   |

A `<` that does not start a tag (`1 < 2`) is text too. Each problem is reported once per message to
`onMalformedMessage(message, problem, tag)`: by default a `console.warn` outside production
(`process.env.NODE_ENV !== 'production'`), silent in production. Give another handler to the `I18nProvider`
(`onMalformedMessage`) or to `createRichTranslator(t, { onMalformedMessage })`, e.g. to fail a test.

## Same tags in every locale

A translation must use the tags of the source message, in any order. The starter checks it in
`test/messages.test.ts`: every message is well formed, uses only the tags it renders, and each locale has the tags of
English in each key. Copy that test into an application to keep its translations in step.
