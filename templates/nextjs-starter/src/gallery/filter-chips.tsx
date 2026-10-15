'use client';
// Selectable and removable chips: the state of the filters belongs to the application, not to the chips.
import { Chip } from '@midnight-indigo/ui/data-display';
import { useState } from 'react';
import type { ReactElement } from 'react';

const statuses: readonly string[] = ['Open', 'In review', 'Closed'];

export const FilterChips = (): ReactElement => {
	const [selected, setSelected] = useState<readonly string[]>(['Open']);
	const [tags, setTags] = useState<readonly string[]>(['Finance', 'Q3']);

	const toggle = (status: string): void => {
		setSelected((current: readonly string[]): readonly string[] => {
			return current.includes(status)
				? current.filter((item: string): boolean => item !== status)
				: [...current, status];
		});
	};

	const remove = (tag: string): void => {
		setTags((current: readonly string[]): readonly string[] => {
			return current.filter((item: string): boolean => item !== tag);
		});
	};

	return (
		<div className='row' role='group' aria-label='Filters'>
			{statuses.map((status: string): ReactElement => {
				return (
					<Chip
						key={status}
						label={status}
						selected={selected.includes(status)}
						onClick={(): void => {
							toggle(status);
						}}
					/>
				);
			})}

			{tags.map((tag: string): ReactElement => {
				return (
					<Chip
						key={tag}
						label={tag}
						intent='info'
						variant='outline'
						onDelete={(): void => {
							remove(tag);
						}}
						deleteLabel={`Remove ${tag}`}
					/>
				);
			})}
		</div>
	);
};
