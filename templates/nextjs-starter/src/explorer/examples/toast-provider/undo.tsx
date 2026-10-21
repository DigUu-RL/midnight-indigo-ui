'use client';
import { Chip } from '@midnight-indigo/ui/data-display';
import { useToast } from '@midnight-indigo/ui/feedback';
import type { ToastApi } from '@midnight-indigo/ui/feedback';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

const bebopCrew: readonly string[] = [
	'Spike Spiegel',
	'Jet Black',
	'Faye Valentine',
	'Edward Wong',
];

// The member leaves at once and the toast offers to undo it; with an action, it stays at least 10 seconds.
export const CrewRemoval = (): ReactElement => {
	const toast: ToastApi = useToast();
	const [crew, setCrew] = useState<readonly string[]>(bebopCrew);

	const restore = (member: string): void => {
		setCrew((current: readonly string[]): readonly string[] => {
			return bebopCrew.filter((name: string): boolean => {
				return name === member || current.includes(name);
			});
		});
	};

	const remove = (member: string): void => {
		setCrew((current: readonly string[]): readonly string[] => {
			return current.filter((name: string): boolean => name !== member);
		});

		toast.show({
			id: `crew-removal-${member}`,
			title: 'Removed from the crew',
			message: `${member} no longer flies on the Bebop.`,
			action: {
				label: 'Undo',
				onAction: (): void => {
					restore(member);
				},
			},
		});
	};

	return (
		<Stack direction='row' gap='2' wrap role='group' aria-label='Crew of the Bebop'>
			{crew.map((member: string): ReactElement => {
				return (
					<Chip
						key={member}
						label={member}
						deleteLabel={`Remove ${member} from the crew`}
						onDelete={(): void => {
							remove(member);
						}}
					/>
				);
			})}
		</Stack>
	);
};
