'use client';
// Native checkbox and radio inputs drawn with the tokens, and the row that puts them beside their label.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, CSSProperties, ReactElement, ReactNode } from 'react';

import {
	colorTransitionStyles,
	focusRingStyles,
	forwardAllBut,
	reducedMotion,
} from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import {
	FieldDescription,
	FieldError,
	hasContent,
	RequiredMark,
} from '#src/forms/form-field/index.tsx';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	border,
	state,
	intent,
	motion,
	fontWeight,
}: typeof themeVariables = themeVariables;

export type ChoiceKind = 'checkbox' | 'radio' | 'switch';

interface ChoiceStyleProps {
	kind: ChoiceKind;
	invalid: boolean;
}

const boxSize: string = '1.125rem';
const switchWidth: string = '2.25rem';
const switchHeight: string = '1.25rem';
const thumbSize: string = '0.875rem';

// The boundary is `brand.border`, which meets 3:1 on every surface where the `brand.main` fill does not.
const filled: CSSObject = {
	backgroundColor: intent.brand.main,
	borderColor: intent.brand.border,
};

// The mark is a pseudo-element in `contrastText`, a pair of the contrast audit with `brand.main`. It is raised a little,
// so the rotated check looks centered in the box.
const checkMark: CSSObject = {
	width: '0.3rem',
	height: '0.6rem',
	borderStyle: 'solid',
	borderColor: intent.brand.contrastText,
	borderWidth: '0 2px 2px 0',
	transform: 'translateY(-0.05rem) rotate(45deg)',
};

const kindStyles: Record<ChoiceKind, CSSObject> = {
	checkbox: {
		width: boxSize,
		height: boxSize,
		borderRadius: radius.checkbox,
		'&:checked, &:indeterminate': filled,
		'&:checked::before': checkMark,
		'&:indeterminate::before': {
			width: '0.6rem',
			height: '2px',
			backgroundColor: intent.brand.contrastText,
		},
	},
	radio: {
		width: boxSize,
		height: boxSize,
		borderRadius: radius.pill,
		'&:checked': { borderColor: intent.brand.border },
		'&:checked::before': {
			width: '0.5rem',
			height: '0.5rem',
			borderRadius: radius.pill,
			backgroundColor: intent.brand.main,
		},
	},
	// The thumb moves to the end when on, so the state does not rest on color.
	switch: {
		width: switchWidth,
		height: switchHeight,
		borderRadius: radius.pill,
		justifyItems: 'start',
		paddingInline: '2px',
		'&::before': {
			width: thumbSize,
			height: thumbSize,
			borderRadius: radius.pill,
			backgroundColor: text.secondary,
			transitionProperty: 'transform, background-color',
			transitionDuration: motion.duration.fast,
			transitionTimingFunction: motion.easing.standard,
			[reducedMotion]: { transitionDuration: '0ms' },
		},
		'&:checked': filled,
		'&:checked::before': {
			backgroundColor: intent.brand.contrastText,
			transform: `translateX(calc(${switchWidth} - ${thumbSize} - 6px))`,
		},
		'[dir="rtl"] &:checked::before': {
			transform: `translateX(calc(-1 * (${switchWidth} - ${thumbSize} - 6px)))`,
		},
	},
};

// Disabled marks keep their shape (check, dash, dot, thumb position) in the disabled text color.
const disabledMarkStyles: Record<ChoiceKind, CSSObject> = {
	checkbox: {
		'&:disabled:checked::before': { borderColor: state.disabledText },
		'&:disabled:indeterminate::before': { backgroundColor: state.disabledText },
	},
	radio: { '&:disabled:checked::before': { backgroundColor: state.disabledText } },
	switch: { '&:disabled::before': { backgroundColor: state.disabledText } },
};

const StyledChoiceInput = styled('input', {
	shouldForwardProp: forwardAllBut('kind', 'invalid'),
})<ChoiceStyleProps>(({ kind, invalid }: ChoiceStyleProps): CSSObject => {
	return {
		appearance: 'none',
		boxSizing: 'border-box',
		display: 'inline-grid',
		placeContent: kind === 'switch' ? 'center start' : 'center',
		flexShrink: 0,
		margin: 0,
		borderWidth: kind === 'switch' ? '1px' : '2px',
		borderStyle: 'solid',
		borderColor: invalid ? intent.error.border : border.control,
		backgroundColor: surface.field,
		cursor: 'pointer',
		'&::before': { content: '""', boxSizing: 'border-box' },
		...colorTransitionStyles,
		...kindStyles[kind],
		...focusRingStyles,
		'&:hover:not(:disabled)': { borderColor: invalid ? intent.error.main : text.muted },
		...(kind === 'radio'
			? {}
			: {
					'&:is(:checked, :indeterminate):hover:not(:disabled)': {
						backgroundColor: intent.brand.hover,
						borderColor: intent.brand.hover,
					},
				}),
		'&:disabled, &:disabled:is(:checked, :indeterminate)': {
			borderColor: state.disabledBorder,
			backgroundColor: state.disabledSurface,
			cursor: 'not-allowed',
		},
		...disabledMarkStyles[kind],
	};
});

