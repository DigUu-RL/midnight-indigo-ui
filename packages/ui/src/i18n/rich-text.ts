// Formatting inside translations: `<strong>`, `<em>`, links and the tags of the application, rendered as React
// elements. The text is parsed, never given to the browser as HTML: there is no `dangerouslySetInnerHTML`, attributes
// written in a translation are ignored, and a malformed message is shown as text. Pure functions, so they run in Server
// Components as well as in the browser.
import { createElement, Fragment } from 'react';
import type { ReactNode } from 'react';
import type { TFunction, TOptions } from 'i18next';

/** Renders a tag of the application from what the translation wraps in it; `children` is empty for `<tag/>`. */
export type RichTag = (children: ReactNode) => ReactNode;

/** Tags of the application by name, e.g. `{ link: (children) => <Link href='/orders'>{children}</Link> }`. */
export type RichTags = Readonly<Record<string, RichTag>>;

/** Interpolation values and i18next options (`count`, `context`, ...) of a rich message. */
export type RichValues = TOptions;

export type RichTextProblem = 'unknownTag' | 'unexpectedClosingTag' | 'unclosedTag';

/** Called once per message and problem; a malformed part is rendered as text. */
export type MalformedMessageHandler = (
	message: string,
	problem: RichTextProblem,
	tag: string,
) => void;

export interface RichTextOptions {
	/** Tags of the application, added to the default ones (and replacing those of the same name). */
	tags?: RichTags | undefined;
	/** Defaults to `console.warn` outside production; pass `() => {}` to silence it. */
	onMalformedMessage?: MalformedMessageHandler | undefined;
}

export interface RichTranslatorOptions {
	/** Defaults to `console.warn` outside production; pass `() => {}` to silence it. */
	onMalformedMessage?: MalformedMessageHandler | undefined;
}

export interface RichTranslator {
	/** Translates `key` and renders its tags; interpolated values are always text, never tags. */
	rich: (key: string | readonly string[], values?: RichValues, tags?: RichTags) => ReactNode;
	/** Translates `key` without its tags, for `aria-label`, `title`, a toast or an announcement. */
	plain: (key: string | readonly string[], values?: RichValues) => string;
}

/** Tags every message can use without configuration; the `UiProvider` baseline styles them with the theme tokens. */
export const defaultRichTags: readonly string[] = [
	'strong',
	'b',
	'em',
	'i',
	'u',
	's',
	'code',
	'kbd',
	'mark',
	'small',
	'sub',
	'sup',
	'br',
];

// Tags that wrap nothing: `<br>` and `<br/>` are the same.
const voidTags: readonly string[] = ['br'];

interface RichElement {
	name: string;
	children: RichNode[];
}

type RichNode = string | RichElement;

interface OpenTag extends RichElement {
	source: string;
}

// `<name>`, `<name attribute="...">`, `</name>` and `<name/>`. A `<` not followed by a letter is text.
const tagPattern: RegExp = /<(\/?)([A-Za-z][\dA-Za-z-]*)(\s[^<>]*?)?(\/?)>/g;

// Interpolated values are replaced by `U+E000 index U+E001` (characters of the Private Use Area) before the tags are
// parsed and put back as text after, so a value such as `<em>x</em>` is never read as a tag.
const placeholderPattern: RegExp = /(\d+)/g;

const placeholderOf = (index: number): string => `${String(index)}`;

// Options of `t` that are not interpolation values, or that i18next reads before interpolating.
const optionNames: readonly string[] = [
	'context',
	'defaultValue',
	'fallbackLng',
	'joinArrays',
	'keyPrefix',
	'keySeparator',
	'lng',
	'lngs',
	'ns',
	'nsSeparator',
	'postProcess',
];

const isProduction = (): boolean => {
	return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
};

