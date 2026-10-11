// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations } from '#test/component-harness.ts';
import { Button } from '#src/buttons/button/index.tsx';
import { Dialog } from '#src/feedback/dialog/index.tsx';
import { ToastProvider, useToast } from '#src/feedback/toast/index.tsx';
import type { ToastApi, ToastOptions, ToastProviderProps } from '#src/feedback/toast/index.tsx';

interface Captured {
	api: ToastApi | null;
}

const captured: Captured = { api: null };

const Capture = (): null => {
	captured.api = useToast();
	return null;
};

const toastApi = (): ToastApi => {
	if (captured.api === null) throw new Error('The toast API was not captured.');
	return captured.api;
};

const show = (options: ToastOptions): string => {
	let id: string = '';

	act((): void => {
		id = toastApi().show(options);
	});

	return id;
};

const advance = (milliseconds: number): void => {
	act((): void => {
		vi.advanceTimersByTime(milliseconds);
	});
};

const renderProvider = (props: Omit<ToastProviderProps, 'children'> = {}): void => {
	render(
		<ToastProvider {...props}>
			<Button>Elsewhere</Button>
			<Capture />
		</ToastProvider>,
	);
};

const politeRegion = (): HTMLElement => screen.getByRole('status');

const assertiveRegion = (): HTMLElement => {
	const region: HTMLElement | null = document.querySelector('[aria-live="assertive"]');
	if (region === null) throw new Error('No assertive live region.');
	return region;
};

const toastItems = (): HTMLElement[] => {
	return within(screen.getByRole('region', { name: 'Notifications' })).queryAllByRole('listitem');
};

