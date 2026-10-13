// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { MouseEvent, ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { applyViewportStyles, resetViewport, setViewportWidth } from '#test/viewport.ts';
import { Breadcrumbs } from '#src/navigation/breadcrumbs/index.tsx';
import { Link } from '#src/navigation/link/index.tsx';
import { NavigationProvider } from '#src/navigation/navigation-provider/index.tsx';
import type { LinkComponentProps } from '#src/navigation/navigation-provider/index.tsx';
import { Pagination } from '#src/navigation/pagination/index.tsx';
import { Sidebar } from '#src/navigation/sidebar/index.tsx';
import { TabNavigation } from '#src/navigation/tab-navigation/index.tsx';

afterEach((): void => {
	cleanup();
	resetViewport();
});

const visited: string[] = [];

// Stands in for `next/link`: renders the `<a>` and navigates on the client instead of loading the page.
const RouterLink = ({ href, onClick, ...attributes }: LinkComponentProps): ReactElement => {
	return (
		<a
			{...attributes}
			href={href}
			data-router-link=''
			onClick={(event: MouseEvent<HTMLAnchorElement>): void => {
				onClick?.(event);
				event.preventDefault();
				visited.push(href);
			}}
		/>
	);
};

describe('NavigationProvider', (): void => {
	it('renders the internal links of every navigation component through the host router', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		setViewportWidth(1024);

		render(
			<NavigationProvider linkComponent={RouterLink}>
				<Link href='/help'>Help</Link>

				<Breadcrumbs
					items={[
						{ id: 'home', label: 'Home', href: '/' },
						{ id: 'project', label: 'Project' },
					]}
				/>

				<Pagination
					page={1}
					pageCount={3}
					getPageHref={(page: number): string => `/list?page=${String(page)}`}
				/>

				<TabNavigation
					label='Project sections'
					items={[{ id: 'overview', label: 'Overview', href: '/project', current: true }]}
				/>

				<Sidebar
					label='Main navigation'
					items={[{ id: 'reports', label: 'Reports', icon: <svg />, href: '/reports' }]}
					mobileOpen={false}
					onMobileOpenChange={(): void => undefined}
				/>
			</NavigationProvider>,
		);

		applyViewportStyles();

		// The disabled previous page link has no `href` and nothing to route.
		const links: HTMLElement[] = screen
			.getAllByRole('link')
			.filter((link: HTMLElement): boolean => {
				return link.hasAttribute('href');
			});

		expect(links.map((link: HTMLElement): string => link.getAttribute('href') ?? '')).toEqual([
			'/help',
			'/',
			'/list?page=1',
			'/list?page=2',
			'/list?page=3',
			'/list?page=2',
			'/project',
			'/reports',
		]);

		for (const link of links) {
			expect(link.hasAttribute('data-router-link')).toBe(true);
		}

		expect(screen.getByRole('link', { name: 'Overview' }).getAttribute('aria-current')).toBe(
			'page',
		);

		await user.click(screen.getByRole('link', { name: 'Help' }));
		expect(visited).toEqual(['/help']);
	});

	it('keeps external links as plain anchors', (): void => {
		render(
			<NavigationProvider linkComponent={RouterLink}>
				<Link href='https://example.com' external>
					Status
				</Link>
			</NavigationProvider>,
		);

		expect(screen.getByRole('link').hasAttribute('data-router-link')).toBe(false);
	});

	it('defaults to a plain anchor', (): void => {
		render(<Link href='/help'>Help</Link>);

		expect(screen.getByRole('link').hasAttribute('data-router-link')).toBe(false);
	});
});
