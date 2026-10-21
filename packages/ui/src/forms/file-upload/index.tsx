'use client';
// File picker on the native file input, with limits, a list of the chosen files and an optional drop zone.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useEffect, useId, useRef, useState } from 'react';
import type {
	ChangeEvent,
	ComponentPropsWithRef,
	CSSProperties,
	DragEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { IconButton } from '#src/buttons/icon-button/index.tsx';
import {
	colorTransitionStyles,
	forwardAllBut,
	numericTextStyles,
	visuallyHiddenStyles,
} from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { mergeReferences } from '#src/shared/merge-references.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { FormField } from '#src/forms/form-field/index.tsx';
import type { FieldProps, FormFieldControlProps } from '#src/forms/form-field/index.tsx';

const {
	spacing,
	typography,
	radius,
	surface,
	text,
	stroke,
	state,
	focus,
	intent,
	controlHeight,
}: typeof themeVariables = themeVariables;

/** Why a file was not added. */
export type FileRejectionReason = 'type' | 'size' | 'count';

export interface FileRejection {
	file: File;
	reason: FileRejectionReason;
}

/** Limits that the field states and enforces. */
export interface FileLimits {
	accept: string | undefined;
	maxSize: number | undefined;
	maxFiles: number | undefined;
}

/** Texts of the file upload. Translate them with the rest of the interface. */
export interface FileUploadLabels {
	/** Text of the button that opens the file dialog. */
	choose: (multiple: boolean) => string;
	/** Invitation shown in the drop zone, next to the button. */
	dropHint: string;
	/** Sentence that states the limits, read with the field; empty when there are none. */
	limits: (limits: FileLimits, formatSize: (bytes: number) => string) => string;
	formatSize: (bytes: number) => string;
	/** Name of the button that removes a file. */
	remove: (fileName: string) => string;
	/** Name of the list of chosen files. */
	fileList: string;
	/** Announced after a choice when files were left out. */
	rejected: (
		rejection: FileRejection,
		formatSize: (bytes: number) => string,
		limits: FileLimits,
	) => string;
}

const units: readonly string[] = ['B', 'KB', 'MB', 'GB'];

const formatSize = (bytes: number): string => {
	const exponent: number = Math.min(Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)), 3);
	const amount: number = bytes / 1024 ** exponent;
	// One decimal below 10 (1.5 MB), none above or when it is zero (2 KB, not 2.0 KB).
	const rounded: number = Number(amount.toFixed(exponent === 0 || amount >= 10 ? 0 : 1));
	return `${String(rounded)} ${units[exponent] ?? 'B'}`;
};

export const defaultFileUploadLabels: Readonly<FileUploadLabels> = Object.freeze({
	choose: (multiple: boolean): string => (multiple ? 'Choose files' : 'Choose a file'),
	dropHint: 'or drop them here',
	limits: (
		{ accept, maxSize, maxFiles }: FileLimits,
		format: (bytes: number) => string,
	): string => {
		return [
			accept === undefined ? '' : `Accepted types: ${accept.split(',').join(', ')}.`,
			maxSize === undefined ? '' : `Up to ${format(maxSize)} each.`,
			maxFiles === undefined ? '' : `Up to ${String(maxFiles)} files.`,
		]
			.filter((sentence: string): boolean => sentence !== '')
			.join(' ');
	},
	formatSize,
	remove: (fileName: string): string => `Remove ${fileName}`,
	fileList: 'Chosen files',
	rejected: (
		{ file, reason }: FileRejection,
		format: (bytes: number) => string,
		{ maxSize, maxFiles }: FileLimits,
	): string => {
		const reasons: Record<FileRejectionReason, string> = {
			type: 'this type is not accepted',
			size: `it is larger than ${format(maxSize ?? 0)}`,
			count: `the limit is ${String(maxFiles ?? 0)} files`,
		};

		return `${file.name} was not added: ${reasons[reason]}.`;
	},
});

export interface FileUploadProps
	extends
		Omit<FieldProps, 'readOnly' | 'hideLabel'>,
		Omit<
			ComponentPropsWithRef<'input'>,
			| 'type'
			| 'size'
			| 'children'
			| 'required'
			| 'disabled'
			| 'readOnly'
			| 'className'
			| 'style'
			| 'value'
			| 'defaultValue'
			| 'accept'
		> {
	/** File types, as in the native `accept`: extensions (`.pdf`) and media types (`image/*`). */
	accept?: string | undefined;
	/** Largest size of each file, in bytes. */
	maxSize?: number | undefined;
	/** Most files kept when `multiple`. */
	maxFiles?: number | undefined;
	/** Chosen files, when the parent controls them. */
	value?: readonly File[] | undefined;
	/** Called with the files kept after a choice, a drop or a removal. */
	onFilesChange?: ((files: File[]) => void) | undefined;
	/** Called with the files left out by the limits. */
	onReject?: ((rejections: FileRejection[]) => void) | undefined;
	/** Shows a drop zone around the button. Defaults to `true`; choosing with the button always works. */
	dropzone?: boolean | undefined;
	/** Overrides some or all of `defaultFileUploadLabels`. */
	labels?: Partial<FileUploadLabels> | undefined;
	/** Class of the root of the field. */
	className?: string | undefined;
	/** Style of the root of the field. */
	style?: CSSProperties | undefined;
}

