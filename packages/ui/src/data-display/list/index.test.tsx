// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { List, ListItem } from '@/src/data-display/list/index';

afterEach((): void => {
	cleanup();
});

describe('List', (): void => {
	it('is a semantic list whose items hold their title, description and slots', async (): Promise<void> => {
		const { container } = render(
			<List aria-label='Team'>
				<ListItem
					title='Ana Souza'
					description='Designer'
					leading={<span>AS</span>}
					trailing={<a href='#ana'>Profile</a>}
				/>

				<ListItem title='Bruno Lima' />
			</List>,
		);

		const list: HTMLElement = screen.getByRole('list', { name: 'Team' });
		const [first] = within(list).getAllByRole('listitem');

		expect(list.tagName).toBe('UL');
		expect(within(list).getAllByRole('listitem')).toHaveLength(2);
		expect(first?.textContent).toBe('ASAna SouzaDesignerProfile');
		await expectNoAxeViolations(container);
	});

	it('renders an ordered list and can drop the dividers', (): void => {
		render(
			<List ordered divided={false}>
				<ListItem title='First' />
				<ListItem title='Second' />
			</List>,
		);

		const list: HTMLElement = screen.getByRole('list');

		expect(list.tagName).toBe('OL');
		expect(styleRulesOf(list).join('')).not.toContain('border-top');
	});
});
