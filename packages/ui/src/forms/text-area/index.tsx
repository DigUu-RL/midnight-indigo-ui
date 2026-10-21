'use client';
// Multi-line text field with configurable resize and an optional character counter.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useId, useState } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	ReactElement,
	ReactNode,
} from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { forwardAllBut } from '#src/shared/appearance.ts';
import type { ControlSize } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { FormField } from '#src/forms/form-field/index.tsx';
import type { FieldProps, FormFieldControlProps } from '#src/forms/form-field/index.tsx';
import { controlResetStyles, InputFrame } from '#src/forms/input-frame/index.tsx';

const { spacing, typography, text, intent }: typeof themeVariables = themeVariables;

/** Texts of the text area. Translate them with the rest of the interface. */
export interface TextAreaLabels {
	/** Counter shown with `showCount`, e.g. `'12 of 200 characters'`. */
	characterCount: (count: number, maximum: number | undefined) => string;
}

export const defaultTextAreaLabels: Readonly<TextAreaLabels> = Object.freeze({
	characterCount: (count: number, maximum: number | undefined): string => {
		return maximum === undefined
			? `${String(count)} characters`
			: `${String(count)} of ${String(maximum)} characters`;
	},
});

export type TextAreaResize = 'none' | 'vertical' | 'both';

export interface TextAreaProps
	extends
		FieldProps,
		Omit<
			ComponentPropsWithRef<'textarea'>,
			'children' | 'required' | 'disabled' | 'readOnly' | 'className' | 'style'
		> {
	/** Which way the reader can drag the corner to resize the field. Defaults to `'vertical'`. */
	resize?: TextAreaResize;
	/** Shows how many characters were typed, and the limit when `maxLength` is set. Defaults to `false`. */
	showCount?: boolean;
	/** Text size of the value; the height comes from `rows`. Defaults to `'medium'`. */
	size?: ControlSize;
	/** Overrides some or all of `defaultTextAreaLabels`. */
	labels?: Partial<TextAreaLabels>;
	/** Class of the root of the field. */
	className?: string;
	/** Style of the root of the field. */
	style?: CSSProperties;
	/** Called with the new text, after `onChange`. */
	onValueChange?: (value: string) => void;
}

interface AreaStyleProps {
	areaResize: TextAreaResize;
}

const Area = styled('textarea', {
	shouldForwardProp: forwardAllBut('areaResize'),
})<AreaStyleProps>(({ areaResize }: AreaStyleProps): CSSObject => {
	return { ...controlResetStyles, minHeight: '4lh', resize: areaResize };
});

interface CounterStyleProps {
	exceeded: boolean;
}

const Counter = styled('div', {
	shouldForwardProp: forwardAllBut('exceeded'),
})<CounterStyleProps>(({ exceeded }: CounterStyleProps): CSSObject => {
	return {
		...typography.caption,
		alignSelf: 'flex-end',
		marginBlockStart: `calc(-1 * ${spacing[1]})`,
		color: exceeded ? intent.error.text : text.secondary,
	};
});

const lengthOf = (value: unknown): number => {
	return typeof value === 'string' ? value.length : 0;
};

/**
 * Native `<textarea>`. The counter is described with the field (read when it gets focus), not announced at every
 * keystroke.
 */
export const TextArea = ({
	label,
	hideLabel,
	description,
	error,
	required,
	disabled = false,
	readOnly = false,
	loading = false,
	fieldLabels,
	resize = 'vertical',
	showCount = false,
	size = 'medium',
	labels,
	className,
	style,
	id,
	name,
	rows = 3,
	maxLength,
	value,
	defaultValue,
	onChange,
	onValueChange,
	'aria-describedby': describedBy,
	...textAreaAttributes
}: TextAreaProps): ReactElement => {
	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;
	const counterId: string = `${controlId}-count`;
	const texts: TextAreaLabels = useComponentLabels('textArea', defaultTextAreaLabels, labels);
	const [uncontrolledLength, setUncontrolledLength] = useState<number>(lengthOf(defaultValue));
	const count: number = value === undefined ? uncontrolledLength : lengthOf(value);

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
		setUncontrolledLength(event.currentTarget.value.length);
		onChange?.(event);
		onValueChange?.(event.currentTarget.value);
	};

	return (
		<FormField
			label={label}
			hideLabel={hideLabel}
			description={description}
			error={error}
			required={required}
			disabled={disabled}
			readOnly={readOnly}
			loading={loading}
			fieldLabels={fieldLabels}
			controlId={controlId}
			name={name}
			describedBy={[showCount ? counterId : undefined, describedBy]}
			className={className}
			style={style}
		>
			{(control: FormFieldControlProps): ReactNode => {
				return (
					<>
						<InputFrame
							controlId={controlId}
							size={size}
							invalid={control['aria-invalid'] === true}
							disabled={disabled}
							readOnly={readOnly}
							loading={loading}
							multiline
						>
							<Area
								{...textAreaAttributes}
								{...control}
								name={name}
								rows={rows}
								maxLength={maxLength}
								value={value}
								defaultValue={defaultValue}
								onChange={handleChange}
								areaResize={resize}
							/>
						</InputFrame>

						{showCount ? (
							<Counter id={counterId} exceeded={maxLength !== undefined && count > maxLength}>
								{texts.characterCount(count, maxLength)}
							</Counter>
						) : null}
					</>
				);
			}}
		</FormField>
	);
};
