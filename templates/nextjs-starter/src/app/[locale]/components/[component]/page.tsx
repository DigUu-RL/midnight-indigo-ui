// Page of a component in the explorer (Server Component, built once per component and locale): what it is for, its
// import, every variant and state, a playground, realistic examples with their code, its props and its accessibility.
import { CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import { TableOfContents } from '@midnight-indigo/ui/navigation';
import type { TableOfContentsItem } from '@midnight-indigo/ui/navigation';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ComponentType, ReactElement, ReactNode } from 'react';

import { bindingOf } from '#src/explorer/bindings.tsx';
import type { PageBinding } from '#src/explorer/bindings.tsx';
import {
	camelCaseOf,
	exampleFileOf,
	explorerComponents,
	findComponent,
	kebabCaseOf,
	slugOf,
} from '#src/explorer/catalog.ts';
import type { ExplorerComponent } from '#src/explorer/catalog.ts';
import { propsOf } from '#src/explorer/component-api.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import {
	ApiTable,
	DocumentationText,
	Example,
	VariantGrid,
} from '#src/explorer/component-sections.tsx';
import { readExampleCode } from '#src/explorer/example-source.ts';
import type { LocaleSegment } from '#src/i18n/locales.ts';
import { getTranslator, localeOf } from '#src/i18n/server.ts';

interface ComponentPageProps {
	params: Promise<{ locale: string; component: string }>;
}

interface LoadedExample {
	id: string;
	headingId: string;
	file: string;
	code: HighlightedCode;
}

/** Any other component is a missing page. */
export const dynamicParams: boolean = false;

export const generateStaticParams = (): { component: string }[] => {
	return explorerComponents.map((component: ExplorerComponent): { component: string } => {
		return { component: slugOf(component) };
	});
};

const componentOf = async ({ params }: ComponentPageProps): Promise<ExplorerComponent> => {
	const { component }: { component: string } = await params;
	return findComponent(component) ?? notFound();
};

const messageKeyOf = (component: ExplorerComponent): string => {
	return `explorer.components.${camelCaseOf(component.name)}`;
};

export const generateMetadata = async (props: ComponentPageProps): Promise<Metadata> => {
	const translate: TFunction = await getTranslator(await localeOf(props));
	const component: ExplorerComponent = await componentOf(props);
	return { title: component.name, description: translate(`${messageKeyOf(component)}.summary`) };
};

const propsNamed = (props: readonly ComponentProp[], names: readonly string[]): ComponentProp[] => {
	return names.flatMap((name: string): ComponentProp[] => {
		return props.filter((prop: ComponentProp): boolean => prop.name === name);
	});
};

interface SectionProps {
	id: string;
	title: string;
	children: ReactNode;
}

const Section = ({ id, title, children }: SectionProps): ReactElement => {
	return (
		<section className='explorer-section' aria-labelledby={id}>
			<h2 id={id} style={themeVariables.typography.headingMedium}>
				{title}
			</h2>

			{children}
		</section>
	);
};

const ComponentPage = async (props: ComponentPageProps): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf(props);
	const translate: TFunction = await getTranslator(locale);
	const component: ExplorerComponent = await componentOf(props);
	const binding: PageBinding = bindingOf(component.name) ?? notFound();
	const key: string = messageKeyOf(component);
	const api: ComponentProp[] = propsOf(component.name, locale);

	const importCode: HighlightedCode = await highlightCode(
		`import { ${component.name} } from '@midnight-indigo/ui/${component.subpath}';`,
		'tsx',
	);

	const examples: LoadedExample[] = await Promise.all(
		component.examples.map(async (id: string): Promise<LoadedExample> => {
			const file: string = exampleFileOf(component, id);

			return {
				id,
				headingId: `example-${kebabCaseOf(id)}`,
				file,
				code: await readExampleCode(file),
			};
		}),
	);

	const contents: TableOfContentsItem[] = [
		{ id: 'usage', label: translate('explorer.page.usage') },
		{ id: 'variants', label: translate('explorer.page.variants') },
		{ id: 'playground', label: translate('explorer.page.playground') },
		{ id: 'examples', label: translate('explorer.page.examples') },
		...examples.map((example: LoadedExample): TableOfContentsItem => {
			return {
				id: example.headingId,
				label: translate(`${key}.examples.${example.id}.title`),
				level: 2,
			};
		}),
		{ id: 'api', label: translate('explorer.page.api') },
		{ id: 'accessibility', label: translate('explorer.page.accessibility') },
	];

	const Playground: PageBinding['playground'] = binding.playground;

	return (
		<div className='component-page'>
			<div className='component-page-content'>
				<PageHeader title={component.name} description={translate(`${key}.summary`)} />

				<p>
					<DocumentationText text={translate(`${key}.description`)} />
				</p>

				<Section id='usage' title={translate('explorer.page.usage')}>
					<CodeBlock code={importCode} />
				</Section>

				<Section id='variants' title={translate('explorer.page.variants')}>
					<VariantGrid
						component={binding.component}
						baseProps={component.baseProps}
						variants={propsNamed(api, component.variants)}
						states={component.states}
						translate={translate}
					/>
				</Section>

				<Section id='playground' title={translate('explorer.page.playground')}>
					<Playground
						name={component.name}
						subpath={component.subpath}
						baseProps={component.baseProps}
						controls={propsNamed(api, component.controls)}
					/>
				</Section>

				<Section id='examples' title={translate('explorer.page.examples')}>
					{examples.map((example: LoadedExample): ReactElement | null => {
						const Preview: ComponentType | undefined = binding.examples[example.id];
						if (Preview === undefined) return null;

						return (
							<Example
								key={example.id}
								headingId={example.headingId}
								title={translate(`${key}.examples.${example.id}.title`)}
								description={translate(`${key}.examples.${example.id}.description`)}
								preview={<Preview />}
								code={example.code}
								fileName={example.file.slice(example.file.lastIndexOf('/') + 1)}
								translate={translate}
							/>
						);
					})}
				</Section>

				<Section id='api' title={translate('explorer.page.api')}>
					<ApiTable name={component.name} props={api} translate={translate} />
				</Section>

				<Section id='accessibility' title={translate('explorer.page.accessibility')}>
					<ul className='accessibility-notes'>
						{component.accessibility.map((note: string): ReactElement => {
							return (
								<li key={note}>
									<DocumentationText text={translate(`${key}.accessibility.${note}`)} />
								</li>
							);
						})}
					</ul>
				</Section>
			</div>

			<TableOfContents className='component-page-contents' items={contents} />
		</div>
	);
};

export default ComponentPage;
