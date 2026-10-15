'use client';
// The new customer form: native constraints checked in the browser, the rest checked by a Server Action before the
// submission (an address already registered is only known to the server), every message in the language of the page.
// After saving, a toast confirms it and the form is cleared for the next customer.
import { Card, CardContent } from '@midnight-indigo/ui/data-display';
import { useToast } from '@midnight-indigo/ui/feedback';
import type { ToastApi } from '@midnight-indigo/ui/feedback';
import {
	Fieldset,
	Form,
	FormActions,
	RadioGroup,
	Select,
	SubmitButton,
	Switch,
	TextArea,
	TextField,
} from '@midnight-indigo/ui/forms';
import type { FormErrors, SelectOption } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue } from '@midnight-indigo/ui/i18n';
import type { ReactElement } from 'react';

import { createCustomer, validateCustomer } from '#src/customers/actions.ts';
import { regions } from '#src/dashboard/demo-data.ts';
import type { Region } from '#src/dashboard/demo-data.ts';
import type { LocaleSegment } from '#src/i18n/locales.ts';

interface CustomerFormProps {
	locale: LocaleSegment;
}

export const CustomerForm = ({ locale }: CustomerFormProps): ReactElement => {
	const { t }: I18nValue = useI18n();
	const toast: ToastApi = useToast();

	const save = async (data: FormData, form: HTMLFormElement): Promise<void> => {
		const customer: string = await createCustomer(locale, data);
		const name: FormDataEntryValue | null = data.get('name');

		toast.show({
			intent: 'success',
			title: t('customers.saved.title'),
			message: t('customers.saved.message', {
				name: typeof name === 'string' ? name.trim() : '',
				customer,
			}),
		});

		form.reset();
	};

	return (
		<Card>
			<CardContent>
				<Form
					validate={async (data: FormData): Promise<FormErrors> => validateCustomer(locale, data)}
					onSubmit={save}
				>
					<Fieldset legend={t('customers.form.contact')}>
						<TextField
							label={t('customers.fields.name')}
							name='name'
							autoComplete='name'
							required
						/>

						<TextField
							label={t('customers.fields.email')}
							name='email'
							type='email'
							autoComplete='email'
							description={t('customers.fields.emailDescription')}
							required
						/>

						<TextField
							label={t('customers.fields.phone')}
							name='phone'
							type='tel'
							autoComplete='tel'
							description={t('customers.fields.phoneDescription')}
						/>
					</Fieldset>

					<Fieldset legend={t('customers.form.account')}>
						<RadioGroup
							legend={t('customers.fields.type')}
							name='type'
							orientation='horizontal'
							defaultValue='individual'
							options={[
								{ value: 'individual', label: t('customers.types.individual') },
								{ value: 'company', label: t('customers.types.company') },
							]}
						/>

						<Select
							label={t('customers.fields.region')}
							name='region'
							placeholder={t('customers.fields.regionPlaceholder')}
							options={regions.map((region: Region): SelectOption => {
								return { value: region, label: t(`regions.${region}`) };
							})}
							required
						/>

						<TextArea label={t('customers.fields.notes')} name='notes' maxLength={300} showCount />

						<Switch
							label={t('customers.fields.newsletter')}
							description={t('customers.fields.newsletterDescription')}
							name='newsletter'
						/>
					</Fieldset>

					<FormActions>
						<SubmitButton>{t('customers.form.submit')}</SubmitButton>
					</FormActions>
				</Form>
			</CardContent>
		</Card>
	);
};
