'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { ErrorSummary } from '@midnight-indigo/ui/forms';
import type { ErrorSummaryItem } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// Returned by the customs of Ganymede: their problems have no field on this page, so the links lead nowhere.
const problems: readonly ErrorSummaryItem[] = [
	{ message: 'Crate 7 has no declared contents.' },
	{ message: 'The weight of crate 12 exceeds 500 kg.' },
];

// The problems of a check outside the form, under a heading of the level of its section and with a title of its own.
export const CargoManifest = (): ReactElement => {
	const [checks, setChecks] = useState<number>(0);

	return (
		<Stack gap='4' align='start' style={{ width: '100%', maxWidth: '28rem' }}>
			<Button
				onClick={(): void => {
					setChecks(checks + 1);
				}}
			>
				Check the manifest
			</Button>

			{checks === 0 ? null : (
				<ErrorSummary
					errors={problems}
					focusKey={checks}
					headingLevel={3}
					labels={{
						title: (count: number): string => {
							return count === 1
								? 'Customs rejected 1 crate'
								: `Customs rejected ${String(count)} crates`;
						},
					}}
				/>
			)}
		</Stack>
	);
};
