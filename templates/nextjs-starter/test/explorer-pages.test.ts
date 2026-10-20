// The pages of the component explorer, served by the production build: the home lists every component, and the page
// of a component shows its import, its variants, its playground and the code of each example as its file has it, its
// props described in the language of the page and a table of contents, with no highlighter sent to the browser.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';

import { readStreamedPage, startStarter, starterRoot } from '#test/support/starter-server.ts';
import type { StarterServer, StreamedPage } from '#test/support/starter-server.ts';
import { exampleFileOf, explorerComponents, slugOf } from '#src/explorer/catalog.ts';
import type { ExplorerComponent } from '#src/explorer/catalog.ts';
import { generatedApi, propTranslations } from '#src/explorer/component-api.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import { sampleCodes } from '#src/explorer/sample-code.ts';

const entities: Readonly<Record<string, string>> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#x27;': "'",
	'&#39;': "'",
	'&nbsp;': ' ',
};

/** The text of some HTML, as a reader gets it: without the tags, the comments React adds or the entities. */
const textOf = (html: string): string => {
	return html
		.replaceAll(/<script[\s\S]*?<\/script>/g, '')
		.replaceAll(/<[^>]+>/g, '')
		.replaceAll(/&(?:amp|lt|gt|quot|nbsp|#x27|#39);/g, (entity: string): string => {
			return entities[entity] ?? entity;
		});
};

/** Code shown in lines of their own loses its line breaks with the tags, so code is compared without spaces. */
const compact = (text: string): string => text.replaceAll(/\s+/g, '');

let server: StarterServer;

before(async (): Promise<void> => {
	server = await startStarter();
});

after((): void => {
	server.stop();
});

test('the home of the explorer links to the page of every component, with what it is for', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us/components`);

	explorerComponents.forEach((component: ExplorerComponent): void => {
		assert.match(html, new RegExp(`<a[^>]*href="/en-us/components/${slugOf(component)}"`));
	});

	assert.match(textOf(html), /Compact label for an attribute, a status or a filter\./);
	assert.match(html, /<nav[^>]*aria-label="Components"/);
	assert.match(html, /<input[^>]*type="search"/);
});

describe('the page of a component', (): void => {
	let html: string;
	let text: string;

	before(async (): Promise<void> => {
		html = (await readStreamedPage(`${server.origin}/en-us/components/chip`)).html;
		text = textOf(html);
	});

	test('is the current page of the navigation of the explorer and of the breadcrumbs', (): void => {
		assert.match(html, /<a(?=[^>]*href="\/en-us\/components\/chip")(?=[^>]*aria-current="page")/);
		assert.match(html, /<nav aria-label="Breadcrumb">.*?href="\/en-us\/components".*?Chip/s);
	});

	test('shows the import of the component from its subpath', (): void => {
		assert.ok(
			compact(text).includes(compact("import { Chip } from '@midnight-indigo/ui/data-display';")),
		);
	});

	test('renders every value of each variant', (): void => {
		const intent: ComponentProp | undefined = generatedApi.Chip?.find(
			(prop: ComponentProp): boolean => {
				return prop.name === 'intent';
			},
		);

		intent?.options.forEach((option: string): void => {
			assert.match(html, new RegExp(`<code[^>]*>${option}</code>`));
		});

		assert.doesNotMatch(html, /<figcaption>States<\/figcaption>/);
	});

	test('shows the code of each example as its file has it, highlighted on the server', (): void => {
		const chip: ExplorerComponent | undefined = explorerComponents.find(
			(component: ExplorerComponent): boolean => component.name === 'Chip',
		);

		chip?.examples.forEach((id: string): void => {
			const source: string = readFileSync(
				join(starterRoot, 'src', 'explorer', 'examples', exampleFileOf(chip, id)),
				'utf8',
			);

			assert.ok(compact(text).includes(compact(source)), `The code of ${id} is not shown.`);
		});

		assert.match(html, /role="tablist" aria-label="Filters: preview and code"/);
		assert.match(html, /style="color:var\(--mi-support-[a-z]+-text\)"/);
	});

	test('has a playground whose code starts with the props of the catalog', (): void => {
		assert.match(html, /role="group" aria-label="Component with the chosen props"/);
		assert.ok(compact(text).includes(compact("return <Chip label='Samus Aran' />;")));
	});

	test('lists every prop with its type, default and description', (): void => {
		assert.match(html, /<caption[^>]*>Props of Chip<\/caption>/);

		generatedApi.Chip?.forEach((prop: ComponentProp): void => {
			assert.match(html, new RegExp(`<th scope="row"[^>]*><code[^>]*>${prop.name}</code>`));
		});

		assert.ok(text.includes('Makes the chip a button.'));
	});

	test('has a table of contents of its sections and examples', (): void => {
		[
			'usage',
			'variants',
			'playground',
			'examples',
			'example-filters',
			'api',
			'accessibility',
		].forEach((id: string): void => {
			assert.match(html, new RegExp(`<a[^>]*href="#${id}"`));
			assert.match(html, new RegExp(`id="${id}"`));
		});
	});

	test('sends no highlighter to the browser', async (): Promise<void> => {
		const scripts: string[] = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(
			(match: RegExpExecArray): string => match[1] ?? '',
		);

		const sources: string[] = await Promise.all(
			scripts.map(async (script: string): Promise<string> => {
				return (await fetch(new URL(script, server.origin))).text();
			}),
		);

		assert.ok(sources.length > 0);

		assert.deepEqual(
			sources.filter((source: string): boolean => /createHighlighterCore|oniguruma/.test(source)),
			[],
		);
	});
});

test('the states of a component are shown one at a time, after the default', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us/components/button`);

	assert.match(
		html,
		/<figcaption>States<\/figcaption>.*?<code[^>]*>default<\/code>.*?<code[^>]*>loading<\/code>.*?<code[^>]*>disabled<\/code>/s,
	);
});

