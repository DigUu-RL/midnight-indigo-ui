'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { FormActions } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const steps: readonly string[] = ['Target', 'Crew', 'Route', 'Review'];

// The steps of a long form: `space-between` sets the way back at the start of the row and the way forward at its end,
// in the order of the source, which is also the order of Tab.
export const BountySteps = (): ReactElement => {
	const [step, setStep] = useState<number>(0);

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '32rem' }}>
			<p role='status' style={{ margin: 0 }}>
				Step {step + 1} of {steps.length}: {steps[step]}
			</p>

			<FormActions align='space-between'>
				<Button
					variant='ghost'
					disabled={step === 0}
					onClick={(): void => {
						setStep(step - 1);
					}}
				>
					Back
				</Button>

				<Button
					intent='official'
					variant='solid'
					disabled={step === steps.length - 1}
					onClick={(): void => {
						setStep(step + 1);
					}}
				>
					Next
				</Button>
			</FormActions>
		</Stack>
	);
};
