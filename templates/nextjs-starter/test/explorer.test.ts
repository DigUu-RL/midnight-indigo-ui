// The component explorer is complete and current: every component of the catalog has its examples, its texts in both
// languages and its props generated from the library as it is built; every prop described by the library is
// translated from its current text; and the code of the playground compiles for every value of every control.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, test } from 'node:test';

import typescript from 'typescript';

import { generateComponentApi } from '#scripts/generate-explorer-api.ts';
import { starterRoot } from '#test/support/starter-server.ts';
import {
	camelCaseOf,
	exampleFileOf,
	explorerComponents,
	findComponent,
	kebabCaseOf,
	slugOf,
} from '#src/explorer/catalog.ts';
import type { ExplorerComponent, PlaygroundValue } from '#src/explorer/catalog.ts';
import { generatedApi, propTranslations } from '#src/explorer/component-api.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import { snippetOf } from '#src/explorer/snippet.ts';
import englishMessages from '#src/messages/en-us.json' with { type: 'json' };
import brazilianPortugueseMessages from '#src/messages/pt-br.json' with { type: 'json' };

interface Messages {
	readonly [key: string]: string | Messages;
}

const examplesDirectory: string = join(starterRoot, 'src', 'explorer', 'examples');

const localeMessages: readonly [string, Messages][] = [
	['en-us', englishMessages],
	['pt-br', brazilianPortugueseMessages],
];

// `import 'x'`, `import ... from 'x'` and `export ... from 'x'`, over several lines too.
const importPattern: RegExp =
	/(?:^|\n)\s*(?:import\s+(?:[\w*{}\s,]+?\s+from\s+)?|export\s+[\w*{}\s,]+?\s+from\s+)['"]([^'"]+)['"]/g;

const messageAt = (messages: Messages, path: string): string | Messages | undefined => {
	return path
		.split('.')
		.reduce((node: string | Messages | undefined, key: string): string | Messages | undefined => {
			return typeof node === 'object' ? node[key] : undefined;
		}, messages);
};

const propsOfComponent = (component: ExplorerComponent): readonly ComponentProp[] => {
	return generatedApi[component.name] ?? [];
};

const propNamed = (component: ExplorerComponent, name: string): ComponentProp | undefined => {
	return propsOfComponent(component).find((prop: ComponentProp): boolean => prop.name === name);
};

describe('the catalog', (): void => {
	test('names each component once, with a slug and a message key of its own', (): void => {
		const slugs: string[] = explorerComponents.map((component: ExplorerComponent): string => {
			return slugOf(component);
		});

		assert.deepEqual(slugs, [...new Set(slugs)]);
		assert.equal(slugOf({ name: 'IconButton' }), 'icon-button');
		assert.equal(camelCaseOf('data-display'), 'dataDisplay');
		assert.equal(kebabCaseOf('withIcon'), 'with-icon');
		assert.equal(findComponent('chip')?.name, 'Chip');
		assert.equal(findComponent('no-such-component'), undefined);
	});

	test('refers only to props the library declares, with a control for each kind', (): void => {
		explorerComponents.forEach((component: ExplorerComponent): void => {
			const names: string[] = [
				...Object.keys(component.baseProps),
				...component.controls,
				...component.variants,
				...component.states,
			];

			names.forEach((name: string): void => {
				assert.ok(propNamed(component, name), `${component.name} has no prop ${name}.`);
			});

			component.variants.forEach((name: string): void => {
				assert.equal(propNamed(component, name)?.kind, 'enum', `${component.name}.${name}`);
			});

			component.states.forEach((name: string): void => {
				assert.equal(propNamed(component, name)?.kind, 'boolean', `${component.name}.${name}`);
			});

			component.controls.forEach((name: string): void => {
				assert.notEqual(propNamed(component, name)?.kind, 'other', `${component.name}.${name}`);
			});
		});
	});

	test('has the texts of every component, example and accessibility note in both languages', (): void => {
		localeMessages.forEach(([locale, messages]: [string, Messages]): void => {
			explorerComponents.forEach((component: ExplorerComponent): void => {
				const key: string = `explorer.components.${camelCaseOf(component.name)}`;

				const paths: string[] = [
					`explorer.subpaths.${camelCaseOf(component.subpath)}`,
					`${key}.summary`,
					`${key}.description`,
					...component.examples.flatMap((id: string): string[] => {
						return [`${key}.examples.${id}.title`, `${key}.examples.${id}.description`];
					}),
					...component.accessibility.map((note: string): string => `${key}.accessibility.${note}`),
				];

				paths.forEach((path: string): void => {
					assert.equal(typeof messageAt(messages, path), 'string', `${locale}: ${path}`);
				});
			});
		});
	});
});

