// The sections of the page of a component (Server Components): the grid of its variants and states, an example with
// its preview and its code, the table of its props and the text of a TSDoc with its code spans.
import { Code, CodeBlock } from '@midnight-indigo/ui/code';
import type { HighlightedCode } from '@midnight-indigo/ui/code';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@midnight-indigo/ui/data-display';
import { Tabs } from '@midnight-indigo/ui/navigation';
import { themeVariables } from '@midnight-indigo/ui/theme';
import type { TFunction } from 'i18next';
import { createElement, Fragment } from 'react';
import type { ComponentType, ReactElement, ReactNode } from 'react';

import type { AnyComponent } from '#src/explorer/bindings.tsx';
import type { PlaygroundValue, SampleWidth } from '#src/explorer/catalog.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';

type Values = Readonly<Record<string, PlaygroundValue>>;

/** The samples of the props that take an element, by prop. */
type Slots = Readonly<Record<string, ReactNode>>;

/** A text of the TSDoc: the spans between backticks are code. */
export const DocumentationText = ({ text }: { text: string }): ReactElement => {
	return (
		<>
			{text.split('`').map((part: string, index: number): ReactNode => {
				return index % 2 === 1 ? (
					<Code key={index}>{part}</Code>
				) : (
					<Fragment key={index}>{part}</Fragment>
				);
			})}
		</>
	);
};

interface SampleProps {
	component: AnyComponent;
	values: Values;
	slots: Slots;
	caption: string;
}

// The values come from the catalog and the generated API of this very component.
const Sample = ({ component, values, slots, caption }: SampleProps): ReactElement => {
	return (
		<li className='variant-sample'>
			{createElement(component as unknown as ComponentType<Slots>, { ...values, ...slots })}
			<Code>{caption}</Code>
		</li>
	);
};

interface VariantGridProps {
	component: AnyComponent;
	baseProps: Values;
	slots: Slots;
	sampleWidth: SampleWidth;
	/** Props with a union of values, each one in a row with every value. */
	variants: readonly ComponentProp[];
	/** Boolean props, in one row after the default. */
	states: readonly string[];
	translate: TFunction;
}

export const VariantGrid = ({
	component,
	baseProps,
	slots,
	sampleWidth,
	variants,
	states,
	translate,
}: VariantGridProps): ReactElement => {
	return (
		<div className='variant-grid'>
			{variants.map((prop: ComponentProp): ReactElement => {
				return (
					<figure key={prop.name} className='variant-row'>
						<figcaption>
							<Code>{prop.name}</Code>
						</figcaption>

						<ul className={`variant-samples variant-samples-${sampleWidth}`}>
							{prop.options.map((option: string): ReactElement => {
								return (
									<Sample
										key={option}
										component={component}
										slots={slots}
										values={{ ...baseProps, [prop.name]: option }}
										caption={option}
									/>
								);
							})}
						</ul>
					</figure>
				);
			})}

			{states.length === 0 ? null : (
				<figure className='variant-row'>
					<figcaption>{translate('explorer.page.states')}</figcaption>

					<ul className={`variant-samples variant-samples-${sampleWidth}`}>
						<Sample
							component={component}
							slots={slots}
							values={baseProps}
							caption={translate('explorer.page.default')}
						/>

						{states.map((state: string): ReactElement => {
							return (
								<Sample
									key={state}
									component={component}
									slots={slots}
									values={{ ...baseProps, [state]: true }}
									caption={state}
								/>
							);
						})}
					</ul>
				</figure>
			)}
		</div>
	);
};

interface ExampleProps {
	/** `id` of its heading, the target of the table of contents. */
	headingId: string;
	title: string;
	description: string;
	preview: ReactNode;
	code: HighlightedCode;
	fileName: string;
	translate: TFunction;
}

/** An example: its title, what it shows, and tabs with the example running and its code. */
export const Example = ({
	headingId,
	title,
	description,
	preview,
	code,
	fileName,
	translate,
}: ExampleProps): ReactElement => {
	return (
		<section className='example' aria-labelledby={headingId}>
			<h3 id={headingId} style={themeVariables.typography.headingSmall}>
				{title}
			</h3>

			<p>
				<DocumentationText text={description} />
			</p>

			<Tabs
				label={translate('explorer.page.exampleTabs', { title })}
				keepMounted
				items={[
					{
						id: 'preview',
						label: translate('explorer.page.preview'),
						content: <div className='example-stage'>{preview}</div>,
					},
					{
						id: 'code',
						label: translate('explorer.page.code'),
						content: <CodeBlock code={code} fileName={fileName} />,
					},
				]}
			/>
		</section>
	);
};

interface ApiTableProps {
	name: string;
	props: readonly ComponentProp[];
	translate: TFunction;
}

const DescriptionOf = ({
	prop,
	translate,
}: {
	prop: ComponentProp;
	translate: TFunction;
}): ReactNode => {
	if (prop.native) return translate('explorer.api.native');
	return prop.description === '' ? '—' : <DocumentationText text={prop.description} />;
};

export const ApiTable = ({ name, props, translate }: ApiTableProps): ReactElement => {
	return (
		<Table caption={translate('explorer.api.caption', { component: name })}>
			<TableHead>
				<TableRow>
					<TableHeaderCell scope='col'>{translate('explorer.api.prop')}</TableHeaderCell>
					<TableHeaderCell scope='col'>{translate('explorer.api.type')}</TableHeaderCell>
					<TableHeaderCell scope='col'>{translate('explorer.api.default')}</TableHeaderCell>
					<TableHeaderCell scope='col'>{translate('explorer.api.description')}</TableHeaderCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{props.map((prop: ComponentProp): ReactElement => {
					return (
						<TableRow key={prop.name}>
							<TableHeaderCell scope='row'>
								<Code className='api-token'>{prop.name}</Code>

								{prop.required ? (
									<span className='api-required'>{translate('explorer.api.required')}</span>
								) : null}
							</TableHeaderCell>

							<TableCell>
								<Code className='api-type'>{prop.type}</Code>
							</TableCell>

							<TableCell>
								{prop.defaultValue === null ? (
									'—'
								) : (
									<Code className='api-token'>{prop.defaultValue}</Code>
								)}
							</TableCell>

							<TableCell>
								<div className='api-description'>
									<DescriptionOf prop={prop} translate={translate} />
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};
