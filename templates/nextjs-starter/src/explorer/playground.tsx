'use client';
// The playground of a component: a control for each prop the catalog names (a choice for a union, a switch for a
// boolean, a field for a text or a number), the component rendered with them and its code, updated as they change.
// Server Components cannot pass a component to a Client Component, so each subpath creates its own playground with
// `createPlayground` (in `playgrounds/`), which knows the components of that subpath. They can pass elements, so the
// samples of the props that take one (`slots`) come rendered from the page. A modal overlay comes with the button that
// opens it (`opener`), and closes when it asks to. A component driven by a hook (`trigger`, e.g. `useToast` over the
// provider of the layout) is not rendered: a button calls the hook with the values, from the hooks of the subpath.
import { Button } from '@midnight-indigo/ui/buttons';
import { CodeBlock } from '@midnight-indigo/ui/code';
import { NumberField, Select, Switch, TextField } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import { createElement, useId, useState } from 'react';
import type { ComponentType, ReactElement } from 'react';

import type { HookTrigger, Opener, PlaygroundValue, SampleWidth } from '#src/explorer/catalog.ts';
import type { ComponentProp } from '#src/explorer/component-api.ts';
import type { SampleCode } from '#src/explorer/sample-code.ts';
import type { SampleValue } from '#src/explorer/samples.tsx';
import { snippetOf } from '#src/explorer/snippet.ts';

/** A prop that takes an element or an object: the sample, rendered on the server, and its code. */
export interface PlaygroundSlot {
	element: SampleValue;
	code: SampleCode;
}

export interface PlaygroundProps {
	/** Name of the component, a key of the components given to `createPlayground`. */
	name: string;
	subpath: string;
	baseProps: Readonly<Record<string, PlaygroundValue>>;
	/** The props with a control, in order. */
	controls: readonly ComponentProp[];
	slots: Readonly<Record<string, PlaygroundSlot>>;
	sampleWidth: SampleWidth;
	/** The button that opens a modal overlay. */
	opener?: Opener | undefined;
	/** The hook a button calls with the values, in place of the component. */
	trigger?: HookTrigger | undefined;
}

type Values = Readonly<Record<string, PlaygroundValue>>;

/** Any component: the playground only gives it the values of its controls. */
type AnyComponent = (props: never) => ReactElement | null;

/** Any hook: the playground calls one of the methods of what it returns with the values of its controls. */
type AnyHook = () => object;

interface HookButtonProps {
	useHook: AnyHook;
	method: string;
	options: Values;
	label: string;
}

const HookButton = ({ useHook, method, options, label }: HookButtonProps): ReactElement => {
	const api: object = useHook();

	return (
		<Button
			onClick={(): void => {
				const call: unknown = Reflect.get(api, method);
				if (typeof call === 'function') Reflect.apply(call, api, [options]);
			}}
		>
			{label}
		</Button>
	);
};

/** What the component is rendered with: the values of the controls, the samples, and the state of an overlay. */
type RenderedProps = Record<string, SampleValue | PlaygroundValue | (() => void)>;

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

const isBlank = (value: PlaygroundValue | undefined): boolean => {
	return typeof value === 'string' && value.trim() === '';
};

/**
 * Props given to the component and written in its code: the blank optional texts are left out, and a blank required
 * text keeps its initial value, since the components refuse a blank name (e.g. the `label` of an `IconButton`).
 */
const renderedValuesOf = (
	controls: readonly ComponentProp[],
	values: Values,
	baseProps: Values,
): Values => {
	return Object.fromEntries(
		Object.entries(values).flatMap(
			([name, value]: [string, PlaygroundValue]): [string, PlaygroundValue][] => {
				const prop: ComponentProp | undefined = controls.find((control: ComponentProp): boolean => {
					return control.name === name;
				});

				if (prop === undefined || !isBlank(value)) return [[name, value]];
				return prop.required ? [[name, initialValueOf(prop, baseProps)]] : [];
			},
		),
	);
};

interface ControlProps {
	prop: ComponentProp;
	value: PlaygroundValue;
	/** Shown under a required text left blank. */
	requiredMessage: string;
	onChange: (value: PlaygroundValue) => void;
}

const Control = ({ prop, value, requiredMessage, onChange }: ControlProps): ReactElement | null => {
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
		<TextField
			label={prop.name}
			size='small'
			required={prop.required}
			error={prop.required && isBlank(value) ? requiredMessage : undefined}
			value={String(value)}
			onValueChange={onChange}
		/>
	) : null;
};

export type PlaygroundComponent = (props: PlaygroundProps) => ReactElement;

export const createPlayground = (
	components: Readonly<Record<string, AnyComponent>>,
	hooks: Readonly<Record<string, AnyHook>> = {},
): PlaygroundComponent => {
	const Playground = ({
		name,
		subpath,
		baseProps,
		controls,
		slots,
		sampleWidth,
		opener,
		trigger,
	}: PlaygroundProps): ReactElement => {
		const { t }: I18nValue = useI18n();
		const controlsLabelId: string = useId();
		const [open, setOpen] = useState<boolean>(false);

		const [values, setValues] = useState<Values>((): Values => {
			return initialValuesOf(controls, baseProps);
		});

		// The values come from the controls and the samples of the props of this very component.
		const component: ComponentType<RenderedProps> | undefined = components[name] as unknown as
			ComponentType<RenderedProps> | undefined;

		const rendered: Values = renderedValuesOf(controls, values, baseProps);

		const code: string = snippetOf({
			name,
			subpath,
			props: controls,
			values: rendered,
			slots: Object.fromEntries(
				Object.entries(slots).map(
					([prop, slot]: [string, PlaygroundSlot]): [string, SampleCode] => {
						return [prop, slot.code];
					},
				),
			),
			opener,
			trigger,
		});

		const useHook: AnyHook | undefined = trigger === undefined ? undefined : hooks[trigger.hook];

		const elements: Readonly<Record<string, SampleValue>> = Object.fromEntries(
			Object.entries(slots).map(([prop, slot]: [string, PlaygroundSlot]): [string, SampleValue] => {
				return [prop, slot.element];
			}),
		);

		const overlay: RenderedProps =
			opener === undefined
				? {}
				: {
						open,
						...Object.fromEntries(
							opener.closeProps.map((prop: string): [string, () => void] => {
								return [
									prop,
									(): void => {
										setOpen(false);
									},
								];
							}),
						),
					};

		return (
			<div className='playground'>
				<div
					className={`playground-stage playground-stage-${sampleWidth}`}
					role='group'
					aria-label={t('explorer.playground.preview')}
				>
					{opener === undefined ? null : (
						<Button
							onClick={(): void => {
								setOpen(true);
							}}
						>
							{opener.label}
						</Button>
					)}

					{trigger === undefined || useHook === undefined ? null : (
						<HookButton
							useHook={useHook}
							method={trigger.method}
							options={rendered}
							label={trigger.label}
						/>
					)}

					{component === undefined || trigger !== undefined
						? null
						: createElement(component, { ...rendered, ...elements, ...overlay })}
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
									requiredMessage={t('explorer.playground.required')}
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
