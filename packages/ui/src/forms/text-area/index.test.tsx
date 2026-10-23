// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, declarationsOf } from '@/test/component-harness';
import { TextArea } from '@/src/forms/text-area/index';

afterEach((): void => {
	cleanup();
});

describe('TextArea', (): void => {
	it('counts characters in a description, not in a live region', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const { container } = render(<TextArea label='Comment' showCount maxLength={20} />);
		const area: HTMLElement = screen.getByRole('textbox', { name: 'Comment' });

		await user.type(area, 'Hello');
		const counter: HTMLElement = screen.getByText('5 of 20 characters');

		expect(area.getAttribute('aria-describedby')).toContain(counter.id);
		expect(counter.closest('[aria-live], [role="status"]')).toBeNull();
		await expectNoAxeViolations(container);
	});

	it('translates the counter and sets the resize', (): void => {
		render(
			<TextArea
				label='Notas'
				resize='none'
				showCount
				defaultValue='abc'
				labels={{ characterCount: (count: number): string => `${String(count)} caracteres` }}
			/>,
		);

		expect(screen.getByText('3 caracteres')).toBeDefined();

		expect(declarationsOf(screen.getByRole('textbox', { name: 'Notas' }), '&')).toContain(
			'resize:none',
		);
	});
});
