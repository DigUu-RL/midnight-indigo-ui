// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { declarationsOf, expectNoAxeViolations } from '#test/component-harness.ts';
import { Icon } from '#src/icons/icon/index.tsx';
import { IconButton } from '#src/buttons/icon-button/index.tsx';

const plusIcon: ReactElement = <path d='M11 5h2v14h-2zM5 11h14v2H5z' />;

afterEach((): void => {
	cleanup();
});

describe('IconButton', (): void => {
	it('is named by its label and hides its icon', async (): Promise<void> => {
		const { container } = render(
			<IconButton label='Add item'>
				<Icon decorative>{plusIcon}</Icon>
			</IconButton>,
		);

		const button: HTMLElement = screen.getByRole('button', { name: 'Add item' });

		expect(button.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
		await expectNoAxeViolations(container);
	});

	it('rejects a blank label', (): void => {
		expect((): void => {
			render(<IconButton label=' '>{plusIcon}</IconButton>);
		}).toThrow(/label of an IconButton cannot be blank/);
	});

	it('is square at every size and ignores activation while loading', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleClick = vi.fn();

		render(
			<IconButton label='Refresh' size='small' loading onClick={handleClick}>
				{plusIcon}
			</IconButton>,
		);

		const button: HTMLElement = screen.getByRole('button', { name: 'Refresh' });
		await user.click(button);

		expect(declarationsOf(button, '&')).toContain('width:var(--mi-control-height-small);');
		expect(declarationsOf(button, '&')).toContain('min-height:var(--mi-control-height-small);');
		expect(button.getAttribute('aria-busy')).toBe('true');
		expect(handleClick).not.toHaveBeenCalled();
	});
});
