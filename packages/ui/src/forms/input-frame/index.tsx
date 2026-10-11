'use client';
// Box around a text control, shared by the text fields, Select and Combobox: boundary, states and adornments.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { colorTransitionStyles, forwardAllBut } from '#src/shared/appearance.ts';
import type { ControlSize } from '#src/shared/appearance.ts';
import { CircularIndicator } from '#src/shared/circular-indicator/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { hasContent } from '#src/forms/form-field/index.tsx';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	border,
	state,
	focus,
	intent,
	iconSize,
}: typeof themeVariables = themeVariables;

/** Content shown inside a field, before or after the value: a unit, a currency, a decorative icon. */
export interface AdornmentProps {
	/**
	 * Before the value, e.g. `'R$'`. Its text is read after the label (by `aria-describedby`), so the name of the
	 * field stays its label; an `Icon` marked `decorative` is skipped.
	 */
	prefix?: ReactNode | undefined;
	/** After the value, e.g. `'kg'`; read like `prefix`. */
	suffix?: ReactNode | undefined;
}

interface FrameStyleProps {
	frameSize: ControlSize;
	invalid: boolean;
	disabled: boolean;
	readOnly: boolean;
	multiline: boolean;
}

/** Same heights as the buttons, so fields and buttons align in a row. */
export const controlHeights: Record<ControlSize, string> = {
	small: '2rem',
	medium: '2.5rem',
	large: '3rem',
};

const textStyles: Record<ControlSize, CSSObject> = {
	small: typography.bodySmall,
	medium: typography.body,
	large: typography.body,
};

/** Look of the boundary in each state; the matching pairs are in the contrast audit (`border.strong`, `intent.error.border`). */
const boundaryStyles = ({ invalid, disabled, readOnly }: FrameStyleProps): CSSObject => {
	if (disabled) {
		return {
			backgroundColor: state.disabledSurface,
			borderColor: state.disabledBorder,
			color: state.disabledText,
			cursor: 'not-allowed',
		};
	}

	// Read-only keeps the text readable and drops the filled look: a dashed boundary, not a color, tells it apart.
	if (readOnly) {
		return { backgroundColor: 'transparent', borderStyle: 'dashed', borderColor: border.strong };
	}

	// An invalid boundary is also thicker (an inset shadow, so the size does not change), besides the error message.
	return invalid
		? {
				borderColor: intent.error.border,
				boxShadow: `inset 0 0 0 1px ${intent.error.border}`,
				'&:hover': { borderColor: intent.error.main },
			}
		: { borderColor: border.strong, '&:hover': { borderColor: text.muted } };
};

export const frameStyles = (props: FrameStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'flex',
		alignItems: props.multiline ? 'stretch' : 'center',
		gap: spacing[2],
		width: '100%',
		minHeight: controlHeights[props.frameSize],
		paddingInline: props.frameSize === 'small' ? spacing[2] : spacing[3],
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: radius.medium,
		backgroundColor: surface.sunken,
		color: text.primary,
		...textStyles[props.frameSize],
		...colorTransitionStyles,
		...boundaryStyles(props),
		// The frame shows the focus of its control, which is the visible part of it.
		'&:has(:is(input, textarea, select):focus-visible)': {
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: focus.offset,
		},
	};
};

export const frameForwarding: { shouldForwardProp: (property: PropertyKey) => boolean } = {
	shouldForwardProp: forwardAllBut('frameSize', 'invalid', 'disabled', 'readOnly', 'multiline'),
};

const Frame = styled('div', frameForwarding)<FrameStyleProps>(frameStyles);

/** The native control inside the frame, which draws the boundary and the focus instead of it. */
export const controlResetStyles: CSSObject = {
	boxSizing: 'border-box',
	flex: '1 1 auto',
	minWidth: 0,
	margin: 0,
	padding: 0,
	paddingBlock: spacing[2],
	border: 0,
	outline: 0,
	background: 'none',
	color: 'inherit',
	font: 'inherit',
	letterSpacing: 'inherit',
	'&::placeholder': { color: text.muted, opacity: 1 },
	'&:disabled': { cursor: 'not-allowed', WebkitTextFillColor: 'currentColor' },
};

const StyledTextInput = styled('input')(controlResetStyles);

export const TextInput = (props: ComponentPropsWithRef<'input'>): ReactElement => {
	return <StyledTextInput {...props} />;
};

const Adornment = styled('span')({
	display: 'inline-flex',
	flexShrink: 0,
	alignItems: 'center',
	color: 'inherit',
	opacity: 0.85,
	'& > svg': { width: iconSize.small, height: iconSize.small },
});

const Actions = styled('span')({
	display: 'inline-flex',
	flexShrink: 0,
	alignItems: 'center',
	gap: spacing[1],
	marginInlineEnd: `calc(-1 * ${spacing[1]})`,
});

const Busy = styled('span')({
	display: 'inline-flex',
	flexShrink: 0,
	color: text.secondary,
	fontSize: iconSize.small,
});

/** Ids of the adornments, to add to the `aria-describedby` of the control. */
export const adornmentIds = (
	controlId: string,
	{ prefix, suffix }: AdornmentProps,
): (string | undefined)[] => {
	return [
		hasContent(prefix) ? `${controlId}-prefix` : undefined,
		hasContent(suffix) ? `${controlId}-suffix` : undefined,
	];
};

export interface InputFrameProps extends AdornmentProps {
	controlId: string;
	size: ControlSize;
	invalid: boolean;
	disabled: boolean;
	readOnly: boolean;
	loading: boolean;
	multiline?: boolean | undefined;
	/** Decorative icon before the value (e.g. a magnifier), hidden from assistive technologies. */
	decoration?: ReactNode | undefined;
	/** Buttons after the value (show password, clear, steppers); they are not part of the description. */
	actions?: ReactNode | undefined;
	className?: string | undefined;
	children: ReactNode;
}

export const InputFrame = ({
	controlId,
	size,
	invalid,
	disabled,
	readOnly,
	loading,
	multiline = false,
	prefix,
	suffix,
	decoration,
	actions,
	className,
	children,
}: InputFrameProps): ReactElement => {
	return (
		<Frame
			className={className}
			frameSize={size}
			invalid={invalid}
			disabled={disabled}
			readOnly={readOnly}
			multiline={multiline}
		>
			{hasContent(decoration) ? <Adornment aria-hidden='true'>{decoration}</Adornment> : null}
			{hasContent(prefix) ? <Adornment id={`${controlId}-prefix`}>{prefix}</Adornment> : null}
			{children}
			{hasContent(suffix) ? <Adornment id={`${controlId}-suffix`}>{suffix}</Adornment> : null}
			{loading ? (
				<Busy>
					<CircularIndicator size='1em' />
				</Busy>
			) : null}
			{hasContent(actions) ? <Actions>{actions}</Actions> : null}
		</Frame>
	);
};
