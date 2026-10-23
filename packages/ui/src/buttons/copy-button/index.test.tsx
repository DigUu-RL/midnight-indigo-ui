// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { CopyButton } from '@/src/buttons/copy-button/index';
import { ComponentLabelsProvider } from '@/src/shared/component-labels/index';

afterEach((): void => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

const status = (): HTMLElement => screen.getByRole('status');

describe('CopyButton', (): void => {
	it('copies its value, keeps its name and announces the copy', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onCopied: Mock<(text: string) => void> = vi.fn();
		const { container } = render(<CopyButton value='pnpm add shiki' onCopied={onCopied} />);
		const button: HTMLElement = screen.getByRole('button', { name: 'Copy' });

		expect(status().textContent).toBe('');
		await expectNoAxeViolations(container);
		await user.click(button);

		expect(await navigator.clipboard.readText()).toBe('pnpm add shiki');
		expect(onCopied).toHaveBeenCalledWith('pnpm add shiki');
		expect(status().textContent).toBe('Copied');
		expect(screen.getByRole('button', { name: 'Copy' })).toBe(button);
		expect(styleRulesOf(button).join('')).toContain('var(--mi-intent-success-');
	});

	it('reads a function value at the moment of the copy', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		let snippet: string = 'first';
		render(<CopyButton value={(): string => snippet} label='Copy snippet' />);

		snippet = 'second';
		await user.click(screen.getByRole('button', { name: 'Copy snippet' }));

		expect(await navigator.clipboard.readText()).toBe('second');
	});

	it('announces a refused copy and reports the error', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const refusal: Error = new Error('Denied');
		const onCopyFailed: Mock<(error: unknown) => void> = vi.fn();
		vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(refusal);
		render(<CopyButton value='Spike Spiegel' onCopyFailed={onCopyFailed} />);

		await user.click(screen.getByRole('button', { name: 'Copy' }));

		expect(status().textContent).toBe('Could not copy');
		expect(onCopyFailed).toHaveBeenCalledWith(refusal);
		expect(styleRulesOf(screen.getByRole('button')).join('')).toContain('var(--mi-intent-error-');
	});

	it('returns to rest after the feedback duration and announces every copy', async (): Promise<void> => {
		vi.useFakeTimers({ shouldAdvanceTime: true });
		const user: UserEvent = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		render(<CopyButton value='Leia Organa' feedbackDuration={1000} />);
		const button: HTMLElement = screen.getByRole('button', { name: 'Copy' });

		await user.click(button);
		const firstAnnouncement: Element | null = status().firstElementChild;
		await user.click(button);

		expect(status().firstElementChild).not.toBe(firstAnnouncement);

		act((): void => {
			vi.advanceTimersByTime(1000);
		});

		expect(status().textContent).toBe('');
	});

	it('can show its name and takes its texts from the labels', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<ComponentLabelsProvider labels={{ copyButton: { copy: 'Copiar', copied: 'Copiado' } }}>
				<CopyButton value='Samus Aran' showLabel />
			</ComponentLabelsProvider>,
		);

		const button: HTMLElement = screen.getByRole('button', { name: 'Copiar' });
		await user.click(button);

		expect(button.textContent).toBe('Copiar');
		expect(status().textContent).toBe('Copiado');
	});

	it('lets a click handler cancel the copy', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const writeText: Mock<(text: string) => Promise<void>> = vi.spyOn(
			navigator.clipboard,
			'writeText',
		);

		render(
			<CopyButton
				value='Spike Spiegel'
				onClick={(event): void => {
					event.preventDefault();
				}}
			/>,
		);

		await user.click(screen.getByRole('button', { name: 'Copy' }));

		expect(writeText).not.toHaveBeenCalled();
	});

	it('clears its timer when it unmounts during the feedback', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const setTimeout: Mock<typeof window.setTimeout> = vi.spyOn(window, 'setTimeout');
		const clearTimeout: Mock<typeof window.clearTimeout> = vi.spyOn(window, 'clearTimeout');
		const { unmount } = render(<CopyButton value='Samus Aran' feedbackDuration={4321} />);
		await user.click(screen.getByRole('button', { name: 'Copy' }));

		const feedbackTimer: unknown = setTimeout.mock.results.at(
			setTimeout.mock.calls.findIndex((call: Parameters<typeof window.setTimeout>) => {
				return call[1] === 4321;
			}),
		)?.value;

		expect(feedbackTimer).toBeDefined();
		expect(clearTimeout).not.toHaveBeenCalledWith(feedbackTimer);

		unmount();

		expect(clearTimeout).toHaveBeenCalledWith(feedbackTimer);
	});

	it('rejects a blank label', (): void => {
		expect((): void => {
			render(<CopyButton value='code' label=' ' />);
		}).toThrow(/label of an IconButton cannot be blank/);
	});
});
