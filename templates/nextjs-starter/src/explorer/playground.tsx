'use client';
// The playground of a component: a control for each prop the catalog names (a choice for a union, a switch for a
// boolean, a field for a text or a number), the component rendered with them and its code, updated as they change.
// Server Components cannot pass a component to a Client Component, so each subpath creates its own playground with
// `createPlayground` (in `playgrounds/`), which knows the components of that subpath.
import { Button } from '@midnight-indigo/ui/buttons';
import { CodeBlock } from '@midnight-indigo/ui/code';
import { NumberField, Select, Switch, TextField } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { createElement, useId, useState } from 'react';
import type { ComponentType, ReactElement } from 'react';

import type { PlaygroundValue } from '#src/explorer/catalog.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import { snippetOf } from '#src/explorer/snippet.ts';

export interface PlaygroundProps {
	/** Name of the component, a key of the components given to `createPlayground`. */
	name: string;
	subpath: string;
	baseProps: Readonly<Record<string, PlaygroundValue>>;
	/** The props with a control, in order. */
	controls: readonly ComponentProp[];
}

type Values = Readonly<Record<string, PlaygroundValue>>;

/** Any component: the playground only gives it the values of its controls. */
type AnyComponent = (props: never) => ReactElement | null;

/** The value a control starts with: the one of the catalog, else the default of the prop. */
const initialValueOf = (prop: ComponentProp, baseProps: Values): PlaygroundValue => {
	const base: PlaygroundValue | undefined = baseProps[prop.name];
	if (base !== undefined) return base;
	const fallback: string = prop.defaultValue?.replaceAll(/^'|'$/g, '') ?? '';
	if (prop.kind === 'boolean') return fallback === 'true';
	if (prop.kind === 'number') return Number(fallback === '' ? 0 : fallback);
	return prop.kind === 'enum' && fallback === '' && prop.required
		? (prop.options[0] ?? '')
		: fallback;
};

const initialValuesOf = (controls: readonly ComponentProp[], baseProps: Values): Values => {
	return {
		...baseProps,
		...Object.fromEntries(
			controls.map((prop: ComponentProp): [string, PlaygroundValue] => {
				return [prop.name, initialValueOf(prop, baseProps)];
			}),
		),
	};
};

/** Props given to the component: the empty optional texts are left out, as the snippet leaves them out. */
const renderedValuesOf = (controls: readonly ComponentProp[], values: Values): Values => {
	return Object.fromEntries(
		Object.entries(values).filter(([name, value]: [string, PlaygroundValue]): boolean => {
			const prop: ComponentProp | undefined = controls.find((control: ComponentProp): boolean => {
				return control.name === name;
			});

			return value !== '' || prop?.required === true;
		}),
	);
};

interface ControlProps {
	prop: ComponentProp;
	value: PlaygroundValue;
	onChange: (value: PlaygroundValue) => void;
}

const Control = ({ prop, value, onChange }: ControlProps): ReactElement | null => {
	if (prop.kind === 'enum') {
		return (
			<Select
				label={prop.name}
				size='small'
				value={String(value)}
				onValueChange={onChange}
				options={prop.options.map((option: string): { value: string; label: string } => {
					return { value: option, label: option };
				})}
			/>
		);
	}

	if (prop.kind === 'boolean') {
		return <Switch label={prop.name} checked={value === true} onCheckedChange={onChange} />;
	}

	if (prop.kind === 'number') {
		return (
			<NumberField
				label={prop.name}
				size='small'
				value={String(value)}
				onValueChange={(next: number | null): void => {
					onChange(next ?? 0);
				}}
			/>
		);
	}

	return prop.kind === 'string' || prop.kind === 'node' ? (
		<TextField label={prop.name} size='small' value={String(value)} onValueChange={onChange} />
	) : null;
};

export type PlaygroundComponent = (props: PlaygroundProps) => ReactElement;

export const createPlayground = (
	components: Readonly<Record<string, AnyComponent>>,
): PlaygroundComponent => {
	const Playground = ({ name, subpath, baseProps, controls }: PlaygroundProps): ReactElement => {
		const { t }: I18nValue = useI18n();
		const controlsLabelId: string = useId();

		const [values, setValues] = useState<Values>((): Values => {
			return initialValuesOf(controls, baseProps);
		});

		// The values come from the controls of the props of this very component.
		const component: ComponentType<Values> | undefined = components[name] as unknown as
			ComponentType<Values> | undefined;

		const code: string = snippetOf({ name, subpath, props: controls, values });

		return (
			<div className='playground'>
				<div
					className='playground-stage'
					role='group'
					aria-label={t('explorer.playground.preview')}
				>
					{component === undefined
						? null
						: createElement(component, renderedValuesOf(controls, values))}
				</div>

				<section className='playground-controls' aria-labelledby={controlsLabelId}>
					<h3 id={controlsLabelId} className='playground-title'>
						{t('explorer.playground.controls')}
					</h3>

					<div className='playground-fields'>
						{controls.map((prop: ComponentProp): ReactElement => {
							return (
								<Control
									key={prop.name}
									prop={prop}
									value={values[prop.name] ?? ''}
									onChange={(value: PlaygroundValue): void => {
										setValues((current: Values): Values => ({ ...current, [prop.name]: value }));
									}}
								/>
							);
						})}
					</div>

					<Button
						size='small'
						variant='ghost'
						onClick={(): void => {
							setValues(initialValuesOf(controls, baseProps));
						}}
					>
						{t('explorer.playground.reset')}
					</Button>
				</section>

				<CodeBlock code={code} fileName={`${name}Example.tsx`} />
			</div>
		);
	};

	return Playground;
};
