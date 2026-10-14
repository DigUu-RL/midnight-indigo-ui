// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { SubmitEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { FilterBar } from '#src/dashboard/filter-bar/index.tsx';
import { SearchField } from '#src/forms/search-field/index.tsx';
import { ComponentLabelsProvider } from '#src/shared/component-labels/index.tsx';

afterEach(cleanup);

describe('FilterBar', (): void => {
	it('is a search landmark named by its label, with the fields and actions', async (): Promise<void> => {
		const { container } = render(
			<FilterBar label='Filters' actions={<button type='button'>Save view</button>}>
				<SearchField label='Customer' />
			</FilterBar>,
		);

		const search: HTMLElement = screen.getByRole('search', { name: 'Filters' });

		expect(search.tagName).toBe('FORM');
		expect(screen.getByRole('searchbox', { name: 'Customer' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Save view' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull();
		await expectNoAxeViolations(container);
	});

	it('does not reload the page when Enter is pressed in a field', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onSubmit: Mock<(event: SubmitEvent<HTMLFormElement>) => void> = vi.fn();

		render(
			<FilterBar label='Filters' onSubmit={onSubmit}>
				<SearchField label='Customer' />
			</FilterBar>,
		);

		await user.type(screen.getByRole('searchbox', { name: 'Customer' }), 'Ana{Enter}');

		expect(onSubmit).toHaveBeenCalledOnce();
		expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ defaultPrevented: true });
	});

	it('offers to clear the filters, with a translatable text', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onClear: Mock<() => void> = vi.fn();

		render(
			<FilterBar label='Filters' onClear={onClear}>
				<SearchField label='Customer' />
			</FilterBar>,
		);

		await user.click(screen.getByRole('button', { name: 'Clear filters' }));
		expect(onClear).toHaveBeenCalledOnce();
		cleanup();

		render(
			<ComponentLabelsProvider labels={{ filterBar: { clear: 'Limpar filtros' } }}>
				<FilterBar label='Filtros' onClear={onClear}>
					<SearchField label='Cliente' />
				</FilterBar>

				<FilterBar label='Outros filtros' onClear={onClear} labels={{ clear: 'Limpar' }}>
					<SearchField label='Loja' />
				</FilterBar>
			</ComponentLabelsProvider>,
		);

		expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Limpar' })).toBeDefined();
	});
});
