'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { ProgressBar } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

const parts: number = 5;

export const BountyReportUpload = (): ReactElement => {
	// The parts sent, or `null` before the report is sent.
	const [sent, setSent] = useState<number | null>(null);

	useEffect((): (() => void) | undefined => {
		if (sent === null || sent === parts) return undefined;

		const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
			setSent(sent + 1);
		}, 600);

		return (): void => {
			clearTimeout(timer);
		};
	}, [sent]);

	return (
		<Stack gap='3' align='start' style={{ width: '100%', maxWidth: '24rem' }}>
			<Button
				loading={sent !== null && sent < parts}
				onClick={(): void => {
					setSent(0);
				}}
			>
				Send the bounty report
			</Button>

			{sent === null ? null : (
				<ProgressBar
					label='Sending the bounty report'
					value={sent}
					max={parts}
					valueText={`Part ${String(sent)} of ${String(parts)}`}
					intent={sent === parts ? 'success' : 'official'}
					style={{ alignSelf: 'stretch' }}
				/>
			)}

			{sent === parts ? <p style={{ margin: 0 }}>Report sent to the ISSP.</p> : null}
		</Stack>
	);
};
