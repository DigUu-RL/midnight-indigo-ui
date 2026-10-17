// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { declarationsOf, expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Button } from '#src/buttons/button/index.tsx';
import { Alert } from '#src/feedback/alert/index.tsx';
import type { AlertVariant } from '#src/feedback/alert/index.tsx';
import { semanticIntents } from '#src/tokens/index.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';

afterEach((): void => {
	cleanup();
});

describe('Alert', (): void => {
	it('is static by default and live when it announces', async (): Promise<void> => {
		const { container } = render(
			<>
				<Alert title='Maintenance'>The service stops at 22:00.</Alert>

				<Alert intent='success' announce='polite'>
					Report saved.
				</Alert>

				<Alert intent='error' announce='assertive' title='Upload failed'>
					The file is larger than 10 MB.
				</Alert>
			</>,
		);

		expect(screen.getByText('The service stops at 22:00.').closest('[role]')).toBeNull();
		expect(screen.getByRole('status').textContent).toBe('Report saved.');

		expect(screen.getByRole('alert').textContent).toBe(
			'Upload failedThe file is larger than 10 MB.',
		);

		await expectNoAxeViolations(container);
	});

	it('marks each intent with its own decorative glyph', (): void => {
		const { container } = render(
			<>
				{semanticIntents.map((intent: SemanticIntent): ReactElement => {
					return (
						<Alert key={intent} intent={intent}>
							{intent}
						</Alert>
					);
				})}
			</>,
		);

		const glyphs: string[] = [...container.querySelectorAll('[data-alert-icon]')].map(
			(icon: Element): string => {
				expect(icon.getAttribute('aria-hidden')).toBe('true');
				return icon.querySelector('path')?.getAttribute('d') ?? '';
			},
		);

		const [official, brand, defaultGlyph, success, warning, error, info] = glyphs;

		expect(new Set([official, success, warning, error, info]).size).toBe(5);
		expect(brand).toBe(info);
		expect(defaultGlyph).toBe(info);
	});

	it('shows an action and a named dismiss button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onDismiss: Mock<() => void> = vi.fn();

		render(
			<Alert
				intent='warning'
				action={<Button size='small'>Review</Button>}
				labels={{ dismiss: 'Dispensar' }}
				onDismiss={onDismiss}
			>
				Two invoices are overdue.
			</Alert>,
		);

		expect(screen.getByRole('button', { name: 'Review' })).toBeDefined();
		await user.click(screen.getByRole('button', { name: 'Dispensar' }));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it.each<[AlertVariant, string, string]>([
		[
			'soft',
			'background-color:var(--mi-intent-error-container);',
			'color:var(--mi-intent-error-on-container);',
		],
		['outline', 'border-color:var(--mi-intent-error-border);', 'color:var(--mi-text-primary);'],
		[
			'solid',
			'background-color:var(--mi-intent-error-main);',
			'color:var(--mi-intent-error-contrast-text);',
		],
	])(
		'uses audited token pairs in the %s variant',
		(variant: AlertVariant, surface: string, content: string): void => {
			render(
				<Alert intent='error' variant={variant} onDismiss={(): void => undefined}>
					Message
				</Alert>,
			);

			const root: Element =
				screen.getByText('Message').closest('[class^="css-"]')?.parentElement ?? document.body;

			expect(declarationsOf(root, '&')).toContain(surface);
			expect(declarationsOf(root, '&')).toContain(content);
		},
	);

	it('keeps the same look (regression)', (): void => {
		render(
			<>
				<Alert intent='info' title='a' onDismiss={(): void => undefined}>
					soft
				</Alert>

				<Alert intent='success' variant='outline'>
					outline
				</Alert>

				<Alert intent='warning' variant='solid' onDismiss={(): void => undefined}>
					solid
				</Alert>
			</>,
		);

		const snapshot: string[][] = ['soft', 'outline', 'solid'].map((text: string): string[] => {
			const root: Element = screen.getByText(text).parentElement?.parentElement ?? document.body;
			const styled: Element[] = [root, ...root.querySelectorAll('[class^="css-"]')];
			return styled.flatMap(styleRulesOf);
		});

		expect(snapshot).toMatchSnapshot();
	});
});
