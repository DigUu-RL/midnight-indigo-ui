// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { PageHeader } from '@/src/dashboard/page-header/index';

afterEach(cleanup);

describe('PageHeader', (): void => {
	it('titles the page with a level 1 heading, a description and actions', async (): Promise<void> => {
		const { container } = render(
			<PageHeader
				title='Sales overview'
				description='Orders and revenue of every store.'
				actions={<button type='button'>Export</button>}
			/>,
		);

		expect(screen.getByRole('heading', { level: 1, name: 'Sales overview' })).toBeDefined();
		expect(screen.getByText('Orders and revenue of every store.').tagName).toBe('P');
		expect(screen.getByRole('button', { name: 'Export' })).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('takes another heading level and renders only what it is given', (): void => {
		const { container } = render(<PageHeader title='Settings' headingLevel={2} />);

		expect(screen.getByRole('heading', { level: 2, name: 'Settings' })).toBeDefined();
		expect(container.querySelector('p')).toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
	});
});
