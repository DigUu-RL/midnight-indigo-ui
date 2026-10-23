'use client';
// The panel of a picker: the predefined dates or periods on the side, the calendars or the lists of the time, and a
// footer that clears the choice, cancels it or applies it. Nothing reaches the field until the choice is applied.
import { styled } from '@mui/material/styles';
import { useId } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { Button } from '@/src/buttons/button/index';
import { scrollbarStyles } from '@/src/theme/native-styles';
import { themeVariables } from '@/src/theme/theme-variables';
import type { DatePickerLabels } from '@/src/forms/date-pickers/labels';

const {
	spacing,
	typography,
	radius,
	text,
	state,
	border,
	intent,
	fontWeight,
	focus,
}: typeof themeVariables = themeVariables;

export interface PanelPreset {
	label: string;
	/** Whether the choice of the panel is this preset. */
	active: boolean;
	disabled: boolean;
	onSelect: () => void;
}

export interface PickerPanelProps {
	presets: readonly PanelPreset[];
	labels: DatePickerLabels;
	/** Whether the choice of the panel can be applied, e.g. not a range without its end. */
	canApply: boolean;
	/** Whether there is a choice to clear. */
	canClear: boolean;
	onClear: () => void;
	onCancel: () => void;
	onApply: () => void;
	children: ReactNode;
}

// On a narrow screen, the presets are a row above the calendar instead of a column beside it.
const Body = styled('div')({
	display: 'flex',
	minWidth: 0,
	'@media (max-width: 40rem)': { flexDirection: 'column' },
});

// The column of the presets takes the height of the calendars beside it, never its own: its content is laid out out of
// the flow and scrolls inside the column, so a long list does not make the panel taller.
const Presets = styled('div')({
	position: 'relative',
	flexShrink: 0,
	width: '10rem',
	borderInlineEnd: `1px solid ${border.subtle}`,
	// On a narrow screen the presets become a row above the calendar, scrolled sideways.
	'@media (max-width: 40rem)': {
		position: 'static',
		width: 'auto',
		borderInlineEnd: 'none',
		borderBlockEnd: `1px solid ${border.subtle}`,
	},
});

const PresetsScroll = styled('div')({
	...scrollbarStyles,
	position: 'absolute',
	inset: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	overflowY: 'auto',
	paddingBlock: spacing[3],
	paddingInline: spacing[2],
	'@media (max-width: 40rem)': {
		position: 'static',
		flexDirection: 'row',
		overflowX: 'auto',
		overflowY: 'visible',
	},
});

const PresetsTitle = styled('div')({
	...typography.overline,
	color: text.secondary,
	paddingInline: spacing[2],
	paddingBlockEnd: spacing[1],
	'@media (max-width: 40rem)': { display: 'none' },
});

const PresetList = styled('ul')({
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
	margin: 0,
	padding: 0,
	listStyle: 'none',
	'@media (max-width: 40rem)': { flexDirection: 'row' },
});

const PresetButton = styled('button')({
	width: '100%',
	paddingBlock: spacing[2],
	paddingInline: spacing[2],
	border: 0,
	borderRadius: radius.controlSmall,
	backgroundColor: 'transparent',
	color: text.primary,
	...typography.bodySmall,
	textAlign: 'start',
	whiteSpace: 'nowrap',
	cursor: 'pointer',
	'&:hover': { backgroundColor: state.hover },
	'&:focus-visible': { outline: `${focus.width} solid ${focus.ring}`, outlineOffset: '-2px' },
	'&[aria-pressed="true"]': {
		backgroundColor: intent.brand.container,
		color: intent.brand.onContainer,
		fontWeight: fontWeight.semibold,
	},
	'&:disabled': {
		color: state.disabledText,
		cursor: 'not-allowed',
		backgroundColor: 'transparent',
	},
});

const Main = styled('div')({
	display: 'flex',
	gap: spacing[4],
	padding: spacing[3],
	minWidth: 0,
	overflowX: 'auto',
});

const Footer = styled('div')({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'wrap',
	gap: spacing[2],
	paddingBlock: spacing[3],
	paddingInline: spacing[4],
	borderBlockStart: `1px solid ${border.subtle}`,
});

const FooterEnd = styled('div')({ display: 'flex', gap: spacing[2], marginInlineStart: 'auto' });

export const PickerPanel = ({
	presets,
	labels,
	canApply,
	canClear,
	onClear,
	onCancel,
	onApply,
	children,
}: PickerPanelProps): ReactElement => {
	const presetsTitleId: string = useId();

	return (
		<>
			<Body>
				{presets.length === 0 ? null : (
					<Presets role='group' aria-labelledby={presetsTitleId}>
						<PresetsScroll>
							<PresetsTitle id={presetsTitleId}>{labels.presets}</PresetsTitle>

							<PresetList>
								{presets.map((preset: PanelPreset): ReactElement => {
									return (
										<li key={preset.label}>
											<PresetButton
												type='button'
												aria-pressed={preset.active}
												disabled={preset.disabled}
												onClick={preset.onSelect}
											>
												{preset.label}
											</PresetButton>
										</li>
									);
								})}
							</PresetList>
						</PresetsScroll>
					</Presets>
				)}

				<Main>{children}</Main>
			</Body>

			<Footer>
				<Button size='small' variant='ghost' disabled={!canClear} onClick={onClear}>
					{labels.clear}
				</Button>

				<FooterEnd>
					<Button size='small' variant='outline' intent='brand' onClick={onCancel}>
						{labels.cancel}
					</Button>

					<Button
						size='small'
						variant='solid'
						intent='official'
						disabled={!canApply}
						onClick={onApply}
					>
						{labels.apply}
					</Button>
				</FooterEnd>
			</Footer>
		</>
	);
};
