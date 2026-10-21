'use client';
import {
	ErrorSummary,
	FormActions,
	Select,
	SubmitButton,
	TextField,
} from '@midnight-indigo/ui/forms';
import type { ErrorSummaryItem, SelectOption } from '@midnight-indigo/ui/forms';
import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';

const ships: readonly SelectOption[] = [
	{ value: 'bebop', label: 'Bebop' },
	{ value: 'swordfish', label: 'Swordfish II' },
	{ value: 'redtail', label: 'Red Tail' },
];

interface MissionErrors {
	callsign?: string;
	ship?: string;
}

const isBlank = (value: FormDataEntryValue | null): boolean => {
	return typeof value !== 'string' || value.trim() === '';
};

const errorsOf = (data: FormData): MissionErrors => {
	return {
		...(isBlank(data.get('callsign')) ? { callsign: 'Enter the callsign of the hunter.' } : {}),
		...(isBlank(data.get('ship')) ? { ship: 'Choose the ship of the mission.' } : {}),
	};
};

// A form that validates on its own, without `Form`: the summary takes focus at each submission (`focusKey`), and each
// link moves focus to its field by its id.
export const MissionBriefing = (): ReactElement => {
	const [errors, setErrors] = useState<MissionErrors>({});
	const [attempts, setAttempts] = useState<number>(0);

	const items: ErrorSummaryItem[] = [
		...(errors.callsign === undefined
			? []
			: [{ targetId: 'mission-callsign', message: errors.callsign }]),
		...(errors.ship === undefined ? [] : [{ targetId: 'mission-ship', message: errors.ship }]),
	];

	return (
		<form
			noValidate
			aria-label='Mission briefing'
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				width: '100%',
				maxWidth: '24rem',
			}}
			onSubmit={(event: SubmitEvent<HTMLFormElement>): void => {
				event.preventDefault();
				setErrors(errorsOf(new FormData(event.currentTarget)));
				setAttempts(attempts + 1);
			}}
		>
			{attempts === 0 ? null : <ErrorSummary errors={items} focusKey={attempts} />}
			<TextField id='mission-callsign' label='Callsign' name='callsign' error={errors.callsign} />

			<Select
				id='mission-ship'
				label='Ship'
				name='ship'
				placeholder='Choose a ship'
				options={ships}
				error={errors.ship}
			/>

			<FormActions>
				<SubmitButton>Start the mission</SubmitButton>
			</FormActions>
		</form>
	);
};
