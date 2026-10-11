// Theme configuration: the typed input of `createUiTheme` and the validation of its JSON-serializable form.
import { isHexColor, officialMainColor, semanticIntents } from '../tokens/index.ts';
import type { IntentSource, SemanticIntent } from '../tokens/index.ts';

/** Configuration of one intent. Every field is optional: an omitted `main` falls back to the default color. */
export type IntentConfig = Partial<IntentSource>;

/** Palette configuration. An omitted intent keeps its default colors. */
export type PaletteConfig = Partial<Record<SemanticIntent, IntentConfig>>;

/** Input of `createUiTheme`. Plain data only, so the same shape can be stored as JSON. */
export interface UiThemeConfig {
	palette?: PaletteConfig;
}

export interface ThemeConfigIssue {
	/** Dotted location of the problem, e.g. `palette.official.main`. */
	path: string;
	message: string;
}

/** Thrown when a theme configuration is malformed; `issues` lists every problem found, not only the first. */
export class UiThemeConfigError extends Error {
	readonly issues: readonly ThemeConfigIssue[];

	constructor(issues: readonly ThemeConfigIssue[]) {
		const lines: string[] = issues.map((issue: ThemeConfigIssue): string => {
			return `  - ${issue.path}: ${issue.message}`;
		});

		super(['Invalid Midnight Indigo theme configuration:', ...lines].join('\n'));
		this.name = 'UiThemeConfigError';
		this.issues = issues;
	}
}

// A record, not an array, so the compiler fails when `IntentSource` gains a field that is not listed here.
const intentFieldPresence: Readonly<Record<keyof IntentSource, true>> = {
	main: true,
	light: true,
	dark: true,
	contrastText: true,
	container: true,
	onContainer: true,
	border: true,
	text: true,
	hover: true,
	pressed: true,
	containerHover: true,
	containerPressed: true,
};

const intentFields: readonly string[] = Object.keys(intentFieldPresence);
const configFields: readonly string[] = ['palette'];

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Only JSON types are printed: `JSON.stringify` cannot represent functions, symbols, bigints or `undefined`.
const jsonTypes: readonly string[] = ['string', 'number', 'boolean', 'object'];

const describeValue = (value: unknown): string => {
	return jsonTypes.includes(typeof value) ? JSON.stringify(value) : typeof value;
};

const listChoices = (choices: readonly string[]): string => choices.join(', ');

const validateIntent = (intent: string, value: unknown): ThemeConfigIssue[] => {
	const path: string = `palette.${intent}`;

	if (!isPlainObject(value)) {
		const message: string = `expected an object such as { "main": "${officialMainColor}" }, received ${describeValue(value)}.`;
		return [{ path, message }];
	}

	return Object.entries(value).flatMap(
		([field, fieldValue]: [string, unknown]): ThemeConfigIssue[] => {
			const fieldPath: string = `${path}.${field}`;

			if (!intentFields.includes(field)) {
				return [
					{
						path: fieldPath,
						message: `unknown field. Expected one of: ${listChoices(intentFields)}.`,
					},
				];
			}

			return typeof fieldValue === 'string' && isHexColor(fieldValue)
				? []
				: [
						{
							path: fieldPath,
							message: `invalid color ${describeValue(fieldValue)}: expected a hexadecimal color in the form #RRGGBB or #RGB.`,
						},
					];
		},
	);
};

const validatePalette = (value: unknown): ThemeConfigIssue[] => {
	if (!isPlainObject(value)) {
		return [{ path: 'palette', message: `expected an object, received ${describeValue(value)}.` }];
	}

	const intents: readonly string[] = semanticIntents;

	return Object.entries(value).flatMap(
		([intent, intentValue]: [string, unknown]): ThemeConfigIssue[] => {
			return intents.includes(intent)
				? validateIntent(intent, intentValue)
				: [
						{
							path: `palette.${intent}`,
							message: `unknown intent. Expected one of: ${listChoices(intents)}.`,
						},
					];
		},
	);
};

const validateConfig = (value: unknown): ThemeConfigIssue[] => {
	if (!isPlainObject(value)) {
		return [{ path: '(root)', message: `expected an object, received ${describeValue(value)}.` }];
	}

	return Object.entries(value).flatMap(
		([field, fieldValue]: [string, unknown]): ThemeConfigIssue[] => {
			if (!configFields.includes(field)) {
				return [
					{ path: field, message: `unknown field. Expected one of: ${listChoices(configFields)}.` },
				];
			}

			return validatePalette(fieldValue);
		},
	);
};

const parseJson = (text: string): unknown => {
	try {
		return JSON.parse(text);
	} catch (error: unknown) {
		const reason: string = error instanceof Error ? error.message : String(error);
		throw new UiThemeConfigError([{ path: '(root)', message: `malformed JSON: ${reason}` }]);
	}
};

/**
 * Validates a theme configuration, e.g. one loaded from a JSON file, and returns it typed. Accepts the parsed
 * value or the JSON text. Throws `UiThemeConfigError` listing every invalid color, unknown key or wrong type.
 */
export const parseUiThemeConfig = (value: unknown): UiThemeConfig => {
	const candidate: unknown = typeof value === 'string' ? parseJson(value) : value;
	const issues: ThemeConfigIssue[] = validateConfig(candidate);

	if (issues.length > 0) throw new UiThemeConfigError(issues);
	return candidate as UiThemeConfig;
};
