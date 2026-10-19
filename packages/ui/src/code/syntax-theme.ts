// Colors of the syntax, as TextMate scopes mapped to tokens of the theme. Every color is a `var(--mi-*)` reference, so
// highlighted code follows the active palette, and each is audited for 4.5:1 on the code block (`auditContrast`).
import { themeVariables } from '#src/theme/theme-variables.ts';

const { text, support }: typeof themeVariables = themeVariables;

/** A rule of a TextMate theme: the scopes it colors and how. */
export interface SyntaxRule {
	scope?: readonly string[];
	settings: { foreground?: string; fontStyle?: string };
}

/** Role of each color of the syntax, with the support color that draws it. */
export const syntaxColors = {
	plain: text.primary,
	comment: text.muted,
	punctuation: text.secondary,
	keyword: support.violet.text,
	string: support.green.text,
	literal: support.amber.text,
	function: support.blue.text,
	type: support.turquoise.text,
	tag: support.pink.text,
	attribute: support.orange.text,
	invalid: support.red.text,
} as const;

export const syntaxRules: readonly SyntaxRule[] = [
	{ settings: { foreground: syntaxColors.plain } },
	{
		scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
		settings: { foreground: syntaxColors.comment, fontStyle: 'italic' },
	},
	{
		scope: ['punctuation', 'meta.brace', 'keyword.operator', 'meta.embedded.expression'],
		settings: { foreground: syntaxColors.punctuation },
	},
	{
		scope: [
			'keyword',
			'storage',
			'storage.type',
			'storage.modifier',
			'keyword.operator.new',
			'keyword.operator.expression',
			'keyword.operator.word',
			'keyword.control',
			'variable.language',
		],
		settings: { foreground: syntaxColors.keyword },
	},
	{
		scope: [
			'string',
			'string.quoted',
			'string.template',
			'punctuation.definition.string',
			'markup.inline.raw',
			'markup.inserted',
		],
		settings: { foreground: syntaxColors.string },
	},
	{
		scope: [
			'constant.numeric',
			'constant.language',
			'constant.character',
			'keyword.other.unit',
			'support.constant.property-value',
			'support.constant',
		],
		settings: { foreground: syntaxColors.literal },
	},
	{
		scope: [
			'entity.name.function',
			'support.function',
			'meta.function-call entity.name.function',
			'support.type.property-name',
			'markup.underline.link',
		],
		settings: { foreground: syntaxColors.function },
	},
	{
		scope: [
			'entity.name.type',
			'entity.name.class',
			'entity.other.inherited-class',
			'support.type',
			'support.class',
			'entity.name.namespace',
		],
		settings: { foreground: syntaxColors.type },
	},
	{
		scope: ['entity.name.tag', 'support.class.component', 'markup.heading'],
		settings: { foreground: syntaxColors.tag },
	},
	{
		scope: ['entity.other.attribute-name'],
		settings: { foreground: syntaxColors.attribute },
	},
	{
		scope: ['invalid', 'string.regexp', 'markup.deleted'],
		settings: { foreground: syntaxColors.invalid },
	},
	{ scope: ['markup.heading', 'markup.bold'], settings: { fontStyle: 'bold' } },
	{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
];