interface RowStyleProps {
	rowDisabled: boolean;
}

/** The label wraps the input, so the whole row is the target of a click. */
const ChoiceLabel = styled('label', {
	shouldForwardProp: forwardAllBut('rowDisabled'),
})<RowStyleProps>(({ rowDisabled }: RowStyleProps): CSSObject => {
	return {
		display: 'inline-flex',
		alignItems: 'flex-start',
		gap: spacing[2],
		minHeight: '1.5rem',
		paddingBlock: spacing[1],
		boxSizing: 'border-box',
		...typography.body,
		color: rowDisabled ? state.disabledText : text.primary,
		cursor: rowDisabled ? 'not-allowed' : 'pointer',
		// Centered on the first line of the label.
		'& > input': {
			marginBlockStart: `calc((${typography.body.lineHeight} * ${typography.body.fontSize} - ${boxSize}) / 2)`,
		},
	};
});

const Row = styled('div')({ display: 'flex', flexDirection: 'column', gap: spacing[1] });

const LabelText = styled('span', {
	shouldForwardProp: forwardAllBut('emphasized'),
})<{ emphasized: boolean }>(({ emphasized }: { emphasized: boolean }): CSSObject => {
	return emphasized ? { fontWeight: fontWeight.semibold } : {};
});

const Texts = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	paddingInlineStart: `calc(${boxSize} + ${spacing[2]})`,
});

interface ChoiceRowProps {
	control: ReactNode;
	label: ReactNode;
	/** Bold label, for a standalone control; the options of a group keep regular text. */
	emphasized: boolean;
	required: boolean;
	disabled: boolean;
	descriptionId: string | undefined;
	description: ReactNode;
	errorId: string | undefined;
	error: ReactNode;
	className?: string | undefined;
	style?: CSSProperties | undefined;
	/** Indent of the texts below: the width of the control. */
	indent?: string | undefined;
}

/** A control with its label beside it, and its description and error below the label. */
export const ChoiceRow = ({
	control,
	label,
	emphasized,
	required,
	disabled,
	descriptionId,
	description,
	errorId,
	error,
	className,
	style,
	indent,
}: ChoiceRowProps): ReactElement => {
	const hasMessages: boolean = descriptionId !== undefined || errorId !== undefined;

	return (
		<Row className={className} style={style}>
			<ChoiceLabel rowDisabled={disabled}>
				{control}

				{hasContent(label) ? (
					<LabelText emphasized={emphasized}>
						{label}
						{required ? <RequiredMark /> : null}
					</LabelText>
				) : null}
			</ChoiceLabel>

			{hasMessages ? (
				<Texts style={indent === undefined ? undefined : { paddingInlineStart: indent }}>
					{descriptionId === undefined ? null : (
						<FieldDescription id={descriptionId}>{description}</FieldDescription>
					)}

					{errorId === undefined ? null : <FieldError id={errorId}>{error}</FieldError>}
				</Texts>
			) : null}
		</Row>
	);
};

/** An option of CheckboxGroup or RadioGroup. */
export interface ChoiceOption {
	value: string;
	label: ReactNode;
	/** Help text for this option. */
	description?: ReactNode;
	disabled?: boolean | undefined;
}

export type ChoiceOrientation = 'vertical' | 'horizontal';

interface OptionListStyleProps {
	orientation: ChoiceOrientation;
}

/** Options of a group, stacked or in a wrapping row. */
const OptionListRoot = styled('div', {
	shouldForwardProp: forwardAllBut('orientation'),
})<OptionListStyleProps>(({ orientation }: OptionListStyleProps): CSSObject => {
	return orientation === 'vertical'
		? { display: 'flex', flexDirection: 'column', gap: spacing[2] }
		: { display: 'flex', flexWrap: 'wrap', columnGap: spacing[5], rowGap: spacing[2] };
});

/** Width of the switch track plus the gap, to indent its description. */
export const switchIndent: string = `calc(${switchWidth} + ${spacing[2]})`;

/** Native checkbox or radio drawn with the tokens. */
export const ChoiceInput = (
	props: ComponentPropsWithRef<'input'> & ChoiceStyleProps,
): ReactElement => {
	return <StyledChoiceInput {...props} />;
};

/** Options of a group, stacked or in a wrapping row. */
export const OptionList = ({
	orientation,
	children,
}: {
	orientation: ChoiceOrientation;
	children: ReactNode;
}): ReactElement => {
	return <OptionListRoot orientation={orientation}>{children}</OptionListRoot>;
};
