'use client';
// Text field with a list of suggestions that filters as the user types (WAI-ARIA combobox with a listbox popup).
import { styled } from '@mui/material/styles';
import useAutocomplete, { createFilterOptions } from '@mui/material/useAutocomplete';
import type { FilterOptionsState, UseAutocompleteReturnValue } from '@mui/material/useAutocomplete';
import { useId, useState } from 'react';
import type {
	ComponentPropsWithRef,
	CSSProperties,
	HTMLAttributes,
	Key,
	ReactElement,
	ReactNode,
	SyntheticEvent,
} from 'react';

import { IconButton } from '#src/buttons/icon-button/index.tsx';
import type { ControlSize } from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { mergeReferences } from '#src/shared/merge-references.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { FormField, HiddenText } from '#src/forms/form-field/index.tsx';
import type { FieldProps, FormFieldControlProps } from '#src/forms/form-field/index.tsx';
import { InputFrame, TextInput } from '#src/forms/input-frame/index.tsx';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	border,
	state,
	elevation,
	intent,
	iconSize,
}: typeof themeVariables = themeVariables;

export interface ComboboxOption {
	value: string;
	label: string;
	disabled?: boolean | undefined;
}

/** Texts of the combobox. Translate them with the rest of the interface. */
export interface ComboboxLabels {
	/** Shown and announced when no option matches. */
	noOptions: string;
	/** Shown and announced while `loading` and the list is open. */
	loading: string;
	/** Name of the button that clears the choice. */
	clear: string;
	/** Name of the button that opens the list. */
	open: string;
	/** Name of the button that closes the list. */
	close: string;
}

export const defaultComboboxLabels: Readonly<ComboboxLabels> = Object.freeze({
	noOptions: 'No options',
	loading: 'Loading options',
	clear: 'Clear',
	open: 'Show options',
	close: 'Hide options',
});

/** How options are filtered by the typed text; `'none'` keeps them as given, e.g. filtered by a server. */
export type ComboboxFilter = 'contains' | 'startsWith' | 'none';

export interface ComboboxProps
	extends
		Omit<FieldProps, 'readOnly'>,
		Omit<
			ComponentPropsWithRef<'input'>,
			| 'size'
			| 'prefix'
			| 'children'
			| 'type'
			| 'required'
			| 'disabled'
			| 'readOnly'
			| 'className'
			| 'style'
			| 'value'
			| 'defaultValue'
			| 'onChange'
		> {
	options: readonly ComboboxOption[];
	/** Value of the chosen option, when the parent controls it; `null` for none. */
	value?: string | null | undefined;
	/** Initially chosen value when uncontrolled. */
	defaultValue?: string | null | undefined;
	/** Called with the value of the chosen option, or `null` when cleared. */
	onValueChange?: ((value: string | null, option: ComboboxOption | null) => void) | undefined;
	/** Typed text, when the parent controls it (e.g. to fetch options). */
	inputValue?: string | undefined;
	/** Called with the typed text. */
	onInputValueChange?: ((inputValue: string) => void) | undefined;
	/** Defaults to `'contains'`. */
	filter?: ComboboxFilter | undefined;
	/** Defaults to `'medium'`. */
	size?: ControlSize | undefined;
	/** Overrides some or all of `defaultComboboxLabels`. */
	labels?: Partial<ComboboxLabels> | undefined;
	/** Class of the root of the field. */
	className?: string | undefined;
	/** Style of the root of the field. */
	style?: CSSProperties | undefined;
}

type AutocompleteState = UseAutocompleteReturnValue<ComboboxOption>;

const Anchor = styled('div')({ position: 'relative' });

const Popup = styled('div')({
	position: 'absolute',
	insetInline: 0,
	insetBlockStart: `calc(100% + ${spacing[1]})`,
	zIndex: 1,
	boxSizing: 'border-box',
	maxHeight: '16rem',
	overflowY: 'auto',
	padding: spacing[1],
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: border.default,
	borderRadius: radius.medium,
	backgroundColor: surface.overlay,
	boxShadow: elevation.medium,
});

const Listbox = styled('ul')({ margin: 0, padding: 0, listStyle: 'none' });

// The highlighted option (`Mui-focused`, set by `useAutocomplete`) takes `state.hover`; the selected one also shows
// a check mark, so selection never rests on color.
const Option = styled('li')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[2],
	minHeight: '2.25rem',
	paddingInline: spacing[2],
	borderRadius: radius.small,
	...typography.body,
	color: text.primary,
	cursor: 'pointer',
	'& > svg': { width: iconSize.small, height: iconSize.small, color: intent.official.text },
	'&.Mui-focused': { backgroundColor: state.hover },
	'&[aria-selected="true"]': { backgroundColor: state.selected },
	'&[aria-selected="true"].Mui-focused': { backgroundColor: state.pressed },
	'&[aria-disabled="true"]': { color: state.disabledText, cursor: 'not-allowed' },
});

const CheckSlot = styled('span')({ display: 'inline-flex', width: iconSize.small, flexShrink: 0 });

const Empty = styled('div')({
	paddingInline: spacing[2],
	paddingBlock: spacing[2],
	...typography.bodySmall,
	color: text.secondary,
});

const filters: Record<
	Exclude<ComboboxFilter, 'none'>,
	(options: ComboboxOption[], state: FilterOptionsState<ComboboxOption>) => ComboboxOption[]
> = {
	contains: createFilterOptions<ComboboxOption>({ matchFrom: 'any' }),
	startsWith: createFilterOptions<ComboboxOption>({ matchFrom: 'start' }),
};

