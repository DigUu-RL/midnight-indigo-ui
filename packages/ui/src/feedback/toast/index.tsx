'use client';
// Brief notifications about the outcome of an action, shown in a corner and announced to assistive technologies.
import { keyframes, styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { createContext, use, useEffect, useMemo, useRef, useState } from 'react';
import type { Context, FocusEvent, KeyboardEvent, ReactElement, ReactNode, RefObject } from 'react';

import { Button } from '#src/buttons/button/index.tsx';
import { forwardAllBut, visuallyHiddenStyles } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';
import { Alert } from '#src/feedback/alert/index.tsx';
import { Portal } from '#src/feedback/portal/index.tsx';
import type { OverlayContainer } from '#src/feedback/portal/index.tsx';

const { spacing, radius, surface, elevation, layer, motion }: typeof themeVariables =
	themeVariables;

type Keyframes = ReturnType<typeof keyframes>;

export type ToastPlacement =
	'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

/** A single action of a toast, such as `'Undo'` or `'Retry'`. */
export interface ToastAction {
	label: string;
	onAction: () => void;
}

export interface ToastOptions {
	/**
	 * Identifies the toast: showing another one with the same `id` updates it in place instead of stacking a copy, and
	 * it is announced again only if its text changed. Defaults to a generated identifier.
	 */
	id?: string;
	/** Meaning of the toast; it picks the icon and how urgently it is announced. Defaults to `'default'`. */
	intent?: SemanticIntent;
	/** Short summary in bold before the message. */
	title?: string;
	message: string;
	/** Runs the action and dismisses the toast. A toast with an action stays at least 10 seconds. */
	action?: ToastAction;
	/**
	 * Milliseconds before the toast dismisses itself, or `null` to keep it until the user dismisses it. Defaults to
	 * `defaultToastDurations` of the intent; values below `minimumToastDuration` are raised to it.
	 */
	duration?: number | null;
}

export interface ToastApi {
	/** Shows a toast, or updates the one with the same `id`, and returns its `id`. */
	show: (options: ToastOptions) => string;
	dismiss: (id: string) => void;
	dismissAll: () => void;
}

/** Texts of the notification region. Translate them with the rest of the interface. */
export interface ToastLabels {
	/** Name of the region that holds the toasts, e.g. `'Notifications (F8)'`. */
	region: string;
	/** Name of the button that dismisses a toast. */
	dismiss: string;
}

export const defaultToastLabels: Readonly<ToastLabels> = Object.freeze({
	region: 'Notifications',
	dismiss: 'Dismiss notification',
});

/**
 * Errors stay until dismissed: an error must not vanish before it is read. Warnings stay longer than confirmations.
 */
export const defaultToastDurations: Readonly<Record<SemanticIntent, number | null>> = Object.freeze(
	{
		official: 6000,
		default: 6000,
		success: 6000,
		info: 6000,
		warning: 10_000,
		error: null,
	},
);

/** Shortest time a toast stays on screen, whatever its `duration`. */
export const minimumToastDuration: number = 5000;

const minimumActionDuration: number = 10_000;

export interface ToastProviderProps {
	children?: ReactNode;
	/** Defaults to `'bottom-end'`. */
	placement?: ToastPlacement;
	/** Toasts shown at once; the next ones wait for a free place. Defaults to 3. */
	limit?: number;
	/** Key (`KeyboardEvent.key`) that moves focus to the toasts, and Escape back. Defaults to `'F8'`. */
	hotkey?: string;
	/** Overrides some or all of `defaultToastLabels`. */
	labels?: Partial<ToastLabels>;
	/** Element that receives the notification region. Defaults to `document.body`. */
	container?: OverlayContainer;
}

interface ToastRecord {
	id: string;
	intent: SemanticIntent;
	title: string | undefined;
	message: string;
	action: ToastAction | undefined;
	duration: number | null;
	/** Changes when the text changes, which announces the toast again. */
	contentRevision: number;
	/** Changes when the toast is shown again, which restarts its duration. */
	timerRevision: number;
}

interface Announcement {
	key: number;
	text: string;
}

interface AnnouncementState {
	polite: Announcement | null;
	assertive: Announcement | null;
}

const ToastContext: Context<ToastApi | null> = createContext<ToastApi | null>(null);

/** Shows and dismisses toasts. Requires a `ToastProvider` above. */
export const useToast = (): ToastApi => {
	const api: ToastApi | null = use(ToastContext);
	if (api !== null) return api;
	throw new Error('useToast must be called inside a ToastProvider.');
};

const resolveDuration = (options: ToastOptions, intent: SemanticIntent): number | null => {
	const requested: number | null =
		options.duration === undefined ? defaultToastDurations[intent] : options.duration;

	if (requested === null) return null;

	const minimum: number =
		options.action === undefined ? minimumToastDuration : minimumActionDuration;

	return Math.max(requested, minimum);
};

const announcementText = (toast: ToastRecord): string => {
	return toast.title === undefined ? toast.message : `${toast.title}. ${toast.message}`;
};

const isUrgent = (intent: SemanticIntent): boolean => intent === 'error' || intent === 'warning';

const sameContent = (
	toast: ToastRecord,
	options: ToastOptions,
	intent: SemanticIntent,
): boolean => {
	return (
		toast.intent === intent && toast.title === options.title && toast.message === options.message
	);
};

const enter: Keyframes = keyframes({ from: { opacity: 0, transform: 'translateY(0.5rem)' } });

const alignments: Record<ToastPlacement, string> = {
	'top-start': 'flex-start',
	'top-center': 'center',
	'top-end': 'flex-end',
	'bottom-start': 'flex-start',
	'bottom-center': 'center',
	'bottom-end': 'flex-end',
};

// The viewport spans the edge but lets clicks through; only the toasts catch them.
const Viewport = styled('section', { shouldForwardProp: forwardAllBut('placement') })<{
	placement: ToastPlacement;
}>(({ placement }: { placement: ToastPlacement }): CSSObject => {
	return {
		position: 'fixed',
		insetInline: 0,
		...(placement.startsWith('top') ? { insetBlockStart: 0 } : { insetBlockEnd: 0 }),
		zIndex: layer.toast,
		padding: spacing[4],
		pointerEvents: 'none',
		'& > ol': {
			display: 'flex',
			flexDirection: 'column',
			alignItems: alignments[placement],
			gap: spacing[2],
			margin: 0,
			padding: 0,
			listStyle: 'none',
			outline: 'none',
		},
	};
});

const Item = styled('li')({
	width: '24rem',
	maxWidth: '100%',
	borderRadius: radius.medium,
	backgroundColor: surface.overlay,
	boxShadow: elevation.high,
	pointerEvents: 'auto',
	animationName: enter,
	animationDuration: motion.duration.moderate,
	animationTimingFunction: motion.easing.enter,
});

const LiveRegion = styled('div')(visuallyHiddenStyles);

const dismissButtonOf = (item: Element | null): HTMLElement | null => {
	return item?.querySelector<HTMLElement>('button[aria-label]') ?? null;
};

const unhide = (element: Element): void => {
	if (element.getAttribute('aria-hidden') === 'true') element.removeAttribute('aria-hidden');
};

/**
 * A modal overlay hides the rest of the page from assistive technologies (`aria-hidden` on the siblings of its
 * portal), but notifications must still be heard while it is open. Ref of the toast layer, with cleanup.
 */
const keepExposed = (element: HTMLDivElement | null): (() => void) | undefined => {
	if (element === null) return undefined;
	unhide(element);

	const observer: MutationObserver = new MutationObserver((): void => {
		unhide(element);
	});

	observer.observe(element, { attributes: true, attributeFilter: ['aria-hidden'] });

	return (): void => {
		observer.disconnect();
	};
};

interface ToastItemProps {
	toast: ToastRecord;
	paused: boolean;
	dismissLabel: string;
	onShown: (toast: ToastRecord) => void;
	onDismiss: (id: string) => void;
}

const ToastItem = ({
	toast,
	paused,
	dismissLabel,
	onShown,
	onDismiss,
}: ToastItemProps): ReactElement => {
	const remaining: RefObject<number | null> = useRef<number | null>(toast.duration);

	// Announced when it becomes visible, not when it is queued.
	useEffect((): void => {
		onShown(toast);
	}, [toast, onShown]);

	useEffect((): void => {
		remaining.current = toast.duration;
	}, [toast.duration, toast.timerRevision]);

	useEffect((): (() => void) | undefined => {
		const duration: number | null = remaining.current;
		if (duration === null || paused) return undefined;
		const startedAt: number = Date.now();

		const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
			onDismiss(toast.id);
		}, duration);

		return (): void => {
			clearTimeout(timer);
			remaining.current = Math.max(duration - (Date.now() - startedAt), 0);
		};
	}, [paused, toast.id, toast.duration, toast.timerRevision, onDismiss]);

	return (
		<Item id={toast.id} data-toast=''>
			<Alert
				intent={toast.intent}
				variant='outline'
				title={toast.title}
				action={
					toast.action === undefined ? undefined : (
						<Button
							size='small'
							variant='outline'
							intent={toast.intent}
							onClick={(): void => {
								toast.action?.onAction();
								onDismiss(toast.id);
							}}
						>
							{toast.action.label}
						</Button>
					)
				}
				labels={{ dismiss: dismissLabel }}
				onDismiss={(): void => {
					onDismiss(toast.id);
				}}
			>
				{toast.message}
			</Alert>
		</Item>
	);
};

