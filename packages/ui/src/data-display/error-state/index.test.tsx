// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { ErrorState } from '#src/data-display/error-state/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('ErrorState', (): void => {
	it('is announced as an alert, with a retry button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleRetry = vi.fn();

		const { container } = render(
			<ErrorState
				title='The reports could not be loaded'
				description='Server unavailable.'
				onRetry={handleRetry}
			/>,
		);

		const alert: HTMLElement = screen.getByRole('alert');

		expect(alert.textContent).toContain('The reports could not be loaded');
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(handleRetry).toHaveBeenCalledOnce();
		await expectNoAxeViolations(container);
	});

	it('can stay silent, translate the retry text or take its own action', (): void => {
		const { rerender } = render(
			<ErrorState
				title='Falha'
				announce={false}
				onRetry={(): void => undefined}
				labels={{ retry: 'Tentar de novo' }}
			/>,
		);

		expect(screen.queryByRole('alert')).toBeNull();
		expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeDefined();

		rerender(
			<ErrorState
				title='Falha'
				onRetry={(): void => undefined}
				action={<a href='#status'>Status</a>}
			/>,
		);

		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByRole('link', { name: 'Status' })).toBeDefined();
	});
});
