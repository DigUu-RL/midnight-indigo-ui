// Code the icon browser offers to copy: the icon data inlined (tree-shakable, in any component), or the icon by name
// from its set registered on the server.
import type { IconifyIconData } from '@midnight-indigo/ui/icons';

import type { IconSetEntry } from '@/src/icons/icon-sets';

const toCamelCase = (text: string): string => {
	return text
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((word: string, index: number): string => {
			return index === 0 ? word.toLowerCase() : `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
		})
		.join('');
};

/** `arrow-left` of `tabler` becomes `arrowLeftIcon`; a name that starts with a digit keeps the set in front. */
export const variableNameOf = (prefix: string, name: string): string => {
	const base: string = toCamelCase(name);
	return /^[0-9]/.test(base) ? `${toCamelCase(prefix)}${base}Icon` : `${base}Icon`;
};

const dataLiteralOf = (data: IconifyIconData): string => {
	const fields: string[] = [
		`width: ${String(data.width ?? 16)}`,
		`height: ${String(data.height ?? 16)}`,
		...(data.left === undefined || data.left === 0 ? [] : [`left: ${String(data.left)}`]),
		...(data.top === undefined || data.top === 0 ? [] : [`top: ${String(data.top)}`]),
		...(data.rotate === undefined || data.rotate === 0 ? [] : [`rotate: ${String(data.rotate)}`]),
		...(data.hFlip === true ? ['hFlip: true'] : []),
		...(data.vFlip === true ? ['vFlip: true'] : []),
		`body: ${JSON.stringify(data.body)}`,
	];

	return `{\n${fields.map((field: string): string => `\t${field},`).join('\n')}\n}`;
};

export const dataSnippetOf = (set: IconSetEntry, name: string, data: IconifyIconData): string => {
	const variable: string = variableNameOf(set.prefix, name);

	return [
		"import { IconifyIcon } from '@midnight-indigo/ui/icons';",
		"import type { IconifyIconData } from '@midnight-indigo/ui/icons';",
		'',
		`// ${set.prefix}:${name}, ${set.name} by ${set.author} (${set.license})`,
		`export const ${variable}: IconifyIconData = ${dataLiteralOf(data)};`,
		'',
		`<IconifyIcon icon={${variable}} decorative />`,
		'',
	].join('\n');
};

export const nameSnippetOf = (set: IconSetEntry, name: string): string => {
	return [
		"import { icons } from '@iconify-json/" + set.prefix + "';",
		"import { IconifyIcon, registerIconCollection } from '@midnight-indigo/ui/icons';",
		'',
		'// In a module of the server, once:',
		'registerIconCollection(icons);',
		'',
		`<IconifyIcon icon='${set.prefix}:${name}' decorative />`,
		'',
	].join('\n');
};