const warnInDevelopment: MalformedMessageHandler = (
	message: string,
	problem: RichTextProblem,
	tag: string,
): void => {
	if (isProduction()) return;

	const descriptions: Record<RichTextProblem, string> = {
		unknownTag: `unknown tag <${tag}>`,
		unexpectedClosingTag: `closing tag </${tag}> without a matching opening tag`,
		unclosedTag: `tag <${tag}> is never closed`,
	};

	console.warn(
		`[Midnight Indigo: UI] Malformed rich message, ${descriptions[problem]}; it is rendered as text: "${message}"`,
	);
};

const appendText = (children: RichNode[], text: string): void => {
	if (text === '') return;

	const last: RichNode | undefined = children.at(-1);

	if (typeof last === 'string') {
		children[children.length - 1] = last + text;
		return;
	}

	children.push(text);
};

const appendNodes = (children: RichNode[], nodes: readonly RichNode[]): void => {
	nodes.forEach((node: RichNode): void => {
		if (typeof node === 'string') {
			appendText(children, node);
			return;
		}

		children.push(node);
	});
};

/** Parses the tags of `message`; an unknown, unexpected or unclosed tag stays in the text. */
const parseRichText = (
	message: string,
	isKnownTag: (name: string) => boolean,
	report: (problem: RichTextProblem, tag: string) => void,
): RichNode[] => {
	const root: OpenTag = { name: '', source: '', children: [] };
	const stack: OpenTag[] = [root];
	let position: number = 0;

	const current = (): OpenTag => stack.at(-1) ?? root;

	for (const match of message.matchAll(tagPattern)) {
		const [source, slash, name = '', , selfClosing]: RegExpExecArray = match;
		appendText(current().children, message.slice(position, match.index));
		position = match.index + source.length;

		if (!isKnownTag(name)) {
			report('unknownTag', name);
			appendText(current().children, source);
			continue;
		}

		if (slash === '/') {
			if (current().name !== name || stack.length === 1) {
				report('unexpectedClosingTag', name);
				appendText(current().children, source);
				continue;
			}

			const closed: OpenTag | undefined = stack.pop();
			current().children.push({ name, children: closed?.children ?? [] });
			continue;
		}

		if (selfClosing === '/' || voidTags.includes(name)) {
			current().children.push({ name, children: [] });
			continue;
		}

		stack.push({ name, source, children: [] });
	}

	appendText(current().children, message.slice(position));

	// Tags still open: their opening tag becomes text again, followed by what they wrapped.
	while (stack.length > 1) {
		const unclosed: OpenTag | undefined = stack.pop();
		if (unclosed === undefined) break;

		report('unclosedTag', unclosed.name);
		appendText(current().children, unclosed.source);
		appendNodes(current().children, unclosed.children);
	}

	return root.children;
};

const createReporter = (
	message: string,
	onMalformedMessage: MalformedMessageHandler,
): ((problem: RichTextProblem, tag: string) => void) => {
	const reported: Set<string> = new Set<string>();

	return (problem: RichTextProblem, tag: string): void => {
		const reportKey: string = `${problem}|${tag}`;
		if (reported.has(reportKey)) return;

		reported.add(reportKey);
		onMalformedMessage(message, problem, tag);
	};
};

const restoreValues = (text: string, values: readonly string[]): string => {
	return text.replaceAll(placeholderPattern, (placeholder: string, index: string): string => {
		return values[Number(index)] ?? placeholder;
	});
};

// Children are given to `createElement` as arguments, so React needs no keys for them.
const toReactNode = (nodes: readonly ReactNode[]): ReactNode => {
	return nodes.length === 1 ? nodes[0] : createElement(Fragment, null, ...nodes);
};

const renderNodes = (
	nodes: readonly RichNode[],
	tags: RichTags,
	values: readonly string[],
): ReactNode[] => {
	return nodes.map((node: RichNode): ReactNode => {
		if (typeof node === 'string') return restoreValues(node, values);

		const children: ReactNode[] = renderNodes(node.children, tags, values);

		const customTag: RichTag | undefined = Object.hasOwn(tags, node.name)
			? tags[node.name]
			: undefined;

		if (customTag !== undefined) {
			return createElement(
				Fragment,
				null,
				customTag(children.length === 0 ? null : toReactNode(children)),
			);
		}

		return createElement(node.name, null, ...children);
	});
};

