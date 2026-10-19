// The code of what the playground shows: a component with the props the reader chose, as a TypeScript module that
// compiles as is (a test type-checks the snippets of every component). Props left at their default are left out.
import type { PlaygroundValue } from '#src/explorer/catalog.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';

export interface SnippetSource {
	name: string;
	subpath: string;
	/** The props shown, with the API of each one. */
	props: readonly ComponentProp[];
	values: Readonly<Record<string, PlaygroundValue>>;
}

const lineLimit: number = 100;

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

const elementLines = (
	name: string,
	attributes: readonly string[],
	children: string | undefined,
): string[] => {
	const opening: string = [name, ...attributes].join(' ');

	const singleLine: string =
		children === undefined ? `<${opening} />` : `<${opening}>${children}</${name}>`;

	if (singleLine.length + 'return ;'.length + 2 <= lineLimit) return [singleLine];
	const attributeLines: string[] = attributes.map((attribute: string): string => `\t${attribute}`);
	if (children === undefined) return [`<${name}`, ...attributeLines, '/>'];
	return [`<${name}`, ...attributeLines, '>', `\t${children}`, `</${name}>`];
};

export const snippetOf = ({ name, subpath, props, values }: SnippetSource): string => {
	const shown: ComponentProp[] = props.filter((prop: ComponentProp): boolean => {
		return !isDefault(prop, values[prop.name]);
	});

	const attributes: string[] = shown
		.filter((prop: ComponentProp): boolean => prop.name !== 'children')
		.map((prop: ComponentProp): string => attributeOf(prop.name, values[prop.name] ?? ''));

	const children: PlaygroundValue | undefined = shown.some((prop: ComponentProp): boolean => {
		return prop.name === 'children';
	})
		? values.children
		: undefined;

	const element: string[] = elementLines(
		name,
		attributes,
		children === undefined ? undefined : childOf(children),
	);

	const header: string[] = [
		`import { ${name} } from '@midnight-indigo/ui/${subpath}';`,
		"import type { ReactElement } from 'react';",
		'',
	];

	const signature: string = `export const ${name}Example = (): ReactElement =>`;

	const body: string[] =
		element.length === 1
			? [`${signature} {`, `\treturn ${element.join('')};`, '};']
			: [
					`${signature} {`,
					'\treturn (',
					...element.map((line: string): string => `\t\t${line}`),
					'\t);',
					'};',
				];

	return [...header, ...body].join('\n');
};
