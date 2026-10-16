# Mensagens ricas

[English](./rich-messages.md)

Negrito, ênfase ou um link em parte de uma frase, escritos na própria tradução (F21), exportados por
`@midnight-indigo/ui/i18n`. Quebrar a frase em várias chaves prejudica a tradução, porque a ordem das palavras muda
entre idiomas; com tags, cada idioma mantém a frase inteira:

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

O texto é interpretado e renderizado como elementos React, nunca entregue ao navegador como HTML: não há
`dangerouslySetInnerHTML`, e markdown ou HTML arbitrário não são suportados. As mensagens continuam nos mesmos arquivos
JSON, carregadas como antes.

| Export                                     | Use para                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `rich` e `plain` de `useI18n()`            | Uma mensagem com tags, e seu texto sem elas, em um Client Component     |
| `RichMessage`                              | O mesmo como elemento: `<RichMessage messageKey values tags />`         |
| `createRichTranslator(t, options?)`        | `rich` e `plain` sobre qualquer `t` (Server Components, route handlers) |
| `renderRichText(message, options?)`        | As tags de um texto que já está traduzido                               |
| `toPlainText(message, options?)`           | O texto de uma mensagem sem suas tags                                   |
| `defaultRichTags`                          | Os nomes das tags que toda mensagem pode usar                           |
| `RichTags`, `RichValues`, `RichTranslator` | Seus tipos                                                              |

## Tags padrão

Toda mensagem pode usar, sem configuração: `strong`, `b`, `em`, `i`, `u`, `s`, `code`, `kbd`, `mark`, `small`, `sub`,
`sup` e `br` (`<br>` ou `<br/>`). Elas renderizam o elemento nativo, que o baseline do `UiProvider` estiliza com os
tokens do tema (`code` e `kbd` na fonte monoespaçada, `kbd` como uma tecla, `mark` no container de alerta; veja
[native-styles.pt-BR.md](./native-styles.pt-BR.md)).

## Tags da aplicação

Qualquer outra tag é uma função da aplicação, `(children) => ReactNode`, passada pelo nome. Uma tag customizada pode
envolver outras tags, e uma tag com o nome de uma padrão a substitui. `<tag/>` chama a função com `null`.

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

Atributos escritos na tradução são ignorados: `<docs href="https://elsewhere.example">` renderiza o mesmo link que
`<docs>`. O destino do link é decidido pelo código, nunca pela tradução.

## Valores, plurais e contextos

`rich(key, values, tags)` recebe os mesmos valores e opções que `t`: interpolação, `count` (plurais), `context`,
formatos (`{{count, number}}`) e `replace` funcionam como sempre. **Um valor interpolado é sempre texto**: com
`"Hello <strong>{{name}}</strong>"` e `name = "<em>Spike</em>"`, o nome aparece literalmente, dentro do negrito, e
nunca é lido como tag. Assim, um nome digitado por um usuário pode ser interpolado com segurança.

```json
{
	"orders": {
		"one": "<strong>{{count, number}}</strong> pedido de {{customer}}",
		"many": "<strong>{{count, number}}</strong> de pedidos de {{customer}}",
		"other": "<strong>{{count, number}}</strong> pedidos de {{customer}}"
	}
}
```

```tsx
rich('orders', { count: 1200, customer: 'Spike Spiegel' }); // <strong>1.200</strong> pedidos de Spike Spiegel
```

## Texto puro

`plain(key, values)` devolve a mensagem sem as tags, para o que só aceita uma string: `aria-label`, `title`, a
`message` de um toast, um anúncio ou os metadados da página. `<br>` vira um espaço, e os valores são mantidos como
estão. `toPlainText(message)` faz o mesmo com um texto que já está traduzido.

## Server Components

`rich` e `plain` são funções puras e não precisam de provider: crie-as sobre o `t` de `createI18n`.

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

A função de uma tag em um Server Component pode devolver um Client Component (um `Link`), mas ela mesma nunca é
enviada ao navegador.

## Mensagens malformadas

Uma mensagem malformada nunca lança erro nem quebra a renderização: o que não pode ser interpretado aparece como texto.

| Mensagem                          | Renderizado                                   | Problema               |
| --------------------------------- | --------------------------------------------- | ---------------------- |
| `Click <script>here</script>`     | `Click <script>here</script>`, como texto     | `unknownTag`           |
| `An <strong>unclosed tag`         | `An <strong>unclosed tag`, como texto         | `unclosedTag`          |
| `A closing</em> tag`              | `A closing</em> tag`, como texto              | `unexpectedClosingTag` |
| `<strong>a <em>b</strong> c</em>` | O `<em>` que fecha é mantido, o resto é texto | ambos                  |

Um `<` que não inicia uma tag (`1 < 2`) também é texto. Cada problema é informado uma vez por mensagem a
`onMalformedMessage(message, problem, tag)`: por padrão um `console.warn` fora de produção
(`process.env.NODE_ENV !== 'production'`), silencioso em produção. Passe outro handler ao `I18nProvider`
(`onMalformedMessage`) ou a `createRichTranslator(t, { onMalformedMessage })`, por exemplo para falhar um teste.

## Mesmas tags em todos os locales

Uma tradução deve usar as tags da mensagem de origem, em qualquer ordem. O starter verifica isso em
`test/messages.test.ts`: toda mensagem é bem formada, usa só as tags que ele renderiza, e cada locale tem as tags do
inglês em cada chave. Copie esse teste para uma aplicação para manter suas traduções alinhadas.