/**
 * Holds the toasts of the application; `useToast` shows them. A toast is announced once, when it appears, through
 * live regions that exist before it (polite, or assertive for warnings and errors): its own markup is not live, so
 * updating or re-rendering it never repeats the message, and showing the same text again restarts the visible toast
 * instead of stacking a copy. Timers pause while the pointer or focus is on the toasts and while the page is hidden.
 *
 * The toasts form a labelled region at the end of the document. The hotkey (F8) moves focus to them and Escape
 * returns it; dismissing the focused toast moves focus to the next one, or back to where it was before. The region
 * stays exposed while a modal dialog hides the rest of the page, so notifications are still announced.
 */
export const ToastProvider = ({
	children,
	placement = 'bottom-end',
	limit = 3,
	hotkey = 'F8',
	labels,
	container,
}: ToastProviderProps): ReactElement => {
	const texts: ToastLabels = { ...defaultToastLabels, ...labels };
	const [toasts, setToasts] = useState<readonly ToastRecord[]>([]);

	const [announcements, setAnnouncements] = useState<AnnouncementState>({
		polite: null,
		assertive: null,
	});

	const [hovered, setHovered] = useState<boolean>(false);
	const [focused, setFocused] = useState<boolean>(false);
	const [pageHidden, setPageHidden] = useState<boolean>(false);
	const current: RefObject<readonly ToastRecord[]> = useRef<readonly ToastRecord[]>(toasts);
	const announced: RefObject<Set<string>> = useRef<Set<string>>(new Set<string>());
	const sequence: RefObject<number> = useRef<number>(0);

	const listElement: RefObject<HTMLOListElement | null> = useRef<HTMLOListElement>(null);
	const focusBeforeRegion: RefObject<HTMLElement | null> = useRef<HTMLElement>(null);

	const api: ToastApi = useMemo((): ToastApi => {
		const commit = (next: readonly ToastRecord[]): void => {
			current.current = next;
			setToasts(next);
		};

		const nextNumber = (): number => {
			sequence.current += 1;
			return sequence.current;
		};

		const show = (options: ToastOptions): string => {
			const intent: SemanticIntent = options.intent ?? 'default';

			const existing: ToastRecord | undefined = current.current.find(
				(toast: ToastRecord): boolean => {
					return options.id === undefined
						? sameContent(toast, options, intent)
						: toast.id === options.id;
				},
			);

			const record: ToastRecord = {
				id: existing?.id ?? options.id ?? `mi-toast-${String(nextNumber())}`,
				intent,
				title: options.title,
				message: options.message,
				action: options.action,
				duration: resolveDuration(options, intent),
				contentRevision:
					existing !== undefined && sameContent(existing, options, intent)
						? existing.contentRevision
						: nextNumber(),
				timerRevision: nextNumber(),
			};

			commit(
				existing === undefined
					? [...current.current, record]
					: current.current.map((toast: ToastRecord): ToastRecord => {
							return toast.id === record.id ? record : toast;
						}),
			);

			return record.id;
		};

		const dismiss = (id: string): void => {
			const index: number = current.current.findIndex((toast: ToastRecord): boolean => {
				return toast.id === id;
			});

			if (index === -1) return;
			const element: HTMLElement | null = document.getElementById(id);

			// Focus never falls to the body: it goes to the next toast, the previous one, or where it was before.
			if (element?.contains(document.activeElement) === true) {
				const neighbor: HTMLElement | null =
					dismissButtonOf(element.nextElementSibling) ??
					dismissButtonOf(element.previousElementSibling);

				(neighbor ?? focusBeforeRegion.current)?.focus();
			}

			commit(current.current.filter((toast: ToastRecord): boolean => toast.id !== id));
		};

		const dismissAll = (): void => {
			if (listElement.current?.contains(document.activeElement) === true) {
				focusBeforeRegion.current?.focus();
			}

			commit([]);
		};

		return { show, dismiss, dismissAll };
	}, []);

	const announce = useMemo((): ((toast: ToastRecord) => void) => {
		return (toast: ToastRecord): void => {
			const key: string = `${toast.id}:${String(toast.contentRevision)}`;
			if (announced.current.has(key)) return;
			announced.current.add(key);

			const announcement: Announcement = {
				key: toast.contentRevision,
				text: announcementText(toast),
			};

			setAnnouncements((previous: AnnouncementState): AnnouncementState => {
				return isUrgent(toast.intent)
					? { ...previous, assertive: announcement }
					: { ...previous, polite: announcement };
			});
		};
	}, []);

	useEffect((): (() => void) => {
		const updateVisibility = (): void => {
			setPageHidden(document.visibilityState === 'hidden');
		};

		document.addEventListener('visibilitychange', updateVisibility);

		return (): void => {
			document.removeEventListener('visibilitychange', updateVisibility);
		};
	}, []);

	useEffect((): (() => void) => {
		const focusRegion = (event: globalThis.KeyboardEvent): void => {
			if (event.key !== hotkey || listElement.current === null) return;
			event.preventDefault();
			listElement.current.focus();
		};

		document.addEventListener('keydown', focusRegion);

		return (): void => {
			document.removeEventListener('keydown', focusRegion);
		};
	}, [hotkey]);

	const handleFocus = (event: FocusEvent<HTMLElement>): void => {
		const from: EventTarget | null = event.relatedTarget;

		if (from instanceof HTMLElement && !event.currentTarget.contains(from)) {
			focusBeforeRegion.current = from;
		}

		setFocused(true);
	};

	const handleBlur = (event: FocusEvent<HTMLElement>): void => {
		const to: EventTarget | null = event.relatedTarget;
		if (!(to instanceof Node && event.currentTarget.contains(to))) setFocused(false);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
		if (event.key !== 'Escape' || focusBeforeRegion.current === null) return;
		event.preventDefault();
		focusBeforeRegion.current.focus();
	};

	const visible: readonly ToastRecord[] = toasts.slice(0, Math.max(limit, 1));
	const paused: boolean = hovered || focused || pageHidden;

	return (
		<ToastContext value={api}>
			{children}
			<Portal container={container}>
				<div ref={keepExposed} data-toast-layer=''>
					<LiveRegion role='status' aria-atomic='true'>
						{announcements.polite === null ? null : (
							<span key={announcements.polite.key}>{announcements.polite.text}</span>
						)}
					</LiveRegion>
					<LiveRegion aria-live='assertive' aria-atomic='true'>
						{announcements.assertive === null ? null : (
							<span key={announcements.assertive.key}>{announcements.assertive.text}</span>
						)}
					</LiveRegion>
					{visible.length === 0 ? null : (
						<Viewport
							placement={placement}
							aria-label={texts.region}
							onMouseEnter={(): void => {
								setHovered(true);
							}}
							onMouseLeave={(): void => {
								setHovered(false);
							}}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
						>
							<ol ref={listElement} tabIndex={-1}>
								{visible.map((toast: ToastRecord): ReactElement => {
									return (
										<ToastItem
											key={toast.id}
											toast={toast}
											paused={paused}
											dismissLabel={texts.dismiss}
											onShown={announce}
											onDismiss={api.dismiss}
										/>
									);
								})}
							</ol>
						</Viewport>
					)}
				</div>
			</Portal>
		</ToastContext>
	);
};