interface ZoneStyleProps {
	dragging: boolean;
	invalid: boolean;
	disabled: boolean;
	framed: boolean;
}

const Zone = styled('div', {
	shouldForwardProp: forwardAllBut('dragging', 'invalid', 'disabled', 'framed'),
})<ZoneStyleProps>(({ dragging, invalid, disabled, framed }: ZoneStyleProps): CSSObject => {
	return {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: spacing[3],
		// The zone is decorative: the choose button inside it is the control, with its own boundary.
		...(framed
			? {
					padding: spacing[4],
					border: stroke.dashed,
					borderRadius: radius.card,
					...(invalid ? { borderColor: intent.error.border } : {}),
					backgroundColor: dragging ? state.hover : surface.field,
				}
			: {}),
		// The limits keep their contrast while disabled, like the description of a field: they are text, not a control.
		color: text.secondary,
		...(disabled ? { cursor: 'not-allowed' } : {}),
		...typography.bodySmall,
		...colorTransitionStyles,
	};
});

const HiddenInput = styled('input')(visuallyHiddenStyles);

// The visible button is the label of the input: a click opens the dialog, and the input carries the focus, which the
// button shows.
const ChooseButton = styled('label', {
	shouldForwardProp: forwardAllBut('disabled'),
})<{ disabled: boolean }>(({ disabled }: { disabled: boolean }): CSSObject => {
	return {
		display: 'inline-flex',
		alignItems: 'center',
		gap: spacing[2],
		minHeight: controlHeight.medium,
		paddingInline: spacing[4],
		boxSizing: 'border-box',
		borderRadius: radius.control,
		borderWidth: '1px',
		borderStyle: 'solid',
		...typography.label,
		...colorTransitionStyles,
		...(disabled
			? {
					backgroundColor: state.disabledSurface,
					borderColor: state.disabledBorder,
					color: state.disabledText,
					cursor: 'not-allowed',
				}
			: {
					backgroundColor: intent.default.container,
					borderColor: 'transparent',
					color: intent.default.onContainer,
					cursor: 'pointer',
					'&:hover': { backgroundColor: intent.default.containerHover },
				}),
		'input:focus-visible + &': {
			outline: `${focus.width} solid ${focus.ring}`,
			outlineOffset: focus.offset,
		},
	};
});

const FileList = styled('ul')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	margin: 0,
	padding: 0,
	listStyle: 'none',
});

const FileItem = styled('li')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[2],
	paddingInlineStart: spacing[3],
	borderRadius: radius.control,
	backgroundColor: surface.raised,
	...typography.bodySmall,
	color: text.primary,
});

