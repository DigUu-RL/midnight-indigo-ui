// The messages of the starter are JSON with the same keys in every locale, every plural category of each language, and
// the same well-formed tags of rich messages in every locale.
import { defaultRichTags, toPlainText } from '@midnight-indigo/ui/i18n';
import type { RichTextProblem } from '@midnight-indigo/ui/i18n';
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

/** Messages by path; a plural object gives one message per category, at `path.category`. */
const textsOf = (messages: Messages, prefix: string = ''): Map<string, string> => {
	return new Map<string, string>(
		Object.entries(messages).flatMap(
			([key, value]: [string, string | Messages]): [string, string][] => {
				const path: string = `${prefix}${key}`;
				return typeof value === 'string' ? [[path, value]] : [...textsOf(value, `${path}.`)];
			},
		),
	);
};

// The tags of the rich messages: `<strong>`, `</strong>`, `<br/>`.
const tagPattern: RegExp = /<\/?[A-Za-z][\dA-Za-z-]*(?:\s[^<>]*?)?\/?>/g;

// `<link>` is the tag the starter renders as a link; the others are the defaults of the library.
const allowedTags: readonly string[] = [...defaultRichTags, 'link'];

const tagsOf = (message: string): string[] => message.match(tagPattern) ?? [];

/** The plural category of a path is ignored: every category of a key uses the tags of English `other`. */
const keyOf = (path: string, english: Map<string, string>): string => {
	const category: string = path.slice(path.lastIndexOf('.') + 1);
	const parent: string = path.slice(0, path.lastIndexOf('.'));
	const isPlural: boolean = pluralCategories.includes(category) && english.has(`${parent}.other`);
	return isPlural ? `${parent}.other` : path;
};

test('every message is well formed and uses only the tags the starter renders', (): void => {
	locales.forEach(([locale, file]: [string, string]): void => {
		textsOf(readMessages(file)).forEach((message: string, path: string): void => {
			toPlainText(message, {
				onMalformedMessage: (_message: string, problem: RichTextProblem, tag: string): void => {
					assert.fail(`${locale} ${path}: ${problem} <${tag}>`);
				},
			});

			tagsOf(message).forEach((tag: string): void => {
				const name: string = tag.replaceAll(/[</>]|\s.*/g, '');
				assert.ok(allowedTags.includes(name), `${locale} ${path}: unknown tag ${tag}`);
			});
		});
	});
});

test('every locale uses the tags of English in each message', (): void => {
	const english: Map<string, string> = textsOf(readMessages('en-us.json'));

	locales.forEach(([locale, file]: [string, string]): void => {
		textsOf(readMessages(file)).forEach((message: string, path: string): void => {
			const englishMessage: string = english.get(keyOf(path, english)) ?? '';

			// Sorted: a language may put the formatted words in another order.
			assert.deepEqual(
				tagsOf(message).toSorted(),
				tagsOf(englishMessage).toSorted(),
				`${locale} ${path}`,
			);
		});
	});
});

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
