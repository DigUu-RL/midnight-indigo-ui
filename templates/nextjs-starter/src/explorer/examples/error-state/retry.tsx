'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { ErrorState, List, ListItem, SkeletonList } from '@midnight-indigo/ui/data-display';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

type BoardStatus = 'error' | 'loading' | 'ready';

const bounties: readonly string[] = ['Asimov Solensan', 'Mad Pierrot', 'Teddy Bomber'];

export const BountyBoardError = (): ReactElement => {
	const [status, setStatus] = useState<BoardStatus>('error');

	// The first error is on the page from the start; one that follows an action is announced.
	const [failedAgain, setFailedAgain] = useState<boolean>(false);

	const retry = (): void => {
		setStatus('loading');

		setTimeout((): void => {
			setStatus('ready');
		}, 1500);
	};

	return (
		<section
			aria-label='Bounty board'
			aria-busy={status === 'loading'}
			style={{ width: '100%', maxWidth: '28rem' }}
		>
			{status === 'error' ? (
				<ErrorState
					announce={failedAgain}
					title='The bounty board could not be loaded'
					description='The relay of Ganymede is not answering. Your bounties are safe.'
					onRetry={retry}
				/>
			) : null}

			{status === 'loading' ? <SkeletonList items={3} label='Loading the bounties' /> : null}

			{status === 'ready' ? (
				<Stack gap='3' align='start'>
					<List aria-label='Bounties' style={{ alignSelf: 'stretch' }}>
						{bounties.map((bounty: string): ReactElement => {
							return <ListItem key={bounty} title={bounty} />;
						})}
					</List>

					<Button
						variant='ghost'
						size='small'
						onClick={(): void => {
							setFailedAgain(true);
							setStatus('error');
						}}
					>
						Lose the signal
					</Button>
				</Stack>
			) : null}
		</section>
	);
};