test('a sample given to a prop is rendered as the code of the playground writes it', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(
		`${server.origin}/en-us/components/icon-button`,
	);

	const text: string = textOf(html);

	assert.match(
		html,
		/<button[^>]*aria-label="Add crew member"[^>]*>.*?<path d="M12 5v14m-7-7h14"/s,
	);

	assert.ok(compact(text).includes(compact(sampleCodes.plusIcon.code)));
	assert.ok(compact(text).includes(compact("import { Icon } from '@midnight-indigo/ui/icons';")));
});

test('an object given to a prop is rendered and written as the code of the playground writes it', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(
		`${server.origin}/en-us/components/stat-card`,
	);

	const text: string = textOf(html);

	assert.ok(compact(text).includes(compact(`change={${sampleCodes.bountyChange.code}}`)));
	assert.match(text, /Up 12%/);
});

test('a list of elements given to a prop stays a list of children', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(
		`${server.origin}/en-us/components/carousel`,
	);

	assert.match(html, /role="group" aria-roledescription="slide" aria-label="3 of 3"/);
	assert.ok(textOf(html).includes('Dagobah'));
});

test('functions given to a prop come from a client module, and their code from the declarations of the snippet', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(
		`${server.origin}/en-us/components/data-table`,
	);

	const text: string = textOf(html);

	assert.match(html, /<th scope="row"[^>]*>Vincent Volaju<\/th>/);
	assert.ok(text.includes('300,000,000 woolongs'));
	assert.ok(compact(text).includes(compact(sampleCodes.bountyColumns.declarations[1])));
	assert.ok(compact(text).includes(compact('getRowId={(bounty: Bounty): string => bounty.name}')));
});

test('an async example colors its code on the server, and a text given to a prop is declared in the snippet', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(
		`${server.origin}/en-us/components/code-block`,
	);

	const text: string = textOf(html);

	assert.match(html, /<pre[^>]*aria-label="hyperdrive\.ts"/);
	assert.match(html, /data-highlighted="true"/);
	assert.ok(compact(text).includes(compact(sampleCodes.jumpSource.declarations[0])));
	assert.ok(compact(text).includes(compact('code={jumpSource}')));
});

test('a modal overlay has no grid, and its playground opens it with a button the code writes too', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us/components/dialog`);
	const text: string = textOf(html);

	assert.doesNotMatch(html, /id="variants"/);
	assert.match(html, /<button[^>]*>Open the flight plan<\/button>/);
	assert.doesNotMatch(html, /role="dialog"/);
	assert.ok(compact(text).includes(compact('const [open, setOpen] = useState<boolean>(false);')));
	assert.ok(compact(text).includes(compact('onClose={(): void => setOpen(false)}')));
});

test('the types a component takes are documented with their fields and imported as types', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us/components/menu`);
	const text: string = textOf(html);

	assert.ok(
		compact(text).includes(
			compact("import type { MenuItemOption, MenuSeparator } from '@midnight-indigo/ui/feedback';"),
		),
	);

	assert.match(html, /<caption[^>]*>Fields of MenuItemOption<\/caption>/);
	assert.match(html, /<a[^>]*href="#api-menu-separator"/);
	assert.ok(text.includes('Runs after the menu has closed and focus is back on its trigger'));
	assert.ok(compact(text).includes(compact(sampleCodes.crewMenuItems.declarations[0])));
});

test('a part without props of its own says so instead of an empty table', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us/components/table`);
	const text: string = textOf(html);

	assert.ok(text.includes('TableRow has no props of its own'));
	assert.doesNotMatch(html, /<caption[^>]*>Props of TableRow<\/caption>/);
	assert.match(html, /<caption[^>]*>Props of TableHeaderCell<\/caption>/);
});

test('a component with parts documents them, and a page without variants leaves out their section', async (): Promise<void> => {
	const { html }: StreamedPage = await readStreamedPage(`${server.origin}/en-us/components/grid`);
	const text: string = textOf(html);

	assert.ok(
		compact(text).includes(compact("import { Grid, GridItem } from '@midnight-indigo/ui/layout';")),
	);

	assert.match(html, /<caption[^>]*>Props of GridItem<\/caption>/);
	assert.match(html, /<a[^>]*href="#api-grid-item"/);
	assert.doesNotMatch(html, /id="variants"/);
	assert.ok(text.includes('Tatooine'));
});

test('in Brazilian Portuguese, the props are described from the translations of the TSDoc', async (): Promise<void> => {
	const text: string = textOf(
		(await readStreamedPage(`${server.origin}/pt-br/components/chip`)).html,
	);

	assert.ok(text.includes(propTranslations.Chip?.onClick?.translation ?? '—'));
	assert.ok(text.includes('Props de Chip'));
	assert.ok(!text.includes('Makes the chip a button.'));
});
