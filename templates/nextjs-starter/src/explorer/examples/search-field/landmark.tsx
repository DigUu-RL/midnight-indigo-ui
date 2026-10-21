'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { SearchField } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useEffect, useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

// `role='search'` makes the form a landmark; the button beside the field names it, so the label is hidden from sight
// only. The field shows `loading` while the archive answers.
export const ArchiveSearch = (): ReactElement => {
	const [query, setQuery] = useState<string>('');
	const [searching, setSearching] = useState<string | null>(null);
	const [result, setResult] = useState<string | null>(null);

	useEffect((): (() => void) | undefined => {
		if (searching === null) return undefined;

		const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
			setResult(`3 Jedi archive records match “${searching}”.`);
			setSearching(null);
		}, 800);

		return (): void => {
			clearTimeout(timer);
		};
	}, [searching]);

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '28rem' }}>
			<form
				role='search'
				onSubmit={(event: SubmitEvent<HTMLFormElement>): void => {
					event.preventDefault();
					if (query.trim() === '') return;
					setResult(null);
					setSearching(query.trim());
				}}
			>
				<Stack direction='row' gap='2' align='end'>
					<SearchField
						label='Search the archive'
						hideLabel
						placeholder='Kamino'
						value={query}
						onValueChange={setQuery}
						loading={searching !== null}
						style={{ flex: '1 1 auto' }}
					/>

					<Button type='submit'>Search</Button>
				</Stack>
			</form>

			<p role='status' style={{ margin: 0 }}>
				{result}
			</p>
		</Stack>
	);
};
