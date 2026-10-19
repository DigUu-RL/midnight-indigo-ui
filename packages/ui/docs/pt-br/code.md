# Código

[English](../en-us/code.md)

`@midnight-indigo/ui/code` mostra código-fonte: `CodeBlock` para trechos e arquivos, `Code` para um nome ou um comando
dentro de uma frase, e `highlightCode`, que colore o código com o [Shiki](https://shiki.style) no servidor. O navegador
recebe os tokens coloridos como dados simples: nenhum realçador, gramática ou tema chega ao bundle do cliente.

```tsx
// app/install/page.tsx: um Server Component
import { CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import type { ReactElement } from 'react';

const InstallPage = async (): Promise<ReactElement> => {
	const snippet: HighlightedCode = await highlightCode(
		"import { Chip } from '@midnight-indigo/ui/data-display';\n\n<Chip label='Samus Aran' />",
		'tsx',
	);

	return <CodeBlock code={snippet} fileName='hangar.tsx' showLineNumbers highlightedLines={[3]} />;
};

export default InstallPage;
```

## Instalação

O Shiki (MIT) é uma dependência peer opcional, necessária apenas para `highlightCode`:

```sh
pnpm add shiki
```

`CodeBlock` e `Code` nunca o carregam: um `CodeBlock` que recebe uma string mostra o código sem cores. `highlightCode`
carrega o Shiki com um `import()` dinâmico na primeira chamada e o mantém para as seguintes; sem o Shiki, rejeita com
um erro que diz para instalá-lo. A linguagem `text` nunca o carrega.

## highlightCode

`highlightCode(code, language)` retorna um `HighlightedCode`: o código (quebras de linha normalizadas para `\n`, sem a
quebra de linha final de um arquivo), sua linguagem e suas linhas, cada uma uma lista de tokens (`content`, e `color`,
`italic` e `bold` quando se aplicam). Sequências de um mesmo estilo são unidas, o que mantém os dados pequenos.

- Chame-a no servidor: num Server Component, num route handler ou num script de build. O resultado é serializável,
  então pode ser passado a um Client Component ou guardado em cache (por exemplo num arquivo JSON no build).
- As cores são referências ao tema (`var(--mi-support-violet-text)`), nunca valores hex, então o código realçado segue a
  paleta dada ao `UiProvider`, inclusive quando foi realçado antes de a paleta mudar.
- Usa o motor de expressões regulares em JavaScript do Shiki (sem WebAssembly) e carrega só as gramáticas de
  `codeLanguages`: `tsx`, `typescript`, `jsx`, `javascript`, `json`, `css`, `html`, `shell`, `markdown` e `text`.
- `plainCode(code, language?)` dá o mesmo formato sem cores, sem carregar o Shiki.

## CodeBlock

| Prop               | Tipo                                                       | Padrão   | Descrição                                                    |
| ------------------ | ---------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `code`             | `HighlightedCode \| string`                                | —        | Um trecho; uma string é mostrada sem cores                   |
| `fileName`         | `string`                                                   | —        | Mostrado acima do código e usado como seu nome acessível     |
| `highlightedLines` | `readonly number[]`                                        | `[]`     | Linhas a destacar, a partir de 1                             |
| `files`            | `readonly CodeFile[]` (`name`, `code`, `highlightedLines`) | —        | Vários arquivos, uma aba cada; substitui `code` e `fileName` |
| `file`             | `string`                                                   | —        | Nome do arquivo mostrado, para controlá-lo                   |
| `defaultFile`      | `string`                                                   | primeiro | Arquivo mostrado de início quando não controlado             |
| `onFileChange`     | `(name: string) => void`                                   | —        | Chamado quando outro arquivo é escolhido                     |
| `showLineNumbers`  | `boolean`                                                  | `false`  | Numera as linhas                                             |
| `copyable`         | `boolean`                                                  | `true`   | Mostra o botão de copiar, que copia o arquivo mostrado       |
| `labels`           | `Partial<CodeBlockLabels>`                                 | inglês   | `code`, `files` e `copy`; veja [Traduções](#traduções)       |

O cabeçalho mostra o nome do arquivo (ou a linguagem, quando não há nome), ou uma aba por arquivo, e o botão de copiar.
O código rola para o lado em vez de quebrar, e uma linha destacada é tingida (`state.selected`) até o fim da linha mais
longa, com uma barra de 2 px em `intent.brand.border` no início, uma forma além da cor.

```tsx
<CodeBlock
	files={[
		{ name: 'page.tsx', code: pageCode },
		{ name: 'theme.css', code: themeCode, highlightedLines: [2, 3] },
	]}
/>
```

## Code

`Code` é um elemento `<code>` para código curto dentro de texto corrido, em Geist Mono no tamanho do texto em volta, então
cabe num título tanto quanto numa legenda. Valores longos quebram em qualquer ponto em vez de transbordar.

```tsx
<p>
	Rode <Code>pnpm build</Code> antes dos testes.
</p>
```

## Cores

Cada papel da sintaxe usa um token do tema. Todos os pares fazem parte da auditoria de contraste (`auditContrast`, veja
[palette.md](./palette.md#auditoria-de-contraste)), a 4.5:1 sobre o bloco de código (`surface.field`) e sobre uma linha
destacada (`state.selected`).

| Papel                                                  | Token                    |
| ------------------------------------------------------ | ------------------------ |
| Código simples, variáveis                              | `text.primary`           |
| Comentários, números de linha                          | `text.muted`             |
| Pontuação, operadores                                  | `text.secondary`         |
| Palavras-chave (`import`, `const`, `return`)           | `support.violet.text`    |
| Strings                                                | `support.green.text`     |
| Números, `true`, `null`, valores CSS                   | `support.amber.text`     |
| Funções, chaves de objetos e de JSON, propriedades CSS | `support.blue.text`      |
| Tipos e classes                                        | `support.turquoise.text` |
| Tags e componentes                                     | `support.pink.text`      |
| Atributos, seletores CSS                               | `support.orange.text`    |
| Expressões regulares, código inválido                  | `support.red.text`       |

## Acessibilidade

- Um bloco é um `group` nomeado pelo nome do arquivo ou, sem ele, por `labels.code` ("Code"). O código é sempre
  disposto da esquerda para a direita (`dir="ltr"`), inclusive em páginas da direita para a esquerda.
- O código é uma parada de tabulação, para que o teclado role uma linha longa; o anel de foco é desenhado dentro do
  bloco.
- Com `files`, o cabeçalho é um `tablist` nomeado por `labels.files` (padrão de abas WAI-ARIA: uma parada de tabulação,
  setas, Home e End), e o código é o `tabpanel` da aba selecionada.
- Os números de linha são desenhados por CSS: não são selecionados nem copiados com o código.
- O botão de copiar é um [`CopyButton`](../en-us/components.md#copybutton): seu nome não muda, e o resultado é anunciado
  por uma região viva.

## Traduções

| Componente   | Textos                                                 |
| ------------ | ------------------------------------------------------ |
| `CodeBlock`  | `code` (nome de um bloco sem arquivo), `files`, `copy` |
| `CopyButton` | `copy`, `copied`, `failed`                             |

O `I18nProvider` de `@midnight-indigo/ui/i18n` os fornece em inglês e em português do Brasil (`codeBlock` e `copyButton`
no namespace `midnight-indigo`); os padrões são `defaultCodeBlockLabels` e `defaultCopyButtonLabels`.

## Bundle

A entrada alcança apenas React e subpaths do Material UI. `highlightCode` importa o adaptador do Shiki
(`dist/code/highlighter/index.js`, que importa `shiki/core` e `shiki/engine/javascript`) com um `import()` dinâmico,
então uma página que só renderiza código nunca o carrega; a fixture de consumidor percorre o grafo de imports compilado
para provar isso, e `pnpm check:bundle` mede a entrada e sua parte sob demanda.

## Testes

`highlightCode` é testado em todas as linguagens (cada caractere mantido, só cores da sintaxe), com quebras de linha
normalizadas e um erro útil quando falta o Shiki. As cores da sintaxe são conferidas na auditoria de contraste.
`CodeBlock` é testado quanto a nomes, tokens, números de linha (só CSS), linhas destacadas, abas de arquivo pelo
teclado, cópia do arquivo mostrado e labels traduzidos, com axe-core; a fixture de consumidor realça com a saída
compilada e renderiza os componentes no servidor.
