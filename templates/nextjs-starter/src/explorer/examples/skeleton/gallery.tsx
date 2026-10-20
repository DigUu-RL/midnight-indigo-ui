import { Skeleton } from '@midnight-indigo/ui/data-display';
import { Grid, Stack } from '@midnight-indigo/ui/layout';
import type { ReactElement } from 'react';

const placeholders: readonly string[] = ['first', 'second', 'third'];

export const PlanetGalleryPlaceholder = (): ReactElement => {
	return (
		<section aria-label='Planets' aria-busy='true' style={{ width: '100%' }}>
			<Grid minColumnWidth='10rem' gap='4'>
				{placeholders.map((placeholder: string): ReactElement => {
					return (
						<Stack key={placeholder} gap='2'>
							<Skeleton shape='rectangle' height='7rem' />
							<Skeleton width='60%' />
						</Stack>
					);
				})}
			</Grid>
		</section>
	);
};
