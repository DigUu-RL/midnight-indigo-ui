'use client';
// Copies a text to the clipboard, confirms it with a check mark and announces the result to assistive technologies.
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactElement, RefObject } from 'react';

import { visuallyHiddenStyles } from '#src/shared/appearance.ts';
import type { Appearance, ControlSize } from '#src/shared/appearance.ts';
import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import type { GlyphName } from '#src/shared/glyphs/index.tsx';
import type { SemanticIntent } from '#src/tokens/index.ts';
import { Button } from '#src/buttons/button/index.tsx';
import type { NativeButtonAttributes } from '#src/buttons/button-root/index.tsx';
import { IconButton } from '#src/buttons/icon-button/index.tsx';

/** Texts of the copy button. Translate them with the rest of the interface. */
export interface CopyButtonLabels {
	/** Name of the button, e.g. `'Copy'`; `label` replaces it for one button. */
	copy: string;
	/** Shown and announced after a copy. */
	copied: string;
	/** Shown and announced when the clipboard refuses the text, e.g. outside a secure context. */
	failed: string;
}

export const defaultCopyButtonLabels: Readonly<CopyButtonLabels> = Object.freeze({
	copy: 'Copy',
	copied: 'Copied',
	failed: 'Could not copy',
});

export type CopyButtonStatus = 'idle' | 'copied' | 'failed';

export interface CopyButtonProps extends Omit<NativeButtonAttributes, 'value' | 'aria-label'> {
	/** Text written to the clipboard, or a function that returns it at the moment of the copy. */
	value: string | (() => string);
	/** Name of the button for what it copies, e.g. `'Copy code'`. Defaults to `labels.copy`. Cannot be blank. */
	label?: string;
	/** Shows the name next to the icon. Defaults to `false`: the icon alone. */
	showLabel?: boolean;
	/** Defaults to `'default'`. */
	intent?: SemanticIntent;
	/** Defaults to `'ghost'`. */
	variant?: Appearance;
	/** Defaults to `'small'`. */
	size?: ControlSize;
	/** Time the confirmation stays before the button returns to rest. Defaults to 2000 ms. */
	feedbackDuration?: number;
	/** Called with the copied text. */
	onCopied?: (text: string) => void;
	/** Called when the clipboard refuses the text. */
	onCopyFailed?: (error: unknown) => void;
	/** Overrides some or all of `defaultCopyButtonLabels`. */
	labels?: Partial<CopyButtonLabels>;
}

const Announcement = styled('span')(visuallyHiddenStyles);

const statusGlyphs: Readonly<Record<CopyButtonStatus, GlyphName>> = {
	idle: 'copy',
	copied: 'check',
	failed: 'alert',
};

const writeToClipboard = async (text: string): Promise<void> => {
	// `navigator.clipboard` is missing outside a secure context (plain HTTP), although the type says otherwise.
	const clipboard: Clipboard | undefined = (navigator as Partial<Navigator>).clipboard;
	if (clipboard === undefined) throw new Error('The Clipboard API is not available.');
	await clipboard.writeText(text);
};

/**
 * The result is shown by the icon (a check mark, or an alert when the copy fails) and the intent of the button, and is
 * announced by a live region next to it, so the name of the button never changes under the focus.
 */
export const CopyButton = ({
	value,
	label,
	showLabel = false,
	intent = 'default',
	variant = 'ghost',
	size = 'small',
	feedbackDuration = 2000,
	onCopied,
	onCopyFailed,
	labels,
	onClick,
	...buttonAttributes
}: CopyButtonProps): ReactElement => {
	const texts: CopyButtonLabels = useComponentLabels('copyButton', defaultCopyButtonLabels, labels);
	const [status, setStatus] = useState<CopyButtonStatus>('idle');
	// Each result is a new element in the live region, so copying twice in a row is announced twice.
	const [announcementCount, setAnnouncementCount] = useState<number>(0);
	const resetTimer: RefObject<number | undefined> = useRef<number | undefined>(undefined);
	const name: string = label ?? texts.copy;

	useEffect((): (() => void) => {
		return (): void => {
			window.clearTimeout(resetTimer.current);
		};
	}, []);

	const settle = (result: Exclude<CopyButtonStatus, 'idle'>): void => {
		window.clearTimeout(resetTimer.current);
		setStatus(result);
		setAnnouncementCount((count: number): number => count + 1);

		resetTimer.current = window.setTimeout((): void => {
			setStatus('idle');
		}, feedbackDuration);
	};

	const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
		onClick?.(event);
		if (event.defaultPrevented) return;
		const text: string = typeof value === 'function' ? value() : value;

		writeToClipboard(text).then(
			(): void => {
				settle('copied');
				onCopied?.(text);
			},
			(error: unknown): void => {
				settle('failed');
				onCopyFailed?.(error);
			},
		);
	};

	const statusIntents: Record<CopyButtonStatus, SemanticIntent> = {
		idle: intent,
		copied: 'success',
		failed: 'error',
	};

	const shownIntent: SemanticIntent = statusIntents[status];
	const icon: ReactElement = <Glyph name={statusGlyphs[status]} />;
	const announcement: string = { idle: '', copied: texts.copied, failed: texts.failed }[status];

	return (
		<>
			{showLabel ? (
				<Button
					{...buttonAttributes}
					intent={shownIntent}
					variant={variant}
					size={size}
					startIcon={icon}
					onClick={handleClick}
				>
					{name}
				</Button>
			) : (
				<IconButton
					{...buttonAttributes}
					label={name}
					intent={shownIntent}
					variant={variant}
					size={size}
					onClick={handleClick}
				>
					{icon}
				</IconButton>
			)}

			<Announcement role='status'>
				{announcement === '' ? null : <span key={announcementCount}>{announcement}</span>}
			</Announcement>
		</>
	);
};
