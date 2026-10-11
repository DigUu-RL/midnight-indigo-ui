// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Avatar, initialsOf } from '#src/data-display/avatar/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('initialsOf', (): void => {
	it('takes the first letters of the first and last words', (): void => {
		expect(initialsOf('Ada Lovelace')).toBe('AL');
		expect(initialsOf('  grace   brewster murray hopper ')).toBe('GH');
		expect(initialsOf('Turing')).toBe('T');
		expect(initialsOf('élodie ørsted')).toBe('ÉØ');
	});
});

describe('Avatar', (): void => {
	it('names the initials fallback as an image', async (): Promise<void> => {
		const { container } = render(<Avatar name='Ada Lovelace' />);

		expect(screen.getByRole('img', { name: 'Ada Lovelace' }).textContent).toBe('AL');
		await expectNoAxeViolations(container);
	});

	it('shows the picture with the name as alternative text, and the initials if it fails', async (): Promise<void> => {
		const { container } = render(<Avatar name='Ada Lovelace' src='/ada.png' />);
		const image: HTMLElement = screen.getByRole('img', { name: 'Ada Lovelace' });

		expect(image.tagName).toBe('IMG');
		await expectNoAxeViolations(container);

		fireEvent.error(image);

		expect(screen.getByRole('img', { name: 'Ada Lovelace' }).tagName).toBe('SPAN');
		expect(container.textContent).toBe('AL');
	});

	it('is hidden when decorative', async (): Promise<void> => {
		const { container } = render(
			<p>
				<Avatar name='Ada Lovelace' decorative /> Ada Lovelace
			</p>,
		);

		expect(screen.queryByRole('img')).toBeNull();
		await expectNoAxeViolations(container);
	});

	it('keeps the same look at every size (regression)', (): void => {
		render(
			<>
				<Avatar name='Small' size='small' />
				<Avatar name='Medium' />
				<Avatar name='Large' size='large' intent='official' />
			</>,
		);

		expect(screen.getAllByRole('img').map(styleRulesOf)).toMatchSnapshot();
	});
});
