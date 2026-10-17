# Ícones

[English](../en-us/icons.md)

`@midnight-indigo/ui/icons` renderiza os ícones do [Iconify](https://iconify.design), mais de 200 conjuntos de código
aberto num formato único, como SVG inline. Os dados do ícone já estão no seu código: nada é baixado em tempo de
execução, nem como alternativa, então um ícone renderiza igual no servidor e no navegador, offline e sob uma Content
Security Policy restritiva.

```tsx
import { IconifyIcon } from '@midnight-indigo/ui/icons';
import type { IconifyIconData } from '@midnight-indigo/ui/icons';

// tabler:rocket, Tabler Icons (MIT)
const rocketIcon: IconifyIconData = {
	width: 24,
	height: 24,
	body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3-5a9 9 0 0 0 6-8a3 3 0 0 0-3-3a9 9 0 0 0-8 6a6 6 0 0 0-5 3"/>',
};

<IconifyIcon icon={rocketIcon} label='Lançado' size='medium' />;
```

A entrada raiz (`@midnight-indigo/ui`) reexporta apenas o `Icon`; ela nunca carrega o renderizador do Iconify nem o
registro de coleções. `Icon` e `iconAccessibilityProps` são exportados pelas duas entradas.

## Duas formas de passar um ícone

| Como                                                        | Onde                                      | Custo no bundle                                    |
| ----------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| **Dados** (`icon={rocketIcon}`)                             | Server e Client Components                | Só os ícones que você importa (tree-shakable).     |
| **Nome** (`icon='tabler:rocket'`) de um conjunto registrado | Server Components (ou no cliente, opt-in) | Nenhum no servidor; o conjunto inteiro no cliente. |

**Dados.** Um objeto `IconifyIconData` (`body`, `width`, `height` e, opcionalmente, `left`, `top`, `rotate`, `hFlip`,
`vFlip`) declarado no seu código. Cada objeto é um export separado, então o bundler mantém só os que você usa: o
`check:bundle` da biblioteca verifica que um ícone importado traz apenas os próprios dados. O navegador de ícones do
starter copia esse código para qualquer ícone.

**Nome.** Registre o export `icons` de um pacote `@iconify-json/<prefixo>` e nomeie os ícones como `prefixo:nome`:

```tsx
import { icons as tablerIcons } from '@iconify-json/tabler';
import { IconifyIcon, registerIconCollection } from '@midnight-indigo/ui/icons';

registerIconCollection(tablerIcons);

<IconifyIcon icon='tabler:rocket' decorative />;
```

O registro vale para um ambiente JavaScript. Num Server Component o conjunto fica no servidor e o navegador recebe só o
SVG renderizado, então nomear ícones não custa JavaScript no cliente. Registrar num Client Component envia o conjunto
inteiro ao navegador (só o Tabler tem cerca de 2 MB antes da compressão); faça isso sabendo do custo e, no cliente,
prefira os dados. Um nome cujo conjunto não está registrado, ou que o conjunto não tem, lança um erro que diz qual dos
dois, em desenvolvimento e em produção.

`getIconData(collection, name)` devolve os dados de um ícone de um conjunto (com os aliases resolvidos), para código
que lê os conjuntos em tempo de build. `listRegisteredIconCollections()` e `unregisterIconCollection(prefix)`
administram o registro.

## Acessibilidade, tamanho e cor

`IconifyIcon` segue a regra do `Icon` ([foundations.md](../en-us/foundations.md#icons)): o tipo exige um `label` (ícone
funcional, `role="img"`) ou `decorative` (oculto das tecnologias assistivas). Um ícone no slot de um controle que já tem
nome é decorativo.

`size` é `small`, `medium`, `large` (os tokens `iconSize`) ou `inherit` (`1em`, o padrão). Ele define a altura; um
ícone largo ou alto mantém as proporções. Ícones monocromáticos usam `currentColor` e assumem a cor do texto; os
conjuntos multicoloridos (emoji, logos, bandeiras) mantêm as próprias cores.

Os ids dentro de um ícone (gradientes, máscaras) são renomeados a cada ícone renderizado, então duas cópias na mesma
página nunca os compartilham. Elementos vazios são escritos com tag de fechamento, como o navegador os serializa, então
o markup do servidor e o do cliente coincidem.

## Ícones nos componentes

Todo slot que recebe um ícone aceita um `IconifyIcon`: `startIcon` e `endIcon` do `Button`, o filho do `IconButton`,
`icon` do `Alert`, do `Chip`, das abas e dos itens da sidebar e de menus, a opção `icon` de um toast, o prefixo e o
sufixo dos campos, entre outros.

```tsx
<Button startIcon={<IconifyIcon icon={rocketIcon} decorative />}>Lançar</Button>;

toast.show({
	message: 'A versão 2 está no ar.',
	icon: <IconifyIcon icon={rocketIcon} decorative />,
});
```

Os glifos que os próprios componentes desenham (check, fechar, chevrons, ícones de intent) vêm do
[Tabler Icons](https://tabler.io/icons) (MIT). Eles ficam embutidos um a um na biblioteca, que não depende de nenhum
pacote de ícones em tempo de execução.

## Licenças e atribuição

Cada conjunto de ícones tem a sua própria licença. O starter depende de todos os conjuntos cuja licença permite
distribuição comercial junto de um projeto MIT: MIT, ISC, BSD, Apache-2.0, 0BSD, BlueOak-1.0.0, CC0-1.0, Unlicense,
OFL-1.1 e CC-BY-4.0. Os conjuntos sob GPL, CC-BY-SA, licença não comercial ou desconhecida, e os que o Iconify
descontinuou, ficam de fora; a lista de cada conjunto excluído e o motivo está no `ICON-NOTICES.pt-BR.md` do starter.

- Um pacote `@iconify-json/<prefixo>` por conjunto, nunca o `@iconify/json` completo, para que o `pnpm check:licenses`
  audite a licença que cada conjunto realmente declara. Adicionar um conjunto GPL ou CC-BY-SA faz a auditoria falhar.
- **CC-BY-4.0 exige dar crédito aos autores.** O starter gera o crédito: a página `/<locale>/icons/attribution` e os
  arquivos `ICON-NOTICES.md` e `ICON-NOTICES.pt-BR.md`. Mantenha um deles numa aplicação que distribui ícones desses
  conjuntos.
- `pnpm update:icon-sets` (na raiz do repositório) atualiza a lista a partir dos metadados do Iconify: as dependências
  do starter, o `src/icons/icon-sets.ts` e os avisos. Rode `pnpm install` em seguida.

Ao copiar os dados de um ícone para o seu código, o comentário que o navegador de ícones escreve acima dele
(`prefixo:nome`, conjunto, autor e licença) mantém rastreável a origem de cada ícone.
