// The code of what the playground shows: a component with the props the reader chose, as a TypeScript module that
// compiles as is (a test type-checks the snippets of every component). Props left at their default are left out; the
// other values (the props of the catalog without a control) and the samples of the props that take an element are
// always written, after the declarations they refer to. A modal overlay is written with the button that opens it and
// the state of `open`, and a component driven by a hook with the button that calls it with the values as options.
import type { HookTrigger, Opener, PlaygroundValue } from '#src/explorer/catalog.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import type { SampleCode } from '#src/explorer/sample-code.ts';

export interface SnippetSource {
	name: string;
	subpath: string;
	/** The props with a control, with the API of each one. */
	props: readonly ComponentProp[];
	values: Readonly<Record<string, PlaygroundValue>>;
	/** The code of the sample of each prop that takes an element. */
	slots?: Readonly<Record<string, SampleCode>>;
	/** The button that opens a modal overlay. */
	opener?: Opener | undefined;
	/** The hook a button calls with the values, in place of the component. */
	trigger?: HookTrigger | undefined;
}

const lineLimit: number = 100;

/** Columns of a tab, as Prettier counts them. */
const tabWidth: number = 2;

const literalOf = (value: PlaygroundValue): string => {
	return typeof value === 'string' ? `'${value}'` : String(value);
};

/** Whether the value changes nothing: the default, `false` without a default, or an empty optional text. */
const isDefault = (prop: ComponentProp, value: PlaygroundValue | undefined): boolean => {
	if (value === undefined) return true;
	if (prop.required) return false;
	if (prop.defaultValue !== null) return literalOf(value) === prop.defaultValue;
	return value === false || value === '';
};

