// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { applyViewportStyles, resetViewport, setViewportWidth } from '#test/viewport.ts';
import { Pagination, paginationRange } from '#src/navigation/pagination/index.tsx';
import type { PaginationEntry, PaginationProps } from '#src/navigation/pagination/index.tsx';

afterEach((): void => {
	cleanup();
	resetViewport();
});

const renderAt = (width: number, props: PaginationProps): void => {
	setViewportWidth(width);
	render(<Pagination {...props} />);
	applyViewportStyles();
};

describe('paginationRange', (): void => {
	it.each<[number, number, PaginationEntry[]]>([
		[1, 1, [1]],
		[1, 5, [1, 2, 3, 4, 5]],
		[1, 7, [1, 2, 3, 4, 5, 6, 7]],
		[1, 10, [1, 2, 3, 4, 5, 'end-gap', 10]],
		[4, 10, [1, 2, 3, 4, 5, 'end-gap', 10]],
		[5, 10, [1, 'start-gap', 4, 5, 6, 'end-gap', 10]],
		[7, 10, [1, 'start-gap', 6, 7, 8, 9, 10]],
		[10, 10, [1, 'start-gap', 6, 7, 8, 9, 10]],
	])(
		'shows page %i of %i as %j',
		(page: number, pageCount: number, expected: PaginationEntry[]): void => {
			expect(paginationRange(page, pageCount)).toEqual(expected);
		},
	);

	it('keeps the same number of entries while moving through a long list', (): void => {
		const lengths: Set<number> = new Set<number>(
			Array.from({ length: 50 }, (_: unknown, index: number): number => {
				return paginationRange(index + 1, 50).length;
			}),
		);

		expect([...lengths]).toEqual([7]);
	});

	it('takes the siblings and boundaries', (): void => {
		expect(paginationRange(10, 20, 2, 2)).toEqual([
			1,
			2,
			'start-gap',
			8,
			9,
			10,
			11,
			12,
			'end-gap',
			19,
			20,
		]);
	});
});

describe('Pagination with buttons', (): void => {
	it('is a named landmark whose buttons say which page they show', async (): Promise<void> => {
		renderAt(1024, { page: 5, pageCount: 10, onPageChange: (): void => undefined });
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'Pagination' });
		const current: HTMLElement = within(navigation).getByRole('button', { name: 'Page 5' });

		expect(current.textContent).toBe('5');
		expect(current.getAttribute('aria-current')).toBe('true');
		expect(within(navigation).getByRole('button', { name: 'Page 10' })).toBeDefined();
		expect(within(navigation).queryByRole('button', { name: 'Page 2' })).toBeNull();
		expect(getComputedStyle(screen.getByText('Page 5 of 10')).display).toBe('none');
		await expectNoAxeViolations(document.body);
	});

	it('asks for the chosen page', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onPageChange: Mock<(page: number) => void> = vi.fn();
		renderAt(1024, { page: 5, pageCount: 10, onPageChange });

		await user.click(screen.getByRole('button', { name: 'Next page' }));
		await user.click(screen.getByRole('button', { name: 'Previous page' }));
		await user.click(screen.getByRole('button', { name: 'Page 10' }));
		await user.click(screen.getByRole('button', { name: 'Page 5' }));

		expect(onPageChange.mock.calls).toEqual([[6], [4], [10]]);
	});

	it('keeps previous on the first page focusable but inert', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onPageChange: Mock<(page: number) => void> = vi.fn();
		renderAt(1024, { page: 1, pageCount: 3, onPageChange });
		const previous: HTMLElement = screen.getByRole('button', { name: 'Previous page' });

		expect(previous.getAttribute('aria-disabled')).toBe('true');
		await user.tab();
		expect(document.activeElement).toBe(previous);
		await user.keyboard('{Enter}');

		expect(onPageChange).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(previous);
	});

	it('replaces the page numbers by a status on compact viewports', async (): Promise<void> => {
		renderAt(390, { page: 3, pageCount: 10, onPageChange: (): void => undefined });

		expect(screen.getByText('Page 3 of 10')).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Page 3' })).toBeNull();
		expect(screen.getAllByRole('button')).toHaveLength(2);
		await expectNoAxeViolations(document.body);
	});

	it('clamps the page to the list', (): void => {
		renderAt(1024, { page: 12, pageCount: 4, onPageChange: (): void => undefined });

		expect(screen.getByRole('button', { name: 'Page 4' }).getAttribute('aria-current')).toBe(
			'true',
		);

		expect(screen.getByRole('button', { name: 'Next page' }).getAttribute('aria-disabled')).toBe(
			'true',
		);
	});
});

describe('Pagination with links', (): void => {
	const getPageHref = (page: number): string => `/orders?page=${String(page)}`;

	it('links to every page and marks the current one', async (): Promise<void> => {
		renderAt(1024, { page: 2, pageCount: 3, getPageHref });

		expect(screen.getByRole('link', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page');

		expect(screen.getByRole('link', { name: 'Previous page' }).getAttribute('href')).toBe(
			'/orders?page=1',
		);

		expect(screen.getByRole('link', { name: 'Next page' }).getAttribute('href')).toBe(
			'/orders?page=3',
		);

		expect(screen.queryAllByRole('button')).toHaveLength(0);
		await expectNoAxeViolations(document.body);
	});

	it('fills the current page with the brand indigo, not the official pink', (): void => {
		renderAt(1024, { page: 2, pageCount: 3, getPageHref });
		const rules: string = styleRulesOf(screen.getByRole('link', { name: 'Page 2' })).join('');

		expect(rules).toContain('background-color:var(--mi-intent-brand-main);');
		expect(rules).not.toContain('--mi-intent-official-');
	});

	it('takes the destination out of a disabled link', (): void => {
		renderAt(1024, { page: 3, pageCount: 3, getPageHref });
		const next: HTMLElement = screen.getByRole('link', { name: 'Next page' });

		expect(next.hasAttribute('href')).toBe(false);
		expect(next.getAttribute('aria-disabled')).toBe('true');
	});
});

describe('Pagination labels', (): void => {
	it('are translatable', (): void => {
		renderAt(390, {
			page: 2,
			pageCount: 4,
			onPageChange: (): void => undefined,
			labels: {
				navigation: 'Paginação',
				previous: 'Página anterior',
				next: 'Próxima página',
				status: (page: number, pageCount: number): string => {
					return `Página ${String(page)} de ${String(pageCount)}`;
				},
			},
		});

		expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDefined();
		expect(screen.getByText('Página 2 de 4')).toBeDefined();
	});
});