describe('the examples', (): void => {
	const exampleFiles: string[] = explorerComponents.flatMap(
		(component: ExplorerComponent): string[] => {
			return component.examples.map((id: string): string => exampleFileOf(component, id));
		},
	);

	test('are files of their own', (): void => {
		exampleFiles.forEach((file: string): void => {
			assert.ok(existsSync(join(examplesDirectory, file)), `${file} is missing.`);
		});
	});

	// The code shown is meant to be copied: it can import nothing that only exists in the starter.
	test('import only the public subpaths of the library and React', (): void => {
		const others: string[] = exampleFiles.flatMap((file: string): string[] => {
			const source: string = readFileSync(join(examplesDirectory, file), 'utf8');

			return [...source.matchAll(importPattern)]
				.map((match: RegExpExecArray): string => match[1] ?? '')
				.filter((specifier: string): boolean => {
					return !specifier.startsWith('@midnight-indigo/ui/') && specifier !== 'react';
				})
				.map((specifier: string): string => `${file}: ${specifier}`);
		});

		assert.deepEqual(others, []);
	});
});

describe('the props', (): void => {
	test('are generated from the declarations of the library as it is built', (): void => {
		assert.deepEqual(
			generateComponentApi(),
			generatedApi,
			'Run node scripts/generate-explorer-api.ts.',
		);
	});

	test('are described in Brazilian Portuguese from the current English text', (): void => {
		const problems: string[] = explorerComponents.flatMap(
			(component: ExplorerComponent): string[] => {
				const translations: Readonly<Record<string, { source: string }>> =
					propTranslations[component.name] ?? {};

				const described: ComponentProp[] = propsOfComponent(component).filter(
					(prop: ComponentProp): boolean => prop.description !== '',
				);

				const missing: string[] = described
					.filter((prop: ComponentProp): boolean => {
						return translations[prop.name]?.source !== prop.description;
					})
					.map((prop: ComponentProp): string => {
						return `${component.name}.${prop.name}: translate "${prop.description}"`;
					});

				const unknown: string[] = Object.keys(translations)
					.filter((name: string): boolean => {
						return !described.some((prop: ComponentProp): boolean => prop.name === name);
					})
					.map((name: string): string => `${component.name}.${name}: no such described prop`);

				return [...missing, ...unknown];
			},
		);

		assert.deepEqual(problems, []);
	});
});

