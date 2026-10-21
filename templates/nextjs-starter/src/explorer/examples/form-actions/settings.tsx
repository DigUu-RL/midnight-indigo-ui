'use client';
import { Button } from '@midnight-indigo/ui/buttons';
import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import { Form, FormActions, SubmitButton, Switch } from '@midnight-indigo/ui/forms';
import type { ReactElement } from 'react';

// The end of a card of settings: the main action comes first, so it is the first one Tab reaches, and `end` sets the
// row under the right edge of the fields.
export const AlertSettings = (): ReactElement => {
	return (
		<Card style={{ width: '100%', maxWidth: '28rem' }}>
			<CardHeader title='Bounty alerts' subtitle='Jet Black' />

			<CardContent>
				<Form successMessage='Alerts saved.' aria-label='Bounty alerts'>
					<Switch label='New bounties on Mars' name='mars' defaultChecked />
					<Switch label='Bounties over 10 million woolongs' name='large' />

					<FormActions align='end'>
						<SubmitButton>Save</SubmitButton>

						<Button variant='ghost' type='reset'>
							Discard changes
						</Button>
					</FormActions>
				</Form>
			</CardContent>
		</Card>
	);
};
