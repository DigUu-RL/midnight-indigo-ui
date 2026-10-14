// Many components at once: a grid of cards, each with about ten components (avatar, badge, icon button with a tooltip,
// text field, switch, checkbox, chip, button and progress bar). "Refresh all" renders every card again with new
// values, the worst case of an update that reaches the whole page.
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import {
	Avatar,
	Badge,
	Card,
	CardContent,
	CardHeader,
	Chip,
} from '@midnight-indigo/ui/data-display';
import { ProgressBar, Tooltip } from '@midnight-indigo/ui/feedback';
import { Checkbox, Switch, TextField } from '@midnight-indigo/ui/forms';
import { useState } from 'react';
import type { ReactElement } from 'react';

interface ComponentsScenarioProps {
	cardCount: number;
}

interface PanelProps {
	index: number;
	revision: number;
}

const bellIcon: ReactElement = (
	<svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
		<path d='M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 0 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1z' />
	</svg>
);

const Panel = ({ index, revision }: PanelProps): ReactElement => {
	const name: string = `Team ${String(index + 1)}`;
	const unread: number = (index + revision) % 10;

	return (
		<Card as='section' aria-label={name}>
			<CardHeader
				title={name}
				subtitle={`Revision ${String(revision)}`}
				avatar={<Avatar name={name} decorative />}
				action={
					<Badge content={unread} decorative>
						<Tooltip content={`${String(unread)} unread`}>
							<IconButton label={`Notifications of ${name}`}>{bellIcon}</IconButton>
						</Tooltip>
					</Badge>
				}
			/>

			<CardContent>
				<TextField label={`Owner of ${name}`} name={`owner-${String(index)}`} />
				<Switch label={`Alerts of ${name}`} name={`alerts-${String(index)}`} />
				<Checkbox label={`Archive ${name}`} name={`archive-${String(index)}`} />
				<Chip label={revision % 2 === 0 ? 'Active' : 'Paused'} />
				<Button>Open {name}</Button>

				<ProgressBar
					label={`Goal of ${name}`}
					value={(index * 7 + revision) % 100}
					valueText={`${String((index * 7 + revision) % 100)}% of the goal`}
				/>
			</CardContent>
		</Card>
	);
};

export const ComponentsScenario = ({ cardCount }: ComponentsScenarioProps): ReactElement => {
	const [revision, setRevision] = useState<number>(0);

	return (
		<>
			<Button
				onClick={(): void => {
					setRevision((current: number): number => current + 1);
				}}
			>
				Refresh all
			</Button>

			<div
				style={{
					display: 'grid',
					gap: '1rem',
					gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
					marginBlockStart: '1rem',
				}}
			>
				{Array.from({ length: cardCount }, (_: unknown, index: number): ReactElement => {
					return <Panel key={index} index={index} revision={revision} />;
				})}
			</div>
		</>
	);
};
