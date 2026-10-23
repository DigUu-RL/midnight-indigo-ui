// The component explorer is complete and current: every component of the catalog has its examples, its texts in both
// languages and its props generated from the library as it is built; every prop described by the library is
// translated from its current text; and the code of the playground compiles for every value of every control.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, test } from 'node:test';

import typescript from 'typescript';

import { generateComponentApi } from '@/scripts/generate-explorer-api';
import { starterRoot } from '@/test/support/starter-server';
import {
	camelCaseOf,
	controlledNameOf,
	describedNamesOf,
	exampleFileOf,
	explorerComponents,
	findComponent,
	kebabCaseOf,
	slugOf,
} from '@/src/explorer/catalog';
import type { ExplorerComponent, HookTrigger, PlaygroundValue } from '@/src/explorer/catalog';
import { generatedApi, propTranslations } from '@/src/explorer/component-api';
import type { ComponentProp } from '@/src/explorer/component-api';
import { routeSegmentOf } from '@/src/explorer/routes';
import { sampleCodes } from '@/src/explorer/sample-code';
import type { SampleCode, SampleName } from '@/src/explorer/sample-code';
import { snippetOf } from '@/src/explorer/snippet';
import englishMessages from '@/src/messages/en-us.json' with { type: 'json' };
import brazilianPortugueseMessages from '@/src/messages/pt-br.json' with { type: 'json' };

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

