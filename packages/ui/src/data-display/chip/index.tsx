'use client';
// Compact label for an attribute, a status or a filter; optionally clickable, selectable and removable.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type {
	ComponentPropsWithRef,
	KeyboardEvent,
	MouseEvent,
	ReactElement,
	ReactNode,
} from 'react';

import {
	appearanceStyles,
	assertLabel,
	colorTransitionStyles,
	disabledStyles,
	focusRingStyles,
	forwardAllBut,
	interactionStyles,
} from '@/src/shared/appearance';
import type { Appearance } from '@/src/shared/appearance';
import { Glyph } from '@/src/shared/glyphs/index';
import { themeVariables } from '@/src/theme/theme-variables';
import type { SemanticIntent } from '@/src/tokens/index';

const {
	spacing,
	typography,
	radius,
	iconSize,
	intent: intentVariables,
}: typeof themeVariables = themeVariables;

export type ChipVariant = Exclude<Appearance, 'ghost'>;

export type ChipSize = 'small' | 'medium';

interface ChipBaseProps extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'onClick'> {
	/** Visible text; it is also the accessible name of the chip and of its button. */
	label: ReactNode;
	/** Meaning of the attribute or status. Defaults to `'default'`. */
	intent?: SemanticIntent;
	/** Defaults to `'soft'`. A selected chip is always a `solid` `brand` chip with a check mark. */
	variant?: ChipVariant;
	/** 24 or 32 px high. Defaults to `'medium'`. */
	size?: ChipSize;
	/** Decorative content before the label. */
	icon?: ReactNode;
	/** Dims the chip and disables its buttons. */
	disabled?: boolean;
}

/** A chip with `onClick` is a button; with `selected` it is a toggle (`aria-pressed`), e.g. a filter. */
type ChipActionProps =
	| { onClick?: undefined; selected?: never }
	| {
			/** Makes the chip a button. */
			onClick: (event: MouseEvent<HTMLButtonElement>) => void;
			/** Makes the button a toggle (`aria-pressed`), e.g. a filter; needs `onClick`. */
			selected?: boolean;
	  };

/** A removable chip has a separate delete button, which needs its own name, e.g. `'Remove Status: open'`. */
type ChipDeleteProps =
	| { onDelete?: undefined; deleteLabel?: never }
	| {
			/** Adds a delete button after the label. */
			onDelete: () => void;
			/** Name of the delete button, e.g. `'Remove Status: open'`; needs `onDelete`. */
			deleteLabel: string;
	  };

export type ChipProps = ChipBaseProps & ChipActionProps & ChipDeleteProps;

interface ChipStyleProps {
	chipIntent: SemanticIntent;
	chipVariant: ChipVariant;
	chipSize: ChipSize;
	interactive: boolean;
	disabled: boolean;
}

interface ContentStyleProps {
	chipSize: ChipSize;
	removable: boolean;
}

interface DeleteStyleProps {
	chipIntent: SemanticIntent;
	chipVariant: ChipVariant;
}

const minimumHeights: Record<ChipSize, string> = { small: '1.5rem', medium: '2rem' };
const contentPaddings: Record<ChipSize, string> = { small: spacing[2], medium: spacing[3] };

const ChipRoot = styled('span', {
	shouldForwardProp: forwardAllBut(
		'chipIntent',
		'chipVariant',
		'chipSize',
		'interactive',
		'disabled',
	),
})<ChipStyleProps>(({
	chipIntent,
	chipVariant,
	chipSize,
	interactive,
	disabled,
}: ChipStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'inline-flex',
		alignItems: 'stretch',
		maxWidth: '100%',
		minHeight: minimumHeights[chipSize],
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: radius.pill,
		verticalAlign: 'middle',
		...(chipSize === 'small' ? typography.caption : typography.label),
		...colorTransitionStyles,
		...appearanceStyles(chipIntent, chipVariant),
		...(interactive && !disabled ? interactionStyles(chipIntent, chipVariant) : {}),
		...(disabled ? disabledStyles(chipVariant) : {}),
	};
});

