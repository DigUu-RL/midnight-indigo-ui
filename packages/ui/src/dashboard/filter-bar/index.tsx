'use client';
// Filters of a dashboard page: a search landmark holding the fields that narrow what the page shows.
import { styled } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement, ReactNode, SubmitEvent } from 'react';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import { Button } from '@/src/buttons/button/index';
import { themeVariables } from '@/src/theme/theme-variables';

const { spacing, radius, surface, border }: typeof themeVariables = themeVariables;

/** Texts of the filter bar. Translate them with the rest of the interface. */
export interface FilterBarLabels {
	/** The button shown with `onClear`. */
	clear: string;
}

export const defaultFilterBarLabels: Readonly<FilterBarLabels> = Object.freeze({
	clear: 'Clear filters',
});

export interface FilterBarProps extends Omit<ComponentPropsWithRef<'form'>, 'children' | 'role'> {
	/** Names the search landmark, e.g. `'Filters'`. */
	label: string;
	/** The fields, e.g. a `SearchField` and some `Select`; each takes at least 12 rem and they wrap. */
	children: ReactNode;
	/** Controls after the fields, e.g. a button that saves the filters. */
	actions?: ReactNode;
	/** Shows a button that clears every filter. */
	onClear?: () => void;
	/** Overrides some or all of `defaultFilterBarLabels`. */
	labels?: Partial<FilterBarLabels>;
}

const Root = styled('form')({
	boxSizing: 'border-box',
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'flex-end',
	gap: spacing[4],
	padding: spacing[4],
	border: `1px solid ${border.subtle}`,
	borderRadius: radius.card,
	backgroundColor: surface.raised,
});

const Fields = styled('div')({
	display: 'flex',
	flex: '999 1 24rem',
	flexWrap: 'wrap',
	alignItems: 'flex-end',
	gap: spacing[4],
	minWidth: 0,
	'& > *': { flex: '1 1 12rem', minWidth: 0 },
});

const Actions = styled('div')({
	display: 'flex',
	flex: '1 1 auto',
	flexWrap: 'wrap',
	alignItems: 'center',
	justifyContent: 'flex-end',
	gap: spacing[2],
});

/**
 * A `form` with the `search` role named by `label`. The fields apply as they change; pressing Enter in one of them
 * does not reload the page (`onSubmit` still runs, after the default is prevented).
 */
export const FilterBar = ({
	label,
	children,
	actions,
	onClear,
	onSubmit,
	labels,
	...attributes
}: FilterBarProps): ReactElement => {
	const texts: FilterBarLabels = useComponentLabels('filterBar', defaultFilterBarLabels, labels);

	const submit = (event: SubmitEvent<HTMLFormElement>): void => {
		event.preventDefault();
		onSubmit?.(event);
	};

	return (
		<Root {...attributes} role='search' aria-label={label} onSubmit={submit}>
			<Fields>{children}</Fields>

			{actions === undefined && onClear === undefined ? null : (
				<Actions>
					{onClear === undefined ? null : (
						<Button type='button' variant='ghost' onClick={onClear}>
							{texts.clear}
						</Button>
					)}

					{actions}
				</Actions>
			)}
		</Root>
	);
};