const keepAll = (options: ComboboxOption[]): ComboboxOption[] => options;

const findOption = (
	options: readonly ComboboxOption[],
	value: string | null | undefined,
): ComboboxOption | null => {
	return options.find((option: ComboboxOption): boolean => option.value === value) ?? null;
};

/**
 * Follows the combobox pattern of the WAI-ARIA Authoring Practices (list autocomplete): Down and Up open the list
 * and move the highlight while focus stays in the input (`aria-activedescendant`), Enter chooses, Escape closes and
 * then clears, and the typed text filters. The choice is submitted with `name` in a hidden input, as its value.
 * Keyboard behavior comes from Material UI's `useAutocomplete`; the markup and look are this library's.
 */
export const Combobox = ({
	label,
	hideLabel,
	description,
	error,
	required,
	disabled = false,
	loading = false,
	fieldLabels,
	options,
	value,
	defaultValue = null,
	onValueChange,
	inputValue,
	onInputValueChange,
	filter = 'contains',
	size = 'medium',
	labels,
	className,
	style,
	id,
	name,
	ref,
	'aria-describedby': describedBy,
	...inputAttributes
}: ComboboxProps): ReactElement => {
	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;
	const texts: ComboboxLabels = { ...defaultComboboxLabels, ...labels };
	const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);

	const selected: ComboboxOption | null = findOption(
		options,
		value === undefined ? uncontrolledValue : value,
	);

	const autocomplete: AutocompleteState = useAutocomplete<ComboboxOption>({
		id: controlId,
		options,
		value: selected,
		disabled,
		inputValue,
		filterOptions: filter === 'none' ? keepAll : filters[filter],
		getOptionLabel: (option: ComboboxOption): string => option.label,
		getOptionDisabled: (option: ComboboxOption): boolean => option.disabled === true,
		isOptionEqualToValue: (option: ComboboxOption, candidate: ComboboxOption): boolean => {
			return option.value === candidate.value;
		},
		onChange: (_: SyntheticEvent, option: ComboboxOption | null): void => {
			const next: string | null = option?.value ?? null;
			if (value === undefined) setUncontrolledValue(next);
			onValueChange?.(next, option);
		},
		onInputChange: (_: SyntheticEvent, typed: string): void => {
			onInputValueChange?.(typed);
		},
	});

	const visibleOptions: ComboboxOption[] = autocomplete.groupedOptions;
	const listOpen: boolean = autocomplete.popupOpen;
	const emptyMessage: string = loading ? texts.loading : texts.noOptions;

	const announcement: string =
		listOpen && (loading || visibleOptions.length === 0) ? emptyMessage : '';

	const inputProps: ReturnType<AutocompleteState['getInputProps']> = autocomplete.getInputProps();
	const indicatorProps: HTMLAttributes<HTMLButtonElement> = autocomplete.getPopupIndicatorProps();

	return (
		<FormField
			label={label}
			hideLabel={hideLabel}
			description={description}
			error={error}
			required={required}
			disabled={disabled}
			loading={loading}
			fieldLabels={fieldLabels}
			controlId={controlId}
			labelId={`${controlId}-label`}
			name={name}
			describedBy={[describedBy]}
			className={className}
			style={style}
		>
			{(control: FormFieldControlProps): ReactNode => {
				return (
					<Anchor {...autocomplete.getRootProps()}>
						<InputFrame
							controlId={controlId}
							size={size}
							invalid={control['aria-invalid'] === true}
							disabled={disabled}
							readOnly={false}
							loading={loading}
							actions={
								<>
									{selected === null || disabled ? null : (
										<IconButton
											label={texts.clear}
											size='small'
											tabIndex={-1}
											onClick={autocomplete.getClearProps().onClick}
										>
											<Glyph name='close' />
										</IconButton>
									)}
									<IconButton
										label={listOpen ? texts.close : texts.open}
										size='small'
										tabIndex={-1}
										disabled={disabled}
										onClick={indicatorProps.onClick}
										onMouseDown={indicatorProps.onMouseDown}
									>
										<Glyph name='chevronDown' />
									</IconButton>
								</>
							}
						>
							<TextInput
								{...inputAttributes}
								{...control}
								{...inputProps}
								ref={mergeReferences(ref, inputProps.ref)}
								data-field-name={name}
								aria-describedby={control['aria-describedby']}
							/>
						</InputFrame>
						{name === undefined ? null : (
							<input type='hidden' name={name} value={selected?.value ?? ''} />
						)}
						{listOpen ? (
							<Popup>
								{visibleOptions.length > 0 ? (
									<Listbox {...autocomplete.getListboxProps()}>
										{visibleOptions.map((option: ComboboxOption, index: number): ReactElement => {
											const { key, ...optionProps }: HTMLAttributes<HTMLLIElement> & { key: Key } =
												autocomplete.getOptionProps({ option, index });

											return (
												<Option key={key} {...optionProps}>
													<CheckSlot>
														{selected?.value === option.value ? <Glyph name='check' /> : null}
													</CheckSlot>
													{option.label}
												</Option>
											);
										})}
									</Listbox>
								) : null}
								{loading || visibleOptions.length === 0 ? (
									<Empty aria-hidden='true'>{emptyMessage}</Empty>
								) : null}
							</Popup>
						) : null}
						<HiddenText role='status'>{announcement}</HiddenText>
					</Anchor>
				);
			}}
		</FormField>
	);
};
