// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '../../../test/component-harness.ts';
import { Chip } from './index.tsx';
import type { ChipVariant } from './index.tsx';

const variants: readonly ChipVariant[] = ['solid', 'soft', 'outline'];

afterEach((): void => {
	cleanup();
});

describe('Chip', (): void => {
	it('is plain text unless it has an action', async (): Promise<void> => {
		const { container } = render(<Chip label='Draft' />);

		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByText('Draft')).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('is a toggle button when selectable, marked by a check mark and not by color alone', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleClick = vi.fn();

		const { container, rerender } = render(
			<Chip label='Open' selected={false} onClick={handleClick} />,
		);

		const toggle: HTMLElement = screen.getByRole('button', { name: 'Open', pressed: false });
		expect(toggle.querySelector('svg')).toBeNull();

		await user.tab();
		await user.keyboard(' ');
		expect(handleClick).toHaveBeenCalledTimes(1);

		rerender(<Chip label='Open' selected onClick={handleClick} />);

		const selected: HTMLElement = screen.getByRole('button', { name: 'Open', pressed: true });
		expect(selected.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
		await expectNoAxeViolations(container);
	});

	it('has a named delete button, also reachable with Backspace and Delete', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleDelete = vi.fn();

		const { container } = render(
			<Chip
				label='Status: open'
				onClick={(): void => undefined}
				onDelete={handleDelete}
				deleteLabel='Remove Status: open'
			/>,
		);

		await user.click(screen.getByRole('button', { name: 'Remove Status: open' }));
		await user.tab({ shift: true });
		await user.keyboard('{Backspace}');
		await user.keyboard('{Delete}');

		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Status: open' }));
		expect(handleDelete).toHaveBeenCalledTimes(3);
		await expectNoAxeViolations(container);
	});

	it('disables both of its buttons', (): void => {
		render(
			<Chip
				label='Archived'
				disabled
				onClick={(): void => undefined}
				onDelete={(): void => undefined}
				deleteLabel='Remove Archived'
			/>,
		);

		const buttons: HTMLElement[] = screen.getAllByRole('button');

		expect(buttons).toHaveLength(2);

		expect(buttons.every((button: HTMLElement): boolean => button.hasAttribute('disabled'))).toBe(
			true,
		);
	});

	it('rejects a blank delete label', (): void => {
		expect((): void => {
			render(<Chip label='Tag' onDelete={(): void => undefined} deleteLabel='' />);
		}).toThrow(/deleteLabel of a Chip cannot be blank/);
	});

	it('keeps the same visual states (regression)', (): void => {
		const chips: ReactElement[] = variants.map((variant: ChipVariant): ReactElement => {
			return (
				<Chip
					key={variant}
					label={`success ${variant}`}
					intent='success'
					variant={variant}
					data-testid='chip'
				/>
			);
		});

		render(
			<>
				{chips}
				<Chip label='clickable' onClick={(): void => undefined} data-testid='chip' />
				<Chip label='disabled' disabled data-testid='chip' />
				<Chip label='small' size='small' data-testid='chip' />
			</>,
		);

		const snapshot: Record<string, string[]> = Object.fromEntries(
			screen.getAllByTestId('chip').map((chip: HTMLElement): [string, string[]] => {
				return [chip.textContent, styleRulesOf(chip)];
			}),
		);

		expect(snapshot).toMatchSnapshot();
	});
});
