// Page of a component in the explorer (Server Component, built once per component and locale): what it is for, its
// import, every variant and state, a playground, realistic examples with their code, its props (and the fields of the
// types it takes) and its accessibility. Each subpath serves its pages from a route of its own,
// `app/[locale]/components/<segment>/[component]/page.tsx` (`forms-date-pickers` for `forms/date-pickers`), made by
// `createComponentRoute` with the bindings of that subpath alone: Next loads every client module a route reaches, so
// one route for every component would make each page load the client code of every subpath. The proxy serves the
// public path `/[locale]/components/<slug>` from it (`explorer/routes.ts`).
import { CodeBlock, highlightCode } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import { PageHeader } from '@midnight-indigo/ui/dashboard';
import { TableOfContents } from '@midnight-indigo/ui/navigation';
import type { TableOfContentsItem } from '@midnight-indigo/ui/navigation';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { TFunction } from 'i18next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';

import type { ExampleComponent, PageBinding, RouteBindings } from '#src/explorer/bindings.ts';
import {
	camelCaseOf,
	controlledNameOf,
	documentedNamesOf,
	exampleFileOf,
	explorerComponents,
	findComponent,
	kebabCaseOf,
	slugOf,
} from '#src/explorer/catalog.ts';
import type { ExplorerComponent, ExplorerSubpath } from '#src/explorer/catalog.ts';
import { propsOf } from '#src/explorer/component-api.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import {
	ApiTable,
	DocumentationText,
	Example,
	VariantGrid,
} from '#src/explorer/component-sections.tsx';
import { readExampleCode } from '#src/explorer/example-source.ts';
import type { PlaygroundSlot } from '#src/explorer/playground.tsx';
import { sampleCodes } from '#src/explorer/sample-code.ts';
import type { SampleName } from '#src/explorer/sample-code.ts';
import type { SampleValue } from '#src/explorer/samples.tsx';
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

/** What the route of a subpath exports, besides `dynamicParams`, which Next only reads as a literal of the page. */
export interface ComponentRoute {
	generateStaticParams: () => { component: string }[];
	generateMetadata: (props: ComponentPageProps) => Promise<Metadata>;
	ComponentPage: (props: ComponentPageProps) => Promise<ReactElement>;
}

/** The component of the page, if its subpath is the one of the route. */
const componentOf = async (
	{ params }: ComponentPageProps,
	subpath: ExplorerSubpath,
): Promise<ExplorerComponent> => {
	const { component }: { component: string } = await params;
	const found: ExplorerComponent | undefined = findComponent(component);
	return found?.subpath === subpath ? found : notFound();
};

const messageKeyOf = (component: ExplorerComponent): string => {
	return `explorer.components.${camelCaseOf(component.name)}`;
};

const propsNamed = (props: readonly ComponentProp[], names: readonly string[]): ComponentProp[] => {
	return names.flatMap((name: string): ComponentProp[] => {
		return props.filter((prop: ComponentProp): boolean => prop.name === name);
	});
};

/** The samples of the props that take an element, rendered here and passed to the playground with their code. */
const slotsOf = (
	component: ExplorerComponent,
	samples: RouteBindings['samples'],
): Record<string, PlaygroundSlot> => {
	return Object.fromEntries(
		Object.entries(component.slots).flatMap(
			([prop, sample]: [string, SampleName]): [string, PlaygroundSlot][] => {
				const element: SampleValue | undefined = samples[sample];
				return element === undefined ? [] : [[prop, { element, code: sampleCodes[sample] }]];
			},
		),
	);
};

