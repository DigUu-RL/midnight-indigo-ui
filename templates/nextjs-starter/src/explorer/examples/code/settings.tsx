import { Code } from '@midnight-indigo/ui/code';
import type { ReactElement } from 'react';

interface Setting {
	name: string;
	value: string;
	description: string;
}

const settings: readonly Setting[] = [
	{ name: 'maxPassengers', value: '6', description: 'Seats of the Millennium Falcon.' },
	{ name: 'hyperdriveClass', value: '0.5', description: 'Lower is faster.' },
	{
		name: 'copilot',
		value: "'Chewbacca'",
		description: 'Takes the controls when Han Solo cannot.',
	},
];

export const ShipSettings = (): ReactElement => {
	return (
		<dl style={{ display: 'grid', gap: '0.75rem', width: '100%', maxWidth: '32rem', margin: 0 }}>
			{settings.map((setting: Setting): ReactElement => {
				return (
					<div key={setting.name}>
						<dt>
							<Code>{setting.name}</Code> = <Code>{setting.value}</Code>
						</dt>

						<dd style={{ margin: 0 }}>{setting.description}</dd>
					</div>
				);
			})}
		</dl>
	);
};
