'use client';
import { FormField } from '@midnight-indigo/ui/forms';
import type { FormFieldControlProps } from '@midnight-indigo/ui/forms';
import { useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

// A control the library does not have, a color picker, gets the label and the description of a field.
export const HullPaint = (): ReactElement => {
	const [color, setColor] = useState<string>('#3a5ba0');

	return (
		<FormField label='Hull paint' description={`The Swordfish II will be painted ${color}.`}>
			{(control: FormFieldControlProps): ReactElement => {
				return (
					<input
						{...control}
						type='color'
						name='hull'
						value={color}
						onChange={(event: ChangeEvent<HTMLInputElement>): void => {
							setColor(event.currentTarget.value);
						}}
					/>
				);
			}}
		</FormField>
	);
};