/** The props the playground edits: those of the component, or the fields of the options of its hook. */
const propsOfComponent = (component: ExplorerComponent): readonly ComponentProp[] => {
	return generatedApi[controlledNameOf(component)] ?? [];
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
				...Object.keys(component.slots),
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

			(component.opener?.closeProps ?? []).forEach((name: string): void => {
				assert.ok(propNamed(component, name), `${component.name} has no prop ${name}.`);
			});

			(component.types ?? []).forEach((type: string): void => {
				assert.ok((generatedApi[type] ?? []).length > 0, `${type} has no fields.`);
			});

			// The page documents the type the hook returns and the options of its method, which that method takes.
			const trigger: HookTrigger | undefined = component.trigger;
			if (trigger === undefined) return;
			assert.ok(component.types?.includes(trigger.api), trigger.api);
			assert.ok(component.types?.includes(trigger.options), trigger.options);

			const method: ComponentProp | undefined = generatedApi[trigger.api]?.find(
				(prop: ComponentProp): boolean => prop.name === trigger.method,
			);

			assert.match(method?.type ?? '', new RegExp(`^\\(options: ${trigger.options}\\)`));
		});
	});

	test('has the texts of every component, example and accessibility note in both languages', (): void => {
		localeMessages.forEach(([locale, messages]: [string, Messages]): void => {
			explorerComponents.forEach((component: ExplorerComponent): void => {
				const key: string = `explorer.components.${camelCaseOf(component.name)}`;

				const paths: string[] = [
					`explorer.subpaths.${camelCaseOf(routeSegmentOf(component.subpath))}`,
					`${key}.summary`,
					`${key}.description`,
					...component.examples.flatMap((id: string): string[] => {
						return [`${key}.examples.${id}.title`, `${key}.examples.${id}.description`];
					}),
					...component.accessibility.map((note: string): string => `${key}.accessibility.${note}`),
					...component.parts.map((part: string): string => `${key}.parts.${camelCaseOf(part)}`),
					...(component.types ?? []).map((type: string): string => {
						return `${key}.types.${camelCaseOf(type)}`;
					}),
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

	// The code shown is meant to be copied: it can import nothing that only exists in the starter. The locales the
	// `DatePickersProvider` takes come from its optional peer, date-fns.
	test('import only the public subpaths of the library, React and the locales of the date pickers', (): void => {
		const allowed: readonly RegExp[] = [
			/^@midnight-indigo\/ui\//,
			/^react$/,
			/^date-fns\/locale\/[\w-]+$/,
		];

		const others: string[] = exampleFiles.flatMap((file: string): string[] => {
			const source: string = readFileSync(join(examplesDirectory, file), 'utf8');

			return [...source.matchAll(importPattern)]
				.map((match: RegExpExecArray): string => match[1] ?? '')
				.filter((specifier: string): boolean => {
					return !allowed.some((pattern: RegExp): boolean => pattern.test(specifier));
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

	// The checker orders the values of a union as it first met them, e.g. `'row'` of `TableHeaderCell` before
	// `'column'` of `Stack`; the page shows them as the library writes them.
	test('list the values of a union in the order the library writes them, through its aliases', (): void => {
		const optionsOf = (component: string, name: string): string[] | undefined => {
			return generatedApi[component]?.find((prop: ComponentProp): boolean => prop.name === name)
				?.options;
		};

		assert.deepEqual(optionsOf('Stack', 'direction'), ['column', 'row']);
		assert.deepEqual(optionsOf('Stack', 'justify'), ['start', 'center', 'end', 'between']);
		assert.deepEqual(optionsOf('DataTable', 'status'), ['ready', 'loading', 'error']);
	});

	test('join the types of a prop that each member of a union declares', (): void => {
		const typeOf = (name: string): string | undefined => {
			return generatedApi.DataTable?.find((prop: ComponentProp): boolean => prop.name === name)
				?.type;
		};

		assert.equal(typeOf('processing'), "'client' | 'server'");
		assert.equal(typeOf('rowCount'), 'number');
	});

	test('are described in Brazilian Portuguese from the current English text', (): void => {
		const problems: string[] = [
			...new Set(
				explorerComponents.flatMap((component: ExplorerComponent): string[] => {
					return describedNamesOf(component);
				}),
			),
		].flatMap((name: string): string[] => {
			const translations: Readonly<Record<string, { source: string }>> =
				propTranslations[name] ?? {};

			const described: ComponentProp[] = (generatedApi[name] ?? []).filter(
				(prop: ComponentProp): boolean => prop.description !== '',
			);

			const missing: string[] = described
				.filter((prop: ComponentProp): boolean => {
					return translations[prop.name]?.source !== prop.description;
				})
				.map((prop: ComponentProp): string => {
					return `${name}.${prop.name}: translate "${prop.description}"`;
				});

			const unknown: string[] = Object.keys(translations)
				.filter((propName: string): boolean => {
					return !described.some((prop: ComponentProp): boolean => prop.name === propName);
				})
				.map((propName: string): string => `${name}.${propName}: no such described prop`);

			return [...missing, ...unknown];
		});

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

	test('writes the samples of the props that take an element, and the props of the catalog without a control', (): void => {
		const plusIcon: SampleCode = sampleCodes.plusIcon;

		const snippet: string = snippetOf({
			name: 'IconButton',
			subpath: 'buttons',
			props: [{ ...chip[0], name: 'label', type: 'string', kind: 'string' } as ComponentProp],
			values: { label: 'Add crew member' },
			slots: { children: plusIcon },
		});

		assert.match(
			snippet,
			/^import \{ IconButton \} from '@midnight-indigo\/ui\/buttons';\nimport \{ Icon \} from '@midnight-indigo\/ui\/icons';/,
		);

		assert.match(
			snippet,
			/\t\t<IconButton label='Add crew member'>\n\t\t\t<Icon decorative>\n\t\t\t\t<path\n\t\t\t\t\td='M12 5v14m-7-7h14'\n(?:\t\t\t\t\t[^\n]+\n)+\t\t\t\t\/>\n\t\t\t<\/Icon>\n\t\t<\/IconButton>/,
		);

		assert.match(
			snippetOf({ name: 'CopyButton', subpath: 'buttons', props: [], values: { value: 'Hoth' } }),
			/return <CopyButton value='Hoth' \/>;/,
		);

		const merged: string = snippetOf({
			name: 'Card',
			subpath: 'data-display',
			props: [],
			values: {},
			slots: { children: sampleCodes.missionBrief },
		});

		assert.match(
			merged,
			/import \{ Card, CardContent, CardHeader \} from '@midnight-indigo\/ui\/data-display';/,
		);
	});

	test('writes once, before the component, the declarations and the types the samples share', (): void => {
		const snippet: string = snippetOf({
			name: 'DataTable',
			subpath: 'data-display',
			props: [],
			values: { caption: 'Wanted bounties' },
			slots: {
				columns: sampleCodes.bountyColumns,
				rows: sampleCodes.bounties,
				getRowId: sampleCodes.bountyRowId,
			},
		});

		assert.match(
			snippet,
			/^import \{ DataTable \} from '@midnight-indigo\/ui\/data-display';\nimport type \{ DataTableColumn \} from '@midnight-indigo\/ui\/data-display';\nimport type \{ ReactElement \} from 'react';\n\ninterface Bounty \{/,
		);

		assert.equal(snippet.match(/interface Bounty/g)?.length, 1);
		assert.match(snippet, /\n\];\n\nconst bounties: readonly Bounty\[\] = \[\n/);
		assert.match(snippet, /\n\];\n\nexport const DataTableExample = \(\): ReactElement => \{/);

		assert.match(
			snippet,
			/\t\t\tcolumns=\{bountyColumns\}\n\t\t\trows=\{bounties\}\n\t\t\tgetRowId=\{\(bounty: Bounty\): string => bounty\.name\}\n/,
		);
	});

	test('writes a modal overlay with the button that opens it and the state of open', (): void => {
		const snippet: string = snippetOf({
			name: 'ConfirmDialog',
			subpath: 'feedback',
			props: [],
			values: { title: 'Release the bounty?' },
			opener: { label: 'Release the bounty', closeProps: ['onConfirm', 'onCancel'] },
		});

		assert.equal(
			snippet,
			[
				"'use client';",
				"import { Button } from '@midnight-indigo/ui/buttons';",
				"import { ConfirmDialog } from '@midnight-indigo/ui/feedback';",
				"import { useState } from 'react';",
				"import type { ReactElement } from 'react';",
				'',
				'export const ConfirmDialogExample = (): ReactElement => {',
				'\tconst [open, setOpen] = useState<boolean>(false);',
				'',
				'\treturn (',
				'\t\t<>',
				'\t\t\t<Button onClick={(): void => setOpen(true)}>Release the bounty</Button>',
				'',
				'\t\t\t<ConfirmDialog',
				"\t\t\t\ttitle='Release the bounty?'",
				'\t\t\t\topen={open}',
				'\t\t\t\tonConfirm={(): void => setOpen(false)}',
				'\t\t\t\tonCancel={(): void => setOpen(false)}',
				'\t\t\t/>',
				'\t\t</>',
				'\t);',
				'};',
			].join('\n'),
		);
	});

	test('writes a component driven by a hook as the button that calls it with the values as options', (): void => {
		const options: ComponentProp[] = [
			{ ...chip[1], name: 'intent', defaultValue: "'default'", options: ['default', 'error'] },
			{ ...chip[0], name: 'title', type: 'string', required: false, kind: 'string' },
			{ ...chip[0], name: 'message', type: 'string', kind: 'string' },
		] as ComponentProp[];

		const trigger: HookTrigger = {
			hook: 'useToast',
			api: 'ToastApi',
			method: 'show',
			options: 'ToastOptions',
			label: 'Show the toast',
		};

		assert.equal(
			snippetOf({
				name: 'ToastProvider',
				subpath: 'feedback',
				props: options,
				values: { intent: 'error', title: '', message: "Jet Black's ship is out of fuel." },
				trigger,
			}),
			[
				"'use client';",
				"import { Button } from '@midnight-indigo/ui/buttons';",
				"import { useToast } from '@midnight-indigo/ui/feedback';",
				"import type { ToastApi } from '@midnight-indigo/ui/feedback';",
				"import type { ReactElement } from 'react';",
				'',
				'export const ToastProviderExample = (): ReactElement => {',
				'\tconst toast: ToastApi = useToast();',
				'',
				'\treturn (',
				'\t\t<Button',
				'\t\t\tonClick={(): void => {',
				"\t\t\t\ttoast.show({ intent: 'error', message: \"Jet Black's ship is out of fuel.\" });",
				'\t\t\t}}',
				'\t\t>',
				'\t\t\tShow the toast',
				'\t\t</Button>',
				'\t);',
				'};',
			].join('\n'),
		);

		assert.match(
			snippetOf({
				name: 'ToastProvider',
				subpath: 'feedback',
				props: options,
				values: {
					intent: 'default',
					title: 'Bounty collected',
					message: 'Spike Spiegel delivered Asimov Solensan to the ISSP.',
				},
				trigger,
			}),
			/\t\t\t\ttoast\.show\(\{\n\t\t\t\t\ttitle: 'Bounty collected',\n\t\t\t\t\tmessage: '[^']+',\n\t\t\t\t\}\);\n/,
		);
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
							slots: Object.fromEntries(
								Object.entries(component.slots).map(
									([prop, sample]: [string, SampleName]): [string, SampleCode] => {
										return [prop, sampleCodes[sample]];
									},
								),
							),
							opener: component.opener,
							trigger: component.trigger,
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