const contentStyles = ({ chipSize, removable }: ContentStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'inline-flex',
		flex: '1 1 auto',
		alignItems: 'center',
		gap: spacing[1],
		minWidth: 0,
		paddingBlock: 0,
		paddingInlineStart: contentPaddings[chipSize],
		paddingInlineEnd: removable ? spacing[1] : contentPaddings[chipSize],
		borderRadius: radius.pill,
	};
};

const contentForwarding: { shouldForwardProp: (property: PropertyKey) => boolean } = {
	shouldForwardProp: forwardAllBut('chipSize', 'removable'),
};

const StaticContent = styled('span', contentForwarding)<ContentStyleProps>(contentStyles);

const resetButtonStyles: CSSObject = {
	margin: 0,
	border: 0,
	background: 'none',
	color: 'inherit',
	font: 'inherit',
	letterSpacing: 'inherit',
	textAlign: 'start',
	cursor: 'pointer',
	'&:disabled': { cursor: 'not-allowed' },
	...focusRingStyles,
};

const ActionContent = styled(
	'button',
	contentForwarding,
)<ContentStyleProps>((props: ContentStyleProps): CSSObject => {
	return { ...contentStyles(props), ...resetButtonStyles };
});

// Hover colors are pairs of the contrast audit: `contrastText` on `hover`, `onContainer` on `containerPressed`.
const DeleteButton = styled('button', {
	shouldForwardProp: forwardAllBut('chipIntent', 'chipVariant'),
})<DeleteStyleProps>(({ chipIntent, chipVariant }: DeleteStyleProps): CSSObject => {
	const colors: (typeof intentVariables)[SemanticIntent] = intentVariables[chipIntent];
	const solid: boolean = chipVariant === 'solid';

	return {
		...resetButtonStyles,
		display: 'inline-flex',
		flexShrink: 0,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		width: '1.5rem',
		height: '1.5rem',
		padding: 0,
		marginInlineEnd: '1px',
		borderRadius: radius.pill,
		...colorTransitionStyles,
		'&:hover:not(:disabled)': solid
			? { backgroundColor: colors.hover, color: colors.contrastText }
			: { backgroundColor: colors.containerPressed, color: colors.onContainer },
	};
});

const Decoration = styled('span')({
	display: 'inline-flex',
	flexShrink: 0,
	fontSize: iconSize.small,
});

export const Chip = ({
	label,
	intent = 'default',
	variant = 'soft',
	size = 'medium',
	icon,
	disabled = false,
	onClick,
	selected,
	onDelete,
	deleteLabel,
	...attributes
}: ChipProps): ReactElement => {
	const interactive: boolean = onClick !== undefined;
	const removable: boolean = onDelete !== undefined;
	const shownIntent: SemanticIntent = selected === true ? 'brand' : intent;
	const appearance: ChipVariant = selected === true ? 'solid' : variant;
	const decoration: ReactNode = selected === true ? <Glyph name='check' /> : icon;

	// Backspace and Delete remove a focused chip, as in the chips of a combobox.
	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
		if (onDelete === undefined || (event.key !== 'Backspace' && event.key !== 'Delete')) return;
		event.preventDefault();
		onDelete();
	};

	const content: ReactNode = (
		<>
			{decoration === undefined || decoration === null ? null : (
				<Decoration aria-hidden='true'>{decoration}</Decoration>
			)}

			{label}
		</>
	);

	return (
		<ChipRoot
			{...attributes}
			chipIntent={shownIntent}
			chipVariant={appearance}
			chipSize={size}
			interactive={interactive}
			disabled={disabled}
		>
			{interactive ? (
				<ActionContent
					type='button'
					aria-pressed={selected}
					disabled={disabled}
					onClick={onClick}
					onKeyDown={handleKeyDown}
					chipSize={size}
					removable={removable}
				>
					{content}
				</ActionContent>
			) : (
				<StaticContent chipSize={size} removable={removable}>
					{content}
				</StaticContent>
			)}

			{onDelete === undefined ? null : (
				<DeleteButton
					type='button'
					aria-label={assertLabel(deleteLabel, 'The deleteLabel of a Chip')}
					disabled={disabled}
					onClick={onDelete}
					chipIntent={shownIntent}
					chipVariant={appearance}
				>
					<Glyph name='close' size='small' />
				</DeleteButton>
			)}
		</ChipRoot>
	);
};
