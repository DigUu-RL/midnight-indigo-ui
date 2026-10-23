// The props of each component of the explorer, generated from the types of the library into `component-api.json`
// (`node scripts/generate-explorer-api.ts`; a test fails when it is stale). The descriptions are the TSDoc of the
// library, in English; `prop-descriptions.pt-br.json` translates each one and keeps the English text it translates, so
// a test finds the translations a change of the TSDoc made stale.
import type { LocaleSegment } from '@/src/i18n/locales';
import componentApi from '@/src/explorer/component-api.json' with { type: 'json' };
import brazilianPortugueseDescriptions from '@/src/explorer/prop-descriptions.pt-br.json' with { type: 'json' };

/** How the playground edits a prop: a choice, a switch, a text or a number; `other` props have no control. */
export type PropKind = 'enum' | 'boolean' | 'string' | 'number' | 'node' | 'other';

export interface ComponentProp {
	name: string;
	/** The type as the library declares it, without `undefined`. */
	type: string;
	required: boolean;
	/** Code of the default value, from `Defaults to …` in the TSDoc, e.g. `'medium'`. */
	defaultValue: string | null;
	/** The TSDoc of the library; empty for an attribute of the native element. */
	description: string;
	/** An attribute of the native element, which the component passes on. */
	native: boolean;
	kind: PropKind;
	/** Values of an `enum` prop. */
	options: string[];
}

export type ComponentApi = Readonly<Record<string, readonly ComponentProp[]>>;

export interface PropTranslation {
	/** The English description translated, to find the translations made stale by a change of the TSDoc. */
	source: string;
	translation: string;
}

export type PropTranslations = Readonly<Record<string, Readonly<Record<string, PropTranslation>>>>;

export const generatedApi: ComponentApi = componentApi as ComponentApi;

export const propTranslations: PropTranslations = brazilianPortugueseDescriptions;

/** The props of a component, described in the language of the page. */
export const propsOf = (name: string, locale: LocaleSegment): ComponentProp[] => {
	const props: readonly ComponentProp[] = generatedApi[name] ?? [];
	if (locale === 'en-us') return [...props];

	return props.map((prop: ComponentProp): ComponentProp => {
		const translation: PropTranslation | undefined = propTranslations[name]?.[prop.name];
		return translation?.source === prop.description
			? { ...prop, description: translation.translation }
			: prop;
	});
};