describe('the code of the playground', (): void => {
	const chip: ComponentProp[] = [
		{
			name: 'label',
			type: 'ReactNode',
			required: true,
			defaultValue: null,
			description: '',
			native: false,
			kind: 'node',
			options: [],
		},
		{
			name: 'size',
			type: 'ChipSize',
			required: false,
			defaultValue: "'medium'",
			description: '',
			native: false,
			kind: 'enum',
			options: ['small', 'medium'],
		},
		{
			name: 'disabled',
			type: 'boolean',
			required: false,
			defaultValue: null,
			description: '',
			native: false,
			kind: 'boolean',
			options: [],
		},
	];

	test('leaves out the props at their default and writes the others as JSX', (): void => {
		assert.equal(
			snippetOf({
				name: 'Chip',
				subpath: 'data-display',
				props: chip,
				values: { label: 'Samus Aran', size: 'medium', disabled: false },
			}),
			[
				"import { Chip } from '@midnight-indigo/ui/data-display';",
				"import type { ReactElement } from 'react';",
				'',
				'export const ChipExample = (): ReactElement => {',
				"\treturn <Chip label='Samus Aran' />;",
				'};',
			].join('\n'),
		);

		assert.match(
			snippetOf({
				name: 'Chip',
				subpath: 'data-display',
				props: chip,
				values: { label: "Spike's Bebop", size: 'small', disabled: true },
			}),
			/<Chip label=\{"Spike's Bebop"\} size='small' disabled \/>/,
		);
	});

	test('breaks a long element into one prop per line, and keeps a text child as text', (): void => {
		const snippet: string = snippetOf({
			name: 'Chip',
			subpath: 'data-display',
			props: chip,
			values: {
				label: 'Leia Organa, General of the Resistance, in command of the fleet',
				size: 'small',
				disabled: true,
			},
		});

		assert.match(
			snippet,
			/\treturn \(\n\t\t<Chip\n\t\t\tlabel='[^']+'\n\t\t\tsize='small'\n\t\t\tdisabled\n\t\t\/>\n\t\);/,
		);

		const button: string = snippetOf({
			name: 'Button',
			subpath: 'buttons',
			props: [{ ...chip[0], name: 'children' } as ComponentProp],
			values: { children: 'Engage <hyperdrive>' },
		});

		assert.match(button, /<Button>\{"Engage <hyperdrive>"\}<\/Button>/);
	});

	test('compiles for every value of every control of every component', (): void => {
		const snippets: Map<string, string> = new Map<string, string>();

		explorerComponents.forEach((component: ExplorerComponent): void => {
			const controls: ComponentProp[] = component.controls.flatMap(
				(name: string): ComponentProp[] => {
					const prop: ComponentProp | undefined = propNamed(component, name);
					return prop === undefined ? [] : [prop];
				},
			);

			const variations: Readonly<Record<string, PlaygroundValue>>[] = [
				component.baseProps,
				...controls.flatMap((prop: ComponentProp): Record<string, PlaygroundValue>[] => {
					const values: PlaygroundValue[] =
						prop.kind === 'enum'
							? prop.options
							: prop.kind === 'boolean'
								? [true]
								: prop.kind === 'number'
									? [3]
									: ["Faye Valentine's {bounty} <list>"];

					return values.map((value: PlaygroundValue): Record<string, PlaygroundValue> => {
						return { ...component.baseProps, [prop.name]: value };
					});
				}),
			];

			variations.forEach(
				(values: Readonly<Record<string, PlaygroundValue>>, index: number): void => {
					snippets.set(
						join(
							starterRoot,
							'src',
							'explorer',
							`playground-snippet-${slugOf(component)}-${String(index)}.tsx`,
						),
						snippetOf({
							name: component.name,
							subpath: component.subpath,
							props: controls,
							values,
						}),
					);
				},
			);
		});

		const configuration: typescript.ParsedCommandLine | undefined =
			typescript.getParsedCommandLineOfConfigFile(
				join(starterRoot, 'tsconfig.json'),
				{},
				{
					...typescript.sys,
					onUnRecoverableConfigFileDiagnostic: (): void => {
						assert.fail('The TypeScript configuration of the starter cannot be read.');
					},
				},
			);

		const options: typescript.CompilerOptions = {
			...configuration?.options,
			incremental: false,
			plugins: [],
		};

		const host: typescript.CompilerHost = typescript.createCompilerHost(options);
		const getSourceFile: typescript.CompilerHost['getSourceFile'] = host.getSourceFile.bind(host);
		const fileExists: (file: string) => boolean = host.fileExists.bind(host);
		const readFile: (file: string) => string | undefined = host.readFile.bind(host);

		host.fileExists = (file: string): boolean => snippets.has(resolve(file)) || fileExists(file);

		host.readFile = (file: string): string | undefined => {
			return snippets.get(resolve(file)) ?? readFile(file);
		};

		host.getSourceFile = (
			file: string,
			languageVersion: typescript.ScriptTarget | typescript.CreateSourceFileOptions,
		): typescript.SourceFile | undefined => {
			const snippet: string | undefined = snippets.get(resolve(file));

			return snippet === undefined
				? getSourceFile(file, languageVersion)
				: typescript.createSourceFile(file, snippet, languageVersion, true);
		};

		const program: typescript.Program = typescript.createProgram(
			[...snippets.keys()],
			options,
			host,
		);

		const errors: string[] = typescript
			.getPreEmitDiagnostics(program)
			.map((diagnostic: typescript.Diagnostic): string => {
				const message: string = typescript.flattenDiagnosticMessageText(
					diagnostic.messageText,
					'\n',
				);

				const snippet: string = snippets.get(resolve(diagnostic.file?.fileName ?? '')) ?? '';
				return `${message}\n${snippet}`;
			});

		assert.ok(snippets.size > explorerComponents.length);
		assert.deepEqual(errors, []);
	});
});