const FileName = styled('span')({
	flex: '1 1 auto',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

const FileSize = styled('span')({ ...numericTextStyles, color: text.secondary });

const Status = styled('div')({ ...typography.bodySmall, color: intent.error.text });

/** Whether `file` matches one of the comma-separated entries of a native `accept`. */
export const matchesAccept = (file: File, accept: string | undefined): boolean => {
	if (accept === undefined || accept.trim() === '') return true;
	const fileName: string = file.name.toLowerCase();
	const mediaType: string = file.type.toLowerCase();

	return accept
		.split(',')
		.map((entry: string): string => entry.trim().toLowerCase())
		.some((entry: string): boolean => {
			if (entry.startsWith('.')) return fileName.endsWith(entry);
			if (entry.endsWith('/*')) return mediaType.startsWith(entry.slice(0, -1));
			return mediaType === entry;
		});
};

const sameFile = (first: File, second: File): boolean => {
	return (
		first.name === second.name &&
		first.size === second.size &&
		first.lastModified === second.lastModified
	);
};

/** Keeps the native input in step with the list, so a plain form submission sends the same files. */
const synchronizeInput = (input: HTMLInputElement | null, files: readonly File[]): void => {
	if (input === null || typeof DataTransfer === 'undefined') return;
	const transfer: DataTransfer = new DataTransfer();

	files.forEach((file: File): void => {
		transfer.items.add(file);
	});

	input.files = transfer.files;
};

/**
 * Native `<input type="file">`, focused with Tab and opened with Enter or Space through its visible button. The
 * drop zone is an addition for pointers, never the only way. Limits are stated before choosing (read with the
 * field) and enforced after; files left out are listed in a polite status message, once per choice.
 */
export const FileUpload = ({
	label,
	description,
	error,
	required,
	disabled = false,
	loading,
	fieldLabels,
	accept,
	maxSize,
	maxFiles,
	multiple = false,
	value,
	onFilesChange,
	onReject,
	dropzone = true,
	labels,
	className,
	style,
	id,
	name,
	ref,
	onChange,
	'aria-describedby': describedBy,
	...inputAttributes
}: FileUploadProps): ReactElement => {
	const generatedId: string = useId();
	const controlId: string = id ?? generatedId;
	const limitsId: string = `${controlId}-limits`;
	const texts: FileUploadLabels = useComponentLabels('fileUpload', defaultFileUploadLabels, labels);
	const inputReference: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
	const [uncontrolledFiles, setUncontrolledFiles] = useState<readonly File[]>([]);
	const [rejectionMessage, setRejectionMessage] = useState<string>('');
	const [dragging, setDragging] = useState<boolean>(false);
	const files: readonly File[] = value ?? uncontrolledFiles;
	const limits: FileLimits = { accept, maxSize, maxFiles: multiple ? maxFiles : 1 };

	const limitsText: string = texts.limits(
		{ ...limits, maxFiles: multiple ? maxFiles : undefined },
		texts.formatSize,
	);

	useEffect((): void => {
		synchronizeInput(inputReference.current, files);
	}, [files]);

	const update = (next: File[]): void => {
		if (value === undefined) setUncontrolledFiles(next);
		onFilesChange?.(next);
	};

	const add = (incoming: readonly File[]): void => {
		const rejections: FileRejection[] = [];
		const kept: File[] = multiple ? [...files] : [];

		incoming.forEach((file: File): void => {
			if (!matchesAccept(file, accept)) {
				rejections.push({ file, reason: 'type' });
				return;
			}

			if (maxSize !== undefined && file.size > maxSize) {
				rejections.push({ file, reason: 'size' });
				return;
			}

			if (kept.some((candidate: File): boolean => sameFile(candidate, file))) return;
			const capacity: number = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;

			if (kept.length >= capacity) {
				if (!multiple) kept.splice(0, kept.length, file);
				if (multiple) rejections.push({ file, reason: 'count' });
				return;
			}

			kept.push(file);
		});

		setRejectionMessage(
			rejections
				.map((rejection: FileRejection): string => {
					return texts.rejected(rejection, texts.formatSize, limits);
				})
				.join(' '),
		);

		if (rejections.length > 0) onReject?.(rejections);
		update(kept);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		onChange?.(event);
		add([...(event.currentTarget.files ?? [])]);
	};

	const remove = (index: number): void => {
		setRejectionMessage('');
		update(files.filter((_: File, position: number): boolean => position !== index));
		inputReference.current?.focus();
	};

	const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
		if (disabled) return;
		event.preventDefault();
		setDragging(true);
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
		if (disabled) return;
		event.preventDefault();
		setDragging(false);
		add([...event.dataTransfer.files]);
	};

	return (
		<FormField
			label={label}
			description={description}
			error={error}
			required={required}
			disabled={disabled}
			loading={loading}
			fieldLabels={fieldLabels}
			controlId={controlId}
			name={name}
			describedBy={[limitsText === '' ? undefined : limitsId, describedBy]}
			className={className}
			style={style}
		>
			{(control: FormFieldControlProps): ReactNode => {
				return (
					<>
						<Zone
							dragging={dragging}
							invalid={control['aria-invalid'] === true}
							disabled={disabled}
							framed={dropzone}
							onDragOver={dropzone ? handleDragOver : undefined}
							onDragLeave={
								dropzone
									? (): void => {
											setDragging(false);
										}
									: undefined
							}
							onDrop={dropzone ? handleDrop : undefined}
						>
							<HiddenInput
								{...inputAttributes}
								{...control}
								ref={mergeReferences(ref, inputReference)}
								type='file'
								name={name}
								accept={accept}
								multiple={multiple}
								onChange={handleChange}
							/>

							<ChooseButton htmlFor={controlId} disabled={disabled}>
								<Glyph name='upload' />
								<span aria-hidden='true'>{texts.choose(multiple)}</span>
							</ChooseButton>

							{/* A disabled field takes no drop, so it does not invite one. */}
							{dropzone && !disabled ? <span aria-hidden='true'>{texts.dropHint}</span> : null}
							{limitsText === '' ? null : <span id={limitsId}>{limitsText}</span>}
						</Zone>

						{files.length === 0 ? null : (
							<FileList aria-label={texts.fileList}>
								{files.map((file: File, index: number): ReactElement => {
									return (
										<FileItem key={`${file.name}-${String(file.lastModified)}-${String(index)}`}>
											<FileName>{file.name}</FileName>
											<FileSize>{texts.formatSize(file.size)}</FileSize>

											<IconButton
												label={texts.remove(file.name)}
												size='small'
												disabled={disabled}
												onClick={(): void => {
													remove(index);
												}}
											>
												<Glyph name='close' />
											</IconButton>
										</FileItem>
									);
								})}
							</FileList>
						)}

						<Status role='status'>{rejectionMessage}</Status>
					</>
				);
			}}
		</FormField>
	);
};
