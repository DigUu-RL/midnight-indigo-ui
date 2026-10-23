// The profile form: native constraints and the custom check block the submission, the errors are announced and fixed,
// and a valid submission reports success.
import type { Locator } from '@playwright/test';

import { expect, test } from '@/test/support/fixtures';

test('blocks an invalid submission, then saves once every error is fixed', async ({
	page,
}): Promise<void> => {
	await page.goto('/gallery');

	const form: Locator = page.locator('form').filter({ has: page.getByLabel('Full name') });
	const name: Locator = form.getByLabel('Full name');
	const email: Locator = form.getByLabel('Email address');

	await form.getByRole('button', { name: 'Save profile' }).click();

	// The error summary takes focus, so its title (the number of problems) is read at once.
	await expect(page.locator(':focus')).toContainText(/There are \d+ problems with this form/);
	await expect(name).toHaveAttribute('aria-invalid', 'true');

	await name.fill('Ana Souza');
	await email.fill('ana@example.org');
	await form.getByRole('combobox', { name: 'Team' }).selectOption('finance');
	await form.getByRole('checkbox', { name: 'I accept the terms of use' }).check();
	await form.getByRole('button', { name: 'Save profile' }).click();

	await expect(email).toHaveAttribute('aria-invalid', 'true');
	await expect(form.getByText('Use your company address, ending in .com.').first()).toBeVisible();

	await email.fill('ana@example.com');
	await form.getByRole('button', { name: 'Save profile' }).click();

	await expect(form.getByText('Profile saved.')).toBeVisible();
	await expect(email).not.toHaveAttribute('aria-invalid', 'true');
});
