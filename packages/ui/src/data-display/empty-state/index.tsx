'use client';
// Tells that there is nothing to show yet, or that a search found nothing, and what to do next.
import type { ReactElement } from 'react';

import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';
import { StateMessage } from '#src/data-display/state-message/index.tsx';
import type { StateMessageContentProps } from '#src/data-display/state-message/index.tsx';

export type EmptyStateProps = StateMessageContentProps;

/**
 * Neutral by design: an empty list is not an error. It is static content; when it replaces results after a search,
 * announce the new count with a status message (as `DataTable` does).
 */
export const EmptyState = (props: EmptyStateProps): ReactElement => {
	return (
		<StateMessage
			{...props}
			iconColor={themeVariables.text.muted}
			defaultIcon={<Glyph name='inbox' />}
		/>
	);
};
