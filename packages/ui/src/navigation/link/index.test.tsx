// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations } from '#test/component-harness.ts';
import { Link } from '#src/navigation/link/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('Link', (): void => {
	it('is a link named by its text', async (): Promise<void> => {
		render(
			<p>
				Read the <Link href='/terms'>terms of use</Link>.
			</p>,
		);

		const link: HTMLElement = screen.getByRole('link', { name: 'terms of use' });

		expect(link.getAttribute('href')).toBe('/terms');
		expect(link.hasAttribute('target')).toBe(false);
		expect(link.hasAttribute('aria-current')).toBe(false);
		await expectNoAxeViolations(document.body);
	});

	it('underlines inline links, so they are not told apart by color alone', (): void => {
		render(
			<>
				<Link href='/terms'>Terms</Link>
				<Link href='/privacy' variant='standalone'>
					Privacy
				</Link>
			</>,
		);

		const inline: string = declarationsOf(screen.getByRole('link', { name: 'Terms' }), '&');
		const standalone: HTMLElement = screen.getByRole('link', { name: 'Privacy' });

		expect(inline).toContain('color:var(--mi-accent-link);');
		expect(inline).toContain('text-decoration-line:underline;');
		expect(declarationsOf(standalone, '&')).toContain('text-decoration-line:none;');
		expect(declarationsOf(standalone, '&:hover')).toContain('text-decoration-line:underline;');
		expect(declarationsOf(standalone, '&:focus-visible')).toContain('outline:');
	});

	it('marks the link to the current page', (): void => {
		render(
			<Link href='/settings' current>
				Settings
			</Link>,
		);

		expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBe(
			'page',
		);
	});

	it('opens an external link in a new tab and says so', async (): Promise<void> => {
		render(
			<Link href='https://example.com' external>
				Status page
			</Link>,
		);

		const link: HTMLElement = screen.getByRole('link', {
			name: 'Status page (opens in a new tab)',
		});

		expect(link.getAttribute('target')).toBe('_blank');
		expect(link.getAttribute('rel')).toBe('noopener noreferrer');
		expect(link.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
		await expectNoAxeViolations(document.body);
	});

	it('translates the external notice', (): void => {
		render(
			<Link href='https://example.com' external labels={{ opensInNewTab: '(abre em nova aba)' }}>
				Página de status
			</Link>,
		);

		expect(screen.getByRole('link', { name: 'Página de status (abre em nova aba)' })).toBeDefined();
	});
});
