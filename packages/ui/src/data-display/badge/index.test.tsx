// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { IconButton } from '@/src/buttons/icon-button/index';
import { Badge, formatBadgeContent } from '@/src/data-display/badge/index';

afterEach((): void => {
	cleanup();
});

describe('formatBadgeContent', (): void => {
	it('caps numbers at max and hides zero unless asked', (): void => {
		expect(formatBadgeContent(7, 99, false)).toBe('7');
		expect(formatBadgeContent(120, 99, false)).toBe('99+');
		expect(formatBadgeContent(0, 99, false)).toBeUndefined();
		expect(formatBadgeContent(0, 99, true)).toBe('0');
		expect(formatBadgeContent('New', 99, false)).toBe('New');
		expect(formatBadgeContent(undefined, 99, false)).toBeUndefined();
	});
});

describe('Badge', (): void => {
	it('hides the visual count and states its meaning as text', async (): Promise<void> => {
		const { container } = render(
			<Badge content={3} label='3 unread messages'>
				<span>Inbox</span>
			</Badge>,
		);

		expect(screen.getByText('3').getAttribute('aria-hidden')).toBe('true');
		expect(screen.getByText('3 unread messages')).toBeDefined();
		await expectNoAxeViolations(container);
	});

	it('can leave the meaning to the anchor', async (): Promise<void> => {
		const { container } = render(
			<Badge content={3} decorative>
				<IconButton label='Notifications, 3 unread'>
					<span>!</span>
				</IconButton>
			</Badge>,
		);

		expect(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeDefined();
		expect(container.textContent).toBe('!3');
		await expectNoAxeViolations(container);
	});

	it('renders nothing extra when there is nothing to show', (): void => {
		const { container } = render(
			<>
				<Badge content={0} label='No unread messages'>
					<span>A</span>
				</Badge>

				<Badge content={5} invisible label='5 unread messages'>
					<span>B</span>
				</Badge>
			</>,
		);

		expect(container.textContent).toBe('AB');
	});

	it('draws a dot with the solid intent color, which is visible without text', (): void => {
		render(
			<Badge dot variant='soft' intent='success' label='Online' data-testid='badge'>
				<span>Ada</span>
			</Badge>,
		);

		const dot: Element | null = screen.getByTestId('badge').querySelector('[aria-hidden="true"]');

		expect(dot?.textContent).toBe('');

		expect(declarationsOf(dot ?? document.body, '&')).toContain(
			'background-color:var(--mi-intent-success-main);',
		);
	});

	it('rejects a blank label', (): void => {
		expect((): void => {
			render(
				<Badge content={1} label=''>
					<span>A</span>
				</Badge>,
			);
		}).toThrow(/label of a Badge cannot be blank/);
	});

	it('keeps the same look (regression)', (): void => {
		render(
			<>
				<Badge content={4} label='4 alerts' intent='error' data-testid='badge'>
					<span>solid</span>
				</Badge>

				<Badge content={4} label='4 alerts' variant='soft' data-testid='badge'>
					<span>soft</span>
				</Badge>
			</>,
		);

		const snapshot: string[][] = screen
			.getAllByTestId('badge')
			.map((badge: HTMLElement): string[] => {
				return styleRulesOf(badge.querySelector('[aria-hidden="true"]') ?? badge);
			});

		expect(snapshot).toMatchSnapshot();
	});
});
