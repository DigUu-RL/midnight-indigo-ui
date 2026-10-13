// Server Component composing the essential components. They are Client Components, rendered here with serializable
// props only; interactive state (the filters) lives in a small Client Component of its own.
import {
	Avatar,
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	Carousel,
	Divider,
	Icon,
	IconButton,
	ProgressBar,
	Skeleton,
} from '@midnight-indigo/ui';
import type { ReactElement } from 'react';

import { FilterChips } from '#src/app/filter-chips.tsx';

// Icons are slots: any SVG fits, here through the library's `Icon`. Inside a named control they are decorative.
const plusIcon: ReactElement = (
	<Icon decorative>
		<path d='M11 5h2v14h-2zM5 11h14v2H5z' />
	</Icon>
);

const bellIcon: ReactElement = (
	<Icon decorative>
		<path d='M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 0 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1z' />
	</Icon>
);

export const ComponentsShowcase = (): ReactElement => {
	return (
		<Card as='section' variant='elevated'>
			<CardHeader
				title='Components'
				subtitle='Buttons, chips, badges, progress and a carousel, all styled by the theme variables.'
				headingLevel={2}
				avatar={<Avatar name='Midnight Indigo' intent='official' decorative />}
				action={
					<Badge content={3} decorative>
						<IconButton label='Notifications, 3 unread'>{bellIcon}</IconButton>
					</Badge>
				}
			/>

			<CardContent>
				<div className='row'>
					<Button intent='official' variant='solid' startIcon={plusIcon}>
						New report
					</Button>

					<Button>Export</Button>

					<Button intent='error' variant='outline'>
						Delete
					</Button>

					<Button variant='ghost' loading>
						Saving
					</Button>

					<Button disabled>Unavailable</Button>
				</div>
			</CardContent>

			<Divider decorative />

			<CardContent>
				<FilterChips />
			</CardContent>

			<CardContent>
				<div className='stack'>
					<ProgressBar label='Monthly goal' value={68} valueText='68% of the monthly goal' />
					<ProgressBar label='Synchronizing' intent='info' />
				</div>
			</CardContent>

			<CardContent>
				<div className='row' role='group' aria-busy='true' aria-label='Loading the team'>
					<Skeleton shape='circle' />
					<Skeleton width='12rem' />
				</div>
			</CardContent>

			<Carousel label='Highlights'>
				<p className='slide'>Revenue grew 12% this month.</p>
				<p className='slide'>Three new teams joined the workspace.</p>
				<p className='slide'>Churn is at its lowest in a year.</p>
			</Carousel>
		</Card>
	);
};