const plainNodes = (nodes: readonly RichNode[]): string => {
	return nodes
		.map((node: RichNode): string => {
			if (typeof node === 'string') return node;
			return voidTags.includes(node.name) ? ' ' : plainNodes(node.children);
		})
		.join('');
};

const knownTagsOf = (tags: RichTags): ((name: string) => boolean) => {
	return (name: string): boolean => defaultRichTags.includes(name) || Object.hasOwn(tags, name);
};

const renderWithValues = (
	message: string,
	values: readonly string[],
	{ tags = {}, onMalformedMessage = warnInDevelopment }: RichTextOptions,
): ReactNode => {
	const nodes: RichNode[] = parseRichText(
		message,
		knownTagsOf(tags),
		createReporter(restoreValues(message, values), onMalformedMessage),
	);

	return toReactNode(renderNodes(nodes, tags, values));
};

const plainWithValues = (
	message: string,
	values: readonly string[],
	{ onMalformedMessage = warnInDevelopment }: RichTranslatorOptions,
): string => {
	const nodes: RichNode[] = parseRichText(
		message,
		(): boolean => true,
		createReporter(restoreValues(message, values), onMalformedMessage),
	);

	return restoreValues(plainNodes(nodes), values);
};

/**
 * Renders the tags of a text that is already translated and interpolated. Prefer `rich` of `createRichTranslator`
 * (or of `useI18n`) for translations with values: here the whole text is parsed, values included.
 */
export const renderRichText = (message: string, options: RichTextOptions = {}): ReactNode => {
	return renderWithValues(message, [], options);
};

/**
 * The text of a message without its tags: well-formed tags are removed (every name, the default ones and those of
 * the application), `<br>` becomes a space, and a malformed part stays as text, as `renderRichText` shows it.
 */
export const toPlainText = (message: string, options: RichTranslatorOptions = {}): string => {
	return plainWithValues(message, [], options);
};

// Replaces the string values by placeholders, in the options of `t` and in its `replace` option.
const protectValues = (values: RichValues): { options: RichValues; texts: string[] } => {
	const texts: string[] = [];

	const protect = (
		entries: Readonly<Record<string, unknown>>,
		isTopLevel: boolean,
	): Record<string, unknown> => {
		return Object.fromEntries(
			Object.entries(entries).map(([name, value]: [string, unknown]): [string, unknown] => {
				const isOption: boolean = isTopLevel && optionNames.includes(name);
				if (typeof value !== 'string' || isOption) return [name, value];

				texts.push(value);
				return [name, placeholderOf(texts.length - 1)];
			}),
		);
	};

	const options: RichValues = protect(values, true);
	const replace: unknown = values.replace;

	return {
		options:
			typeof replace === 'object' && replace !== null
				? { ...options, replace: protect(replace as Readonly<Record<string, unknown>>, false) }
				: options,
		texts,
	};
};

/**
 * `rich` and `plain` over a `t` of i18next: `createRichTranslator(instance.t)` in a Server Component, or the `rich` and
 * `plain` of `useI18n` in a Client Component. Interpolation, plurals and contexts of i18next work as in `t`.
 */
export const createRichTranslator = (
	translate: TFunction,
	{ onMalformedMessage = warnInDevelopment }: RichTranslatorOptions = {},
): RichTranslator => {
	const translateKey = (key: string | readonly string[], options: RichValues): string => {
		return translate(typeof key === 'string' ? key : [...key], options);
	};

	return {
		rich: (
			key: string | readonly string[],
			values: RichValues = {},
			tags: RichTags = {},
		): ReactNode => {
			const { options, texts }: { options: RichValues; texts: string[] } = protectValues(values);
			return renderWithValues(translateKey(key, options), texts, { tags, onMalformedMessage });
		},
		plain: (key: string | readonly string[], values: RichValues = {}): string => {
			const { options, texts }: { options: RichValues; texts: string[] } = protectValues(values);
			return plainWithValues(translateKey(key, options), texts, { onMalformedMessage });
		},
	};
};