const attributeOf = (name: string, value: PlaygroundValue): string => {
	if (value === true) return name;
	if (typeof value !== 'string') return `${name}={${String(value)}}`;
	return /['\\\n]/.test(value) ? `${name}={${JSON.stringify(value)}}` : `${name}='${value}'`;
};

/** Text as a child of an element: in an expression when JSX would read part of it as code or drop its spaces. */
const childOf = (value: PlaygroundValue): string => {
	const text: string = String(value);
	return /[{}<>\n]|^\s|\s$/.test(text) ? `{${JSON.stringify(text)}}` : text;
};

const fits = (line: string): boolean => line.length + 'return ;'.length + 2 <= lineLimit;

const elementLines = (
	name: string,
	attributes: readonly string[],
	children: readonly string[] | undefined,
): string[] => {
	const opening: string = [name, ...attributes].join(' ');
	const attributeLines: string[] = attributes.map((attribute: string): string => `\t${attribute}`);

	if (children === undefined) {
		const selfClosing: string = `<${opening} />`;
		return fits(selfClosing) ? [selfClosing] : [`<${name}`, ...attributeLines, '/>'];
	}

	const singleLine: string = `<${opening}>${children.join('')}</${name}>`;
	if (children.length === 1 && fits(singleLine)) return [singleLine];

	const openingLines: string[] = fits(`<${opening}>`)
		? [`<${opening}>`]
		: [`<${name}`, ...attributeLines, '>'];

	return [
		...openingLines,
		...children.map((line: string): string => (line === '' ? '' : `\t${line}`)),
		`</${name}>`,
	];
};

type ImportedNames = Readonly<Record<string, readonly string[]>>;

/** The names of each subpath, merged from every sample. */
const namesBySubpathOf = (
	imports: readonly ImportedNames[],
	initial: ReadonlyMap<string, ReadonlySet<string>>,
): Map<string, Set<string>> => {
	const namesBySubpath: Map<string, Set<string>> = new Map<string, Set<string>>(
		[...initial.entries()].map(
			([subpath, names]: [string, ReadonlySet<string>]): [string, Set<string>] => {
				return [subpath, new Set(names)];
			},
		),
	);

	imports.forEach((sampleImports: ImportedNames): void => {
		Object.entries(sampleImports).forEach(([subpath, names]: [string, readonly string[]]): void => {
			const known: Set<string> = namesBySubpath.get(subpath) ?? new Set<string>();
			namesBySubpath.set(subpath, new Set([...known, ...names]));
		});
	});

	return namesBySubpath;
};

/**
 * The imports of the component and of its samples, in the order of the subpaths: for each one, a line of its values
 * and a line of its types.
 */
const importLines = (
	name: string,
	subpath: string,
	slots: Readonly<Record<string, SampleCode>>,
	opener: Opener | undefined,
): string[] => {
	const samples: SampleCode[] = Object.values(slots);

	const values: Map<string, Set<string>> = namesBySubpathOf(
		[
			...samples.map((sample: SampleCode): ImportedNames => sample.imports),
			opener === undefined ? {} : { buttons: ['Button'] },
		],
		new Map([[subpath, new Set([name])]]),
	);

	const types: Map<string, Set<string>> = namesBySubpathOf(
		samples.map((sample: SampleCode): ImportedNames => sample.typeImports ?? {}),
		new Map(),
	);

	const subpaths: string[] = [...new Set([...values.keys(), ...types.keys()])].sort(
		(first: string, second: string): number => first.localeCompare(second),
	);

	return subpaths.flatMap((importedSubpath: string): string[] => {
		const source: string = `'@midnight-indigo/ui/${importedSubpath}'`;
		const valueNames: string[] = [...(values.get(importedSubpath) ?? [])].sort();
		const typeNames: string[] = [...(types.get(importedSubpath) ?? [])].sort();

		return [
			...(valueNames.length === 0 ? [] : [`import { ${valueNames.join(', ')} } from ${source};`]),
			...(typeNames.length === 0
				? []
				: [`import type { ${typeNames.join(', ')} } from ${source};`]),
		];
	});
};

/** The declarations of the samples, each one once, in the order the samples need them, then a blank line. */
const declarationLines = (slots: Readonly<Record<string, SampleCode>>): string[] => {
	const declarations: string[] = [
		...new Set(
			Object.values(slots).flatMap((sample: SampleCode): readonly string[] => {
				return sample.declarations ?? [];
			}),
		),
	];

	return declarations.flatMap((declaration: string): string[] => [...declaration.split('\n'), '']);
};

/** The attributes that open and close a modal overlay with the state of the snippet. */
const overlayAttributesOf = (opener: Opener | undefined): string[] => {
	if (opener === undefined) return [];

	return [
		'open={open}',
		...opener.closeProps.map((prop: string): string => `${prop}={(): void => setOpen(false)}`),
	];
};

/** The body of the component: the element, or the button that opens it beside it, with the state of `open`. */
const bodyLines = (
	name: string,
	element: readonly string[],
	opener: Opener | undefined,
): string[] => {
	const signature: string = `export const ${name}Example = (): ReactElement =>`;

	const indented = (lines: readonly string[], tabs: string): string[] => {
		return lines.map((line: string): string => (line === '' ? '' : `${tabs}${line}`));
	};

	if (opener === undefined) {
		return element.length === 1
			? [`${signature} {`, `\treturn ${element.join('')};`, '};']
			: [`${signature} {`, '\treturn (', ...indented(element, '\t\t'), '\t);', '};'];
	}

	const button: string[] = elementLines(
		'Button',
		['onClick={(): void => setOpen(true)}'],
		[childOf(opener.label)],
	);

	return [
		`${signature} {`,
		'\tconst [open, setOpen] = useState<boolean>(false);',
		'',
		'\treturn (',
		'\t\t<>',
		...indented(button, '\t\t\t'),
		'',
		...indented(element, '\t\t\t'),
		'\t\t</>',
		'\t);',
		'};',
	];
};

/** A value as a property of an object: a text in single quotes, unless it holds one. */
const propertyOf = (name: string, value: PlaygroundValue): string => {
	if (typeof value !== 'string') return `${name}: ${String(value)}`;
	return /['\\\n]/.test(value) ? `${name}: ${JSON.stringify(value)}` : `${name}: '${value}'`;
};

/** A call with an object of options, on one line when it fits at its indentation. */
const callLines = (call: string, properties: readonly string[], tabs: number): string[] => {
	const singleLine: string = `${call}({ ${properties.join(', ')} });`;
	if (tabs * tabWidth + singleLine.length <= lineLimit) return [singleLine];
	return [`${call}({`, ...properties.map((property: string): string => `\t${property},`), '});'];
};

/** The button that calls the method of the hook with the options, e.g. `toast.show({ … })`. */
const triggerSnippetOf = (
	name: string,
	subpath: string,
	properties: readonly string[],
	trigger: HookTrigger,
): string => {
	// `useToast` → `toast`.
	const variable: string = trigger.hook.replace(
		/^use(\w)/,
		(_match: string, letter: string): string => letter.toLowerCase(),
	);

	const source: string = `'@midnight-indigo/ui/${subpath}'`;
	const call: string[] = callLines(`${variable}.${trigger.method}`, properties, 4);

	return [
		"'use client';",
		"import { Button } from '@midnight-indigo/ui/buttons';",
		`import { ${trigger.hook} } from ${source};`,
		`import type { ${trigger.api} } from ${source};`,
		"import type { ReactElement } from 'react';",
		'',
		`export const ${name}Example = (): ReactElement => {`,
		`\tconst ${variable}: ${trigger.api} = ${trigger.hook}();`,
		'',
		'\treturn (',
		'\t\t<Button',
		'\t\t\tonClick={(): void => {',
		...call.map((line: string): string => `\t\t\t\t${line}`),
		'\t\t\t}}',
		'\t\t>',
		`\t\t\t${childOf(trigger.label)}`,
		'\t\t</Button>',
		'\t);',
		'};',
	].join('\n');
};

export const snippetOf = ({
	name,
	subpath,
	props,
	values,
	slots = {},
	opener,
	trigger,
}: SnippetSource): string => {
	const controlled: ReadonlySet<string> = new Set(
		props.map((prop: ComponentProp): string => prop.name),
	);

	const shown: ComponentProp[] = props.filter((prop: ComponentProp): boolean => {
		return !isDefault(prop, values[prop.name]);
	});

	if (trigger !== undefined) {
		const shownNames: ReadonlySet<string> = new Set(
			shown.map((prop: ComponentProp): string => prop.name),
		);

		const properties: string[] = Object.entries(values)
			.filter(([prop]: [string, PlaygroundValue]): boolean => {
				return !controlled.has(prop) || shownNames.has(prop);
			})
			.map(([prop, value]: [string, PlaygroundValue]): string => propertyOf(prop, value));

		return triggerSnippetOf(name, subpath, properties, trigger);
	}

	const fixedAttributes: string[] = Object.entries(values)
		.filter(
			([prop]: [string, PlaygroundValue]): boolean => !controlled.has(prop) && prop !== 'children',
		)
		.map(([prop, value]: [string, PlaygroundValue]): string => attributeOf(prop, value));

	const shownAttributes: string[] = shown
		.filter((prop: ComponentProp): boolean => prop.name !== 'children')
		.map((prop: ComponentProp): string => attributeOf(prop.name, values[prop.name] ?? ''));

	const slotAttributes: string[] = Object.entries(slots)
		.filter(([prop]: [string, SampleCode]): boolean => prop !== 'children')
		.map(([prop, sample]: [string, SampleCode]): string => `${prop}={${sample.code}}`);

	const textChild: PlaygroundValue | undefined =
		shown.some((prop: ComponentProp): boolean => prop.name === 'children') ||
		(!controlled.has('children') && values.children !== undefined)
			? values.children
			: undefined;

	const children: string[] | undefined =
		slots.children === undefined
			? textChild === undefined
				? undefined
				: [childOf(textChild)]
			: slots.children.code.split('\n');

	const element: string[] = elementLines(
		name,
		[...fixedAttributes, ...shownAttributes, ...slotAttributes, ...overlayAttributesOf(opener)],
		children,
	);

	const header: string[] = [
		...(opener === undefined ? [] : ["'use client';"]),
		...importLines(name, subpath, slots, opener),
		...(opener === undefined ? [] : ["import { useState } from 'react';"]),
		"import type { ReactElement } from 'react';",
		'',
		...declarationLines(slots),
	];

	return [...header, ...bodyLines(name, element, opener)].join('\n');
};
