'use client';
import { Switch } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface ShipSettings {
	lights: boolean;
	gravity: boolean;
	alarm: boolean;
}

// Each switch applies at once, with no button to save, and the status region confirms the change.
export const BebopSettings = (): ReactElement => {
	const [settings, setSettings] = useState<ShipSettings>({
		lights: true,
		gravity: true,
		alarm: false,
	});

	const [status, setStatus] = useState<string>('');

	const toggle = (setting: keyof ShipSettings, name: string): ((checked: boolean) => void) => {
		return (checked: boolean): void => {
			setSettings((current: ShipSettings): ShipSettings => ({ ...current, [setting]: checked }));
			setStatus(`${name} ${checked ? 'on' : 'off'}.`);
		};
	};

	return (
		<Stack gap='3'>
			<Switch
				label='Cabin lights'
				checked={settings.lights}
				onCheckedChange={toggle('lights', 'Cabin lights')}
			/>

			<Switch
				label='Artificial gravity'
				description='Off saves fuel, but the crew floats.'
				checked={settings.gravity}
				onCheckedChange={toggle('gravity', 'Artificial gravity')}
			/>

			<Switch
				label='Proximity alarm'
				checked={settings.alarm}
				onCheckedChange={toggle('alarm', 'Proximity alarm')}
			/>

			<p role='status' style={{ margin: 0 }}>
				{status}
			</p>
		</Stack>
	);
};
