'use client';
// Short code inside running text: a name, a value, a command.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { themeVariables } from '@/src/theme/theme-variables';

const { fontFamily, fontWeight, radius, surface, border, text }: typeof themeVariables =
	themeVariables;

export type CodeProps = ComponentPropsWithRef<'code'>;

// The size of the text around it, so it fits a heading as well as a caption.
const StyledCode = styled('code')({
	paddingInline: '0.3em',
	paddingBlock: '0.1em',
	border: `1px solid ${border.subtle}`,
	borderRadius: radius.controlSmall,
	backgroundColor: surface.field,
	color: text.primary,
	fontFamily: fontFamily.mono,
	fontWeight: fontWeight.medium,
	overflowWrap: 'anywhere',
	boxDecorationBreak: 'clone',
	WebkitBoxDecorationBreak: 'clone',
});

/** A `<code>` element; for a block of code use `CodeBlock`. */
export const Code = (props: CodeProps): ReactElement => <StyledCode {...props} />;
