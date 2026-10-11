'use client';
// Row of the actions that end a form: submit, cancel, reset.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { forwardAllBut } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing }: typeof themeVariables = themeVariables;

export type FormActionsAlignment = 'start' | 'end' | 'space-between';

export interface FormActionsProps extends ComponentPropsWithRef<'div'> {
	/** Where the buttons sit in the row. Defaults to `'start'`, next to the fields they complete. */
	align?: FormActionsAlignment | undefined;
}

interface ActionsStyleProps {
	alignment: FormActionsAlignment;
}

const justification: Record<FormActionsAlignment, string> = {
	start: 'flex-start',
	end: 'flex-end',
	'space-between': 'space-between',
};

const Root = styled('div', {
	shouldForwardProp: forwardAllBut('alignment'),
})<ActionsStyleProps>(({ alignment }: ActionsStyleProps): CSSObject => {
	return {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: justification[alignment],
		gap: spacing[3],
		paddingBlockStart: spacing[2],
	};
});

/**
 * Lays out buttons in source order, wrapping on narrow screens. Put the main action first, so it is also the first
 * one reached by Tab; the visual order never differs from the reading order.
 */
export const FormActions = ({ align = 'start', ...attributes }: FormActionsProps): ReactElement => {
	return <Root {...attributes} alignment={align} />;
};
