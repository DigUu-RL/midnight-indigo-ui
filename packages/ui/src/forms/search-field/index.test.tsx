// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { SearchField } from '#src/forms/search-field/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('SearchField', (): void => {
	it('is a search box with a clear button while it has text', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleValue = vi.fn();

		const { container } = render(
			<SearchField label='Search reports' onValueChange={handleValue} />,
		);

		const input: HTMLElement = screen.getByRole('searchbox', { name: 'Search reports' });

		expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
		await user.type(input, 'sales');
		await user.click(screen.getByRole('button', { name: 'Clear search' }));

		expect(input).toHaveProperty('value', '');
		expect(handleValue).toHaveBeenLastCalledWith('');
		expect(document.activeElement).toBe(input);
		await expectNoAxeViolations(container);
	});

	it('clears with Escape, also when controlled', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const Controlled = (): ReactElement => {
			const [value, setValue] = useState<string>('north');
			return <SearchField label='Region' value={value} onValueChange={setValue} />;
		};

		render(<Controlled />);
		const input: HTMLElement = screen.getByRole('searchbox', { name: 'Region' });
		await user.click(input);
		await user.keyboard('{Escape}');

		expect(input).toHaveProperty('value', '');
	});
});