const elementsOf = (
	slots: Readonly<Record<string, PlaygroundSlot>>,
): Record<string, SampleValue> => {
	return Object.fromEntries(
		Object.entries(slots).map(([prop, slot]: [string, PlaygroundSlot]): [string, SampleValue] => {
			return [prop, slot.element];
		}),
	);
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

const renderComponentPage = async (
	props: ComponentPageProps,
	subpath: ExplorerSubpath,
	bindings: RouteBindings,
): Promise<ReactElement> => {
	const locale: LocaleSegment = await localeOf(props);
	const translate: TFunction = await getTranslator(locale);
	const component: ExplorerComponent = await componentOf(props, subpath);
	const binding: PageBinding = bindings.components[component.name] ?? notFound();
	const key: string = messageKeyOf(component);
	const api: ComponentProp[] = propsOf(component.name, locale);
	const documentedNames: string[] = documentedNamesOf(component);
	const slots: Record<string, PlaygroundSlot> = slotsOf(component, bindings.samples);
	const variants: ComponentProp[] = propsNamed(api, component.variants);
	const hasVariants: boolean = variants.length > 0 || component.states.length > 0;

	const types: readonly string[] = component.types ?? [];
	const source: string = `'@midnight-indigo/ui/${component.subpath}'`;

	const importedNames: string[] =
		component.trigger === undefined
			? documentedNames
			: [...documentedNames, component.trigger.hook];

	const importCode: HighlightedCode = await highlightCode(
		[
			`import { ${importedNames.join(', ')} } from ${source};`,
			...(types.length === 0 ? [] : [`import type { ${types.join(', ')} } from ${source};`]),
		].join('\n'),
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
		...(hasVariants ? [{ id: 'variants', label: translate('explorer.page.variants') }] : []),
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
		...[...component.parts, ...types].map((name: string): TableOfContentsItem => {
			return { id: `api-${kebabCaseOf(name)}`, label: name, level: 2 };
		}),
		{ id: 'accessibility', label: translate('explorer.page.accessibility') },
	];

	const Playground: RouteBindings['playground'] = bindings.playground;

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

				{hasVariants ? (
					<Section id='variants' title={translate('explorer.page.variants')}>
						<VariantGrid
							component={binding.component}
							baseProps={component.baseProps}
							slots={elementsOf(slots)}
							sampleWidth={component.sampleWidth}
							variants={variants}
							states={component.states}
							translate={translate}
						/>
					</Section>
				) : null}

				<Section id='playground' title={translate('explorer.page.playground')}>
					<Playground
						name={component.name}
						subpath={component.subpath}
						baseProps={component.baseProps}
						controls={propsNamed(propsOf(controlledNameOf(component), locale), component.controls)}
						slots={slots}
						sampleWidth={component.sampleWidth}
						opener={component.opener}
						trigger={component.trigger}
					/>
				</Section>

				<Section id='examples' title={translate('explorer.page.examples')}>
					{examples.map((example: LoadedExample): ReactElement | null => {
						const Preview: ExampleComponent | undefined = binding.examples[example.id];
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

					{component.parts.map((part: string): ReactElement => {
						return (
							<section key={part} className='api-part' aria-labelledby={`api-${kebabCaseOf(part)}`}>
								<h3 id={`api-${kebabCaseOf(part)}`} style={themeVariables.typography.headingSmall}>
									{part}
								</h3>

								<p>
									<DocumentationText text={translate(`${key}.parts.${camelCaseOf(part)}`)} />
								</p>

								<ApiTable name={part} props={propsOf(part, locale)} translate={translate} />
							</section>
						);
					})}

					{types.map((type: string): ReactElement => {
						return (
							<section key={type} className='api-part' aria-labelledby={`api-${kebabCaseOf(type)}`}>
								<h3 id={`api-${kebabCaseOf(type)}`} style={themeVariables.typography.headingSmall}>
									{type}
								</h3>

								<p>
									<DocumentationText text={translate(`${key}.types.${camelCaseOf(type)}`)} />
								</p>

								<ApiTable name={type} props={propsOf(type, locale)} fields translate={translate} />
							</section>
						);
					})}
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

/** The pages of the components of a subpath, which render only what its bindings give. */
export const createComponentRoute = (
	subpath: ExplorerSubpath,
	bindings: RouteBindings,
): ComponentRoute => {
	return {
		generateStaticParams: (): { component: string }[] => {
			return explorerComponents
				.filter((component: ExplorerComponent): boolean => component.subpath === subpath)
				.map((component: ExplorerComponent): { component: string } => {
					return { component: slugOf(component) };
				});
		},
		generateMetadata: async (props: ComponentPageProps): Promise<Metadata> => {
			const translate: TFunction = await getTranslator(await localeOf(props));
			const component: ExplorerComponent = await componentOf(props, subpath);
			return {
				title: component.name,
				description: translate(`${messageKeyOf(component)}.summary`),
			};
		},
		ComponentPage: async (props: ComponentPageProps): Promise<ReactElement> => {
			return await renderComponentPage(props, subpath, bindings);
		},
	};
};
