'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Card, CardContent, CardHeader, Carousel } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface Stop {
	planet: string;
	task: string;
}

const route: readonly Stop[] = [
	{ planet: 'Corneria', task: 'Take off with the Arwing squadron.' },
	{ planet: 'Fortuna', task: 'Defend the base from the Star Wolf team.' },
	{ planet: 'Venom', task: 'Reach Andross before the shields close.' },
];

export const FlightRoute = (): ReactElement => {
	const [stop, setStop] = useState<number>(0);
	const current: Stop | undefined = route[stop];

	return (
		<Stack gap='3' style={{ width: '100%', maxWidth: '28rem' }}>
			<Carousel label='Flight route of Fox McCloud' index={stop} onIndexChange={setStop}>
				{route.map((entry: Stop): ReactElement => {
					return (
						<Card key={entry.planet}>
							<CardHeader title={entry.planet} headingLevel={4} />
							<CardContent>{entry.task}</CardContent>
						</Card>
					);
				})}
			</Carousel>

			<Stack direction='row' gap='2' align='center' justify='between' wrap>
				<span>{`Current stop: ${current?.planet ?? ''}`}</span>

				<Button
					variant='ghost'
					size='small'
					disabled={stop === 0}
					onClick={(): void => {
						setStop(0);
					}}
				>
					Back to Corneria
				</Button>
			</Stack>
		</Stack>
	);
};
