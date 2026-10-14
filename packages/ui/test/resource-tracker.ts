// Records what components hold outside their own elements: listeners on `window` and `document`, observers and
// intervals. Those outlive an unmounted component unless it releases them, so a test can check that unmounting gives
// every one of them back. Listeners on elements are not tracked: they go away with the elements.

/** A resource still held, e.g. `document keydown (capture)`, `ResizeObserver` or `interval`. */
export type HeldResource = string;

export interface ResourceTracker {
	/** Descriptions of the resources held since tracking started, sorted. */
	held: () => HeldResource[];
	/** Puts the original functions and constructors back. */
	restore: () => void;
}

interface ListenerRecord {
	target: EventTarget;
	type: string;
	listener: EventListenerOrEventListenerObject;
	capture: boolean;
}

type ObserverName = 'IntersectionObserver' | 'MutationObserver' | 'ResizeObserver';
type ObserverConstructor = new (...parameters: never[]) => object;
type IntervalHandle = ReturnType<typeof setInterval>;

const observerNames: readonly ObserverName[] = [
	'IntersectionObserver',
	'MutationObserver',
	'ResizeObserver',
];

const captureOf = (options: boolean | EventListenerOptions | undefined): boolean => {
	return typeof options === 'boolean' ? options : options?.capture === true;
};

const sameListener = (first: ListenerRecord, second: ListenerRecord): boolean => {
	return (
		first.target === second.target &&
		first.type === second.type &&
		first.listener === second.listener &&
		first.capture === second.capture
	);
};

// jsdom has no ResizeObserver nor IntersectionObserver: a stand-in that never calls back, so the code that uses them
// runs (and must release them) as in a browser.
class SilentObserver {
	public observe(): void {
		return undefined;
	}

	public unobserve(): void {
		return undefined;
	}

	public disconnect(): void {
		return undefined;
	}

	public takeRecords(): [] {
		return [];
	}
}

/** Starts tracking. Call `restore` when the test ends, also when it fails. */
export const trackResources = (): ResourceTracker => {
	const globalTargets: ReadonlyMap<EventTarget, string> = new Map<EventTarget, string>([
		[window, 'window'],
		[document, 'document'],
	]);

	const listeners: ListenerRecord[] = [];
	const observers: Map<object, ObserverName> = new Map<object, ObserverName>();
	const intervals: Set<IntervalHandle> = new Set<IntervalHandle>();

	// Read through `Reflect`: they are called later with `call`, on the target they belong to.
	const originalAdd: EventTarget['addEventListener'] = Reflect.get(
		EventTarget.prototype,
		'addEventListener',
	);

	const originalRemove: EventTarget['removeEventListener'] = Reflect.get(
		EventTarget.prototype,
		'removeEventListener',
	);

	const originalSetInterval: typeof setInterval = globalThis.setInterval;
	const originalClearInterval: typeof clearInterval = globalThis.clearInterval;

	const originalObservers: ReadonlyMap<ObserverName, unknown> = new Map<ObserverName, unknown>(
		observerNames.map((name: ObserverName): [ObserverName, unknown] => {
			return [name, Reflect.get(globalThis, name)];
		}),
	);

	const forget = (record: ListenerRecord): void => {
		const index: number = listeners.findIndex((candidate: ListenerRecord): boolean => {
			return sameListener(candidate, record);
		});

		if (index !== -1) listeners.splice(index, 1);
	};

	// `this` is the target of the call, so these replacements of the prototype methods must be functions.
	EventTarget.prototype.addEventListener = function (
		this: EventTarget,
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions,
	): void {
		originalAdd.call(this, type, listener, options);

		const signal: AbortSignal | undefined =
			typeof options === 'object' ? options.signal : undefined;

		const once: boolean = typeof options === 'object' && options.once === true;

		// A listener called once releases itself; one whose signal is already aborted is never added.
		if (!globalTargets.has(this) || listener === null || once || signal?.aborted === true) return;
		const record: ListenerRecord = { target: this, type, listener, capture: captureOf(options) };

		if (listeners.some((candidate: ListenerRecord): boolean => sameListener(candidate, record))) {
			return;
		}

		listeners.push(record);

		signal?.addEventListener('abort', (): void => {
			forget(record);
		});
	};

	EventTarget.prototype.removeEventListener = function (
		this: EventTarget,
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options?: boolean | EventListenerOptions,
	): void {
		originalRemove.call(this, type, listener, options);
		if (listener === null) return;
		forget({ target: this, type, listener, capture: captureOf(options) });
	};

	globalThis.setInterval = ((...parameters: Parameters<typeof setInterval>): IntervalHandle => {
		const handle: IntervalHandle = originalSetInterval(...parameters);
		intervals.add(handle);
		return handle;
	}) as typeof setInterval;

	globalThis.clearInterval = (handle: IntervalHandle | string | number | undefined): void => {
		originalClearInterval(handle);
		intervals.delete(handle as IntervalHandle);
	};

	observerNames.forEach((name: ObserverName): void => {
		const Base: ObserverConstructor =
			(originalObservers.get(name) as ObserverConstructor | undefined) ?? SilentObserver;

		const Tracked: ObserverConstructor = class extends Base {
			public observe(...parameters: unknown[]): void {
				Reflect.apply(Reflect.get(Base.prototype, 'observe') as () => void, this, parameters);
				observers.set(this, name);
			}

			public disconnect(): void {
				Reflect.apply(Reflect.get(Base.prototype, 'disconnect') as () => void, this, []);
				observers.delete(this);
			}
		};

		Reflect.set(globalThis, name, Tracked);
	});

	return {
		held: (): HeldResource[] => {
			const heldListeners: HeldResource[] = listeners.map(
				(record: ListenerRecord): HeldResource => {
					const target: string = globalTargets.get(record.target) ?? 'unknown';
					return `${target} ${record.type}${record.capture ? ' (capture)' : ''}`;
				},
			);

			return [
				...heldListeners,
				...observers.values(),
				...Array.from(intervals, (): HeldResource => 'interval'),
			].toSorted();
		},
		restore: (): void => {
			EventTarget.prototype.addEventListener = originalAdd;
			EventTarget.prototype.removeEventListener = originalRemove;
			globalThis.setInterval = originalSetInterval;
			globalThis.clearInterval = originalClearInterval;

			originalObservers.forEach((original: unknown, name: ObserverName): void => {
				if (original === undefined) {
					Reflect.deleteProperty(globalThis, name);
					return;
				}

				Reflect.set(globalThis, name, original);
			});
		},
	};
};