beforeEach((): void => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach((): void => {
	cleanup();
	vi.useRealTimers();
	captured.api = null;
});

describe('ToastProvider and useToast', (): void => {
	it('shows a toast in a named region and announces it politely, once', async (): Promise<void> => {
		renderProvider();
		expect(screen.getByRole('status').textContent).toBe('');
		expect(screen.queryByRole('region')).toBeNull();

		show({ intent: 'success', title: 'Saved', message: 'The report was saved.' });

		expect(toastItems()).toHaveLength(1);
		expect(toastItems()[0]?.textContent).toContain('The report was saved.');
		expect(politeRegion().textContent).toBe('Saved. The report was saved.');
		expect(assertiveRegion().textContent).toBe('');
		await expectNoAxeViolations(document.body);
	});

	it('announces warnings and errors assertively', (): void => {
		renderProvider();
		show({ intent: 'error', message: 'Could not save.' });

		expect(assertiveRegion().textContent).toBe('Could not save.');
		expect(politeRegion().textContent).toBe('');
	});

	it('does not stack nor announce again the same message', (): void => {
		renderProvider();
		show({ message: 'Copied.' });
		const firstAnnouncement: Element | null = politeRegion().firstElementChild;
		show({ message: 'Copied.' });

		expect(toastItems()).toHaveLength(1);
		expect(politeRegion().firstElementChild).toBe(firstAnnouncement);
	});

	it('updates a toast by id and announces it again only when its text changes', (): void => {
		renderProvider();
		show({ id: 'upload', message: 'Uploading…' });
		const uploading: Element | null = politeRegion().firstElementChild;
		show({ id: 'upload', message: 'Uploading…' });
		expect(politeRegion().firstElementChild).toBe(uploading);
		show({ id: 'upload', intent: 'success', message: 'Uploaded.' });

		expect(toastItems()).toHaveLength(1);
		expect(politeRegion().firstElementChild).not.toBe(uploading);
		expect(politeRegion().textContent).toBe('Uploaded.');
	});

	it('dismisses itself after the duration of its intent, paused while hovered', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderProvider();
		show({ intent: 'info', message: 'Synced.' });

		advance(3000);
		await user.hover(toastItems()[0] ?? document.body);
		advance(10_000);
		expect(toastItems()).toHaveLength(1);

		await user.unhover(toastItems()[0] ?? document.body);
		advance(2900);
		expect(toastItems()).toHaveLength(1);
		advance(200);
		expect(screen.queryByRole('region')).toBeNull();
	});

	it('keeps errors until dismissed and never goes below the minimum duration', (): void => {
		renderProvider();
		show({ intent: 'error', message: 'Payment failed.' });
		show({ message: 'Too quick.', duration: 500 });

		advance(4000);
		expect(toastItems()).toHaveLength(2);
		advance(1100);
		expect(toastItems()).toHaveLength(1);
		advance(60_000);
		expect(toastItems()[0]?.textContent).toContain('Payment failed.');
	});

	it('runs its action and dismisses itself', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		const onAction: Mock<() => void> = vi.fn();
		renderProvider();
		show({ message: 'Item archived.', action: { label: 'Undo', onAction } });

		advance(9000);
		await user.click(screen.getByRole('button', { name: 'Undo' }));

		expect(onAction).toHaveBeenCalledOnce();
		expect(screen.queryByRole('region')).toBeNull();
	});

	it('shows at most `limit` toasts and announces the next one when it appears', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderProvider({ limit: 2 });
		show({ intent: 'error', message: 'First.' });
		show({ intent: 'error', message: 'Second.' });
		show({ intent: 'error', message: 'Third.' });

		expect(toastItems()).toHaveLength(2);
		expect(assertiveRegion().textContent).toBe('Second.');

		await user.click(
			within(toastItems()[0] ?? document.body).getByRole('button', {
				name: 'Dismiss notification',
			}),
		);

		expect(toastItems().map((item: HTMLElement): string => item.textContent)).toEqual([
			'Second.',
			'Third.',
		]);

		expect(assertiveRegion().textContent).toBe('Third.');
	});

	it('moves focus with the hotkey, between toasts on dismissal and back with Escape', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
		renderProvider({ labels: { region: 'Notificações (F8)', dismiss: 'Fechar notificação' } });
		show({ intent: 'error', message: 'One.' });
		show({ intent: 'error', message: 'Two.' });
		const elsewhere: HTMLElement = screen.getByRole('button', { name: 'Elsewhere' });

		await user.click(elsewhere);
		await user.keyboard('{F8}');
		const region: HTMLElement = screen.getByRole('region', { name: 'Notificações (F8)' });
		expect(region.contains(document.activeElement)).toBe(true);

		await user.tab();
		await user.keyboard('{Enter}');
		expect(document.activeElement?.closest('li')?.textContent).toBe('Two.');

		await user.keyboard('{Escape}');
		expect(document.activeElement).toBe(elsewhere);
		await user.keyboard('{F8}');
		await user.tab();
		await user.keyboard('{Enter}');
		expect(document.activeElement).toBe(elsewhere);
	});

	it('stays exposed to assistive technologies while a dialog is open', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		const Page = (): ReactElement => {
			const [open, setOpen] = useState<boolean>(false);
			const toast: ToastApi = useToast();

			return (
				<>
					<Button
						onClick={(): void => {
							setOpen(true);
						}}
					>
						Open
					</Button>
					<Dialog
						open={open}
						title='Rename'
						onClose={(): void => {
							setOpen(false);
						}}
					>
						<Button onClick={(): string => toast.show({ message: 'Renamed.' })}>Rename</Button>
					</Dialog>
				</>
			);
		};

		render(
			<ToastProvider>
				<Page />
			</ToastProvider>,
		);

		await user.click(screen.getByRole('button', { name: 'Open' }));
		await user.click(screen.getByRole('button', { name: 'Rename' }));

		await act(async (): Promise<void> => {
			await Promise.resolve();
		});

		const layer: Element | null = document.querySelector('[data-toast-layer]');
		expect(layer?.getAttribute('aria-hidden')).toBeNull();
		expect(screen.getByRole('status').textContent).toBe('Renamed.');
	});

	it('requires a provider', (): void => {
		vi.spyOn(console, 'error').mockImplementation((): void => undefined);

		expect((): void => {
			render(<Capture />);
		}).toThrow(/inside a ToastProvider/);
	});
});
