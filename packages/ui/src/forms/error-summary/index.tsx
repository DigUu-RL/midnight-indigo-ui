'use client';
// List of the errors of a form, with links that move focus to each field; it takes focus when it appears.
import { styled } from '@mui/material/styles';
import { useEffect, useId, useRef } from 'react';
import type {
	ComponentPropsWithRef,
	ElementType,
	MouseEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { focusRingStyles } from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { mergeReferences } from '#src/shared/merge-references.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, typography, radius, surface, text, intent }: typeof themeVariables =
	themeVariables;

export interface ErrorSummaryItem {
	message: ReactNode;
	/** Id of the control to focus. */
	targetId?: string | undefined;
	/** Name of the control to focus, looked up in the enclosing form when there is no `targetId`. */
	name?: string | undefined;
}

/** Texts of the error summary. Translate them with the rest of the interface. */
export interface ErrorSummaryLabels {
	/** Heading, e.g. `'There are 2 problems'`. */
	title: (count: number) => string;
}

export const defaultErrorSummaryLabels: Readonly<ErrorSummaryLabels> = Object.freeze({
	title: (count: number): string => {
		return count === 1
			? 'There is 1 problem with this form'
			: `There are ${String(count)} problems with this form`;
	},
});

export type ErrorSummaryHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface ErrorSummaryProps extends Omit<ComponentPropsWithRef<'section'>, 'children'> {
	errors: readonly ErrorSummaryItem[];
	/** Level of the heading. Defaults to 2. */
	headingLevel?: ErrorSummaryHeadingLevel | undefined;
	/**
	 * The summary takes focus when it appears and whenever this key changes, e.g. the submission count: focus moves
	 * once per submission, never while the user types. `null` disables it.
	 */
	focusKey?: unknown;
	/** Overrides some or all of `defaultErrorSummaryLabels`. */
	labels?: Partial<ErrorSummaryLabels> | undefined;
}

const Root = styled('section')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[2],
	padding: spacing[4],
	borderInlineStart: `4px solid ${intent.error.main}`,
	borderRadius: radius.medium,
	backgroundColor: surface.raised,
	color: text.primary,
	// Focus arrives here by script, after a submission; the ring shows where it went.
	'&:focus': {
		outline: `${themeVariables.focus.width} solid ${themeVariables.focus.ring}`,
		outlineOffset: themeVariables.focus.offset,
	},
});

const Title = styled('h2')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[2],
	margin: 0,
	...typography.headingSmall,
	'& > svg': { color: intent.error.text },
});

const List = styled('ul')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	margin: 0,
	paddingInlineStart: spacing[5],
	...typography.body,
});

const Link = styled('a')({
	color: intent.error.text,
	textDecoration: 'underline',
	textUnderlineOffset: '0.15em',
	borderRadius: radius.small,
	...focusRingStyles,
});

const escapeName = (name: string): string => name.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

/** The first visible, enabled control with this `name` (or `data-field-name`) inside `scope`. */
export const findControlByName = (scope: ParentNode, name: string): HTMLElement | null => {
	const escaped: string = escapeName(name);

	return scope.querySelector<HTMLElement>(
		`[name="${escaped}"]:not([type="hidden"]):not(:disabled), [data-field-name="${escaped}"]:not(:disabled)`,
	);
};

const findTarget = (summary: HTMLElement | null, item: ErrorSummaryItem): HTMLElement | null => {
	if (item.targetId !== undefined) return document.getElementById(item.targetId);
	if (item.name === undefined) return null;
	return findControlByName(summary?.closest('form') ?? document, item.name);
};

/**
 * A region named by its heading, focused (`tabIndex={-1}`) when it appears, so the number of problems is read once.
 * Each link moves focus to its field, where the field's own error is read again with its label.
 */
export const ErrorSummary = ({
	errors,
	headingLevel = 2,
	focusKey,
	labels,
	ref,
	...attributes
}: ErrorSummaryProps): ReactElement | null => {
	const titleId: string = useId();
	const texts: ErrorSummaryLabels = { ...defaultErrorSummaryLabels, ...labels };
	const summaryReference: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);
	const visible: boolean = errors.length > 0;

	// On mount and when the key changes, not when the errors change: revalidation never moves focus.
	useEffect((): void => {
		if (focusKey !== null) summaryReference.current?.focus();
	}, [focusKey]);

	if (!visible) return null;
	const heading: ElementType = `h${String(headingLevel)}` as ElementType;

	const activate = (event: MouseEvent<HTMLAnchorElement>, item: ErrorSummaryItem): void => {
		const target: HTMLElement | null = findTarget(summaryReference.current, item);
		if (target === null) return;
		event.preventDefault();
		target.focus();
	};

	return (
		<Root
			{...attributes}
			ref={mergeReferences(ref, summaryReference)}
			tabIndex={-1}
			aria-labelledby={titleId}
		>
			<Title as={heading} id={titleId}>
				<Glyph name='alert' />
				{texts.title(errors.length)}
			</Title>
			<List>
				{errors.map((item: ErrorSummaryItem, index: number): ReactElement => {
					return (
						<li key={item.targetId ?? item.name ?? index}>
							<Link
								href={`#${item.targetId ?? item.name ?? ''}`}
								onClick={(event: MouseEvent<HTMLAnchorElement>): void => {
									activate(event, item);
								}}
							>
								{item.message}
							</Link>
						</li>
					);
				})}
			</List>
		</Root>
	);
};
