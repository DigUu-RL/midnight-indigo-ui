// The messages of the starter are JSON with the same keys in every locale, and every plural category of each language.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

interface Messages {
	readonly [key: string]: string | Messages;
}

const locales: readonly [string, string][] = [
	['en-US', 'en-us.json'],
	['pt-BR', 'pt-br.json'],
];

const pluralCategories: readonly string[] = ['zero', 'one', 'two', 'few', 'many', 'other'];
const camelCase: RegExp = /^[a-z][\dA-Za-z]*$/;

const readMessages = (file: string): Messages => {
	return JSON.parse(
		readFileSync(new URL(`../src/messages/${file}`, import.meta.url), 'utf8'),
	) as Messages;
};

const isPlural = (messages: Messages): boolean => {
	return Object.keys(messages).every((key: string): boolean => pluralCategories.includes(key));
};

/** Paths of the messages; a plural object is one path, with its categories. */
const pathsOf = (messages: Messages, prefix: string = ''): Map<string, string[]> => {
	const paths: Map<string, string[]> = new Map<string, string[]>();

	Object.entries(messages).forEach(([key, value]: [string, string | Messages]): void => {
		const path: string = `${prefix}${key}`;
		assert.match(key, camelCase, `${path} is not camelCase`);

		if (typeof value === 'string') {
			paths.set(path, []);
			return;
		}

		if (isPlural(value)) {
			paths.set(path, Object.keys(value));
			return;
		}

		pathsOf(value, `${path}.`).forEach((categories: string[], nested: string): void => {
			paths.set(nested, categories);
		});
	});

	return paths;
};

test('every locale has the keys of English, with the plural categories of its language', (): void => {
	const english: Map<string, string[]> = pathsOf(readMessages('en-us.json'));

	locales.forEach(([locale, file]: [string, string]): void => {
		const translated: Map<string, string[]> = pathsOf(readMessages(file));
		const required: string[] = new Intl.PluralRules(locale).resolvedOptions().pluralCategories;

		assert.deepEqual([...translated.keys()], [...english.keys()], locale);

		translated.forEach((categories: string[], path: string): void => {
			if ((english.get(path) ?? []).length === 0) return;

			required.forEach((category: string): void => {
				assert.ok(categories.includes(category), `${locale} ${path}.${category}`);
			});
		});
	});
});
