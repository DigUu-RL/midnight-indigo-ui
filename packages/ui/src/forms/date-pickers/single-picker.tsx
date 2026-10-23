'use client';
// The field of a picker of one value (a date, a date and a time, or a time): its label and messages, the text, the
// button that opens the panel, and the panel itself, which each picker fills.
import type { Locale } from 'date-fns';
import { useId } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { IconButton } from '#src/buttons/icon-button/index.tsx';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import type { GlyphName } from '#src/shared/glyphs/index.tsx';
import { fieldPlaceholderOf } from '#src/forms/date-pickers/date-format.ts';
import type { FieldPattern } from '#src/forms/date-pickers/date-format.ts';
import type { DatePickerLabels } from '#src/forms/date-pickers/labels.ts';
import { PickerInput, PickerPopup, PickerWrapper } from '#src/forms/date-pickers/picker-field.tsx';
import type { PickerFieldProps, PickerState } from '#src/forms/date-pickers/picker-field.tsx';
import { FormField } from '#src/forms/form-field/index.tsx';
import type { FormFieldControlProps } from '#src/forms/form-field/index.tsx';
import { InputFrame } from '#src/forms/input-frame/index.tsx';

export interface SinglePickerProps extends Omit<PickerFieldProps, 'labels'> {
	state: PickerState;
	pattern: FieldPattern;
	locale: Locale;
	labels: DatePickerLabels;
	value: Date | null;
	reference: Date;
	isAllowed: (value: Date) => boolean;
	onCommit: (value: Date | null) => void;
	/** Name of the panel. */
	dialogLabel: string;
	/** Name of the button that opens the panel. */
	openLabel: string;
	glyph: GlyphName;
	panel: ReactNode;
}

export const SinglePicker = ({
	label,
	hideLabel,
	description,
	error,
	required = false,
	disabled = false,
	readOnly = false,
	name,
	id,
	size = 'medium',
	className,
	style,
	state,
	pattern,
	locale,
	labels,
	value,
	reference,
	isAllowed,
	onCommit,
	dialogLabel,
	openLabel,
	glyph,
	panel,
}: SinglePickerProps): ReactElement => {
	const popupId: string = useId();

	return (
		<PickerWrapper state={state} className={className} style={style}>
			<FormField
				label={label}
				hideLabel={hideLabel}
				description={description}
				error={error}
				required={required}
				disabled={disabled}
				readOnly={readOnly}
				controlId={id}
				name={name}
			>
				{(control: FormFieldControlProps): ReactElement => {
					return (
						<div ref={state.anchorReference}>
							<InputFrame
								controlId={control.id}
								size={size}
								invalid={control['aria-invalid'] === true}
								disabled={disabled}
								readOnly={readOnly}
								loading={false}
								actions={
									<IconButton
										label={openLabel}
										size='small'
										disabled={disabled || readOnly}
										aria-haspopup='dialog'
										aria-expanded={state.open}
										aria-controls={state.open ? popupId : undefined}
										onClick={(): void => {
											if (state.open) {
												state.closePanel(true);
												return;
											}

											state.openPanel(true);
										}}
									>
										<Glyph name={glyph} />
									</IconButton>
								}
							>
								<PickerInput
									{...control}
									ref={state.inputReference}
									name={name}
									role='combobox'
									aria-haspopup='dialog'
									aria-expanded={state.open}
									aria-controls={state.open ? popupId : undefined}
									placeholder={fieldPlaceholderOf(pattern, labels, locale)}
									fieldPattern={pattern}
									locale={locale}
									value={value}
									reference={reference}
									isAllowed={isAllowed}
									onCommit={onCommit}
									invalidMessage={labels.invalid}
									onClick={(): void => {
										state.openPanel(false);
									}}
									onKeyDown={state.handleFieldKeyDown}
								/>
							</InputFrame>
						</div>
					);
				}}
			</FormField>

			<PickerPopup
				open={state.open}
				anchor={state.anchorReference.current}
				id={popupId}
				label={dialogLabel}
				onEscape={(): void => {
					state.closePanel(true);
				}}
			>
				{panel}
			</PickerPopup>
		</PickerWrapper>
	);
};
