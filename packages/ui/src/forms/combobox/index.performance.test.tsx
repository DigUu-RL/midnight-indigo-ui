// @vitest-environment jsdom
// The combobox with many options: opening and typing render at most `maxVisibleOptions`, whatever the number of options.
// Times are measured in the browser suite (fixtures/browser); here, the work.
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { createOptionLabels } from '#test/large-datasets.ts';
import { Combobox } from '#src/forms/combobox/index.tsx';
import type { ComboboxOption } from '#src/forms/combobox/index.tsx';

const createOptions = (count: number): ComboboxOption[] => {
	return createOptionLabels(count).map((label: string, index: number): ComboboxOption => {
		return { value: String(index + 1), label };
	});
};

afterEach((): void => {
	cleanup();
});

describe('Combobox with 100 000 options', (): void => {
	const options: ComboboxOption[] = createOptions(100_000);

	it('renders 100 options when the list opens', (): void => {
		render(<Combobox label='Product' options={options} />);
		const input: HTMLElement = screen.getByRole('combobox', { name: 'Product' });

		fireEvent.keyDown(input, { key: 'ArrowDown' });

		expect(screen.getAllByRole('option')).toHaveLength(100);

		expect(screen.getByRole('status').textContent).toBe(
			'Showing 100 of 100000 options. Type to narrow the list.',
		);
	});

	it('keeps rendering at most 100 options while the user types', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<Combobox label='Product' options={options} />);
		const input: HTMLElement = screen.getByRole('combobox', { name: 'Product' });

		for (const typed of ['P', 'roduct 1', '2', '3']) {
			await user.type(input, typed);
			expect(screen.getAllByRole('option').length).toBeLessThanOrEqual(100);
		}

		expect(screen.getAllByRole('option')[0]?.textContent).toMatch(/^Product 123\b/);
	});
});
