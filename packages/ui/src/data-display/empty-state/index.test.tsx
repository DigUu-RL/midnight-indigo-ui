// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { EmptyState } from '#src/data-display/empty-state/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('EmptyState', (): void => {
	it('is static content with a title, a description and an action', async (): Promise<void> => {
		const { container } = render(
			<EmptyState
				title='No reports yet'
				description='Reports you create appear here.'
				action={<button type='button'>New report</button>}
			/>,
		);

		expect(screen.queryByRole('alert')).toBeNull();
		expect(screen.queryByRole('status')).toBeNull();
		expect(screen.getByText('No reports yet').tagName).toBe('P');
		expect(screen.getByRole('button', { name: 'New report' })).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('renders the title as a heading of the given level', (): void => {
		render(<EmptyState title='No reports yet' headingLevel={2} />);

		expect(screen.getByRole('heading', { level: 2, name: 'No reports yet' })).toBeDefined();
	});
});
