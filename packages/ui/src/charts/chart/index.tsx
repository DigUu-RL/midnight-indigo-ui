'use client';
// Interactive chart drawn by Apache ECharts, which loads on demand: the title, the legend, the zoom controls, the
// states and the text alternatives (summary, keyboard announcements and data table) are rendered by the library.
import { styled } from '@mui/material/styles';
import { useEffect, useEffectEvent, useId, useMemo, useRef, useState } from 'react';
import type {
	ComponentPropsWithRef,
	KeyboardEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { useComponentLabels } from '@/src/shared/component-labels/index';
import { focusRingStyles, prettyWrapStyles, visuallyHiddenStyles } from '@/src/shared/appearance';
import { Glyph } from '@/src/shared/glyphs/index';
import { themeVariables } from '@/src/theme/theme-variables';
import { useUiTheme } from '@/src/theme/ui-provider';
import { usePrefersReducedMotion } from '@/src/theme/use-prefers-reduced-motion';
import { Button } from '@/src/buttons/button/index';
import { IconButton } from '@/src/buttons/icon-button/index';
import { EmptyState } from '@/src/data-display/empty-state/index';
import { ErrorState } from '@/src/data-display/error-state/index';
import { Skeleton } from '@/src/data-display/skeleton/index';
import type * as ChartEngineModule from '@/src/charts/chart-engine/index';
import type { ChartEngineInstance } from '@/src/charts/chart-engine/index';
import { ChartDataTable } from '@/src/charts/chart-data-table/index';
import type {
	ChartDefinition,
	ChartRenderer,
	ZoomWindow,
} from '@/src/charts/chart-factories/index';
import { defaultChartLabels } from '@/src/charts/chart-labels/index';
import type { ChartLabels } from '@/src/charts/chart-labels/index';
import { ChartLegend } from '@/src/charts/chart-legend/index';
import type { LegendItem } from '@/src/charts/chart-legend/index';
import { createChartModel, isEmptyModel, pointCountOf } from '@/src/charts/chart-model/index';
import type { ChartModel, ModelSeries, PieSlice } from '@/src/charts/chart-model/index';
import {
	cyclic,
	seriesDashes,
	seriesMarkers,
	seriesPatterns,
	toEngineOption,
	toViewOption,
} from '@/src/charts/chart-option/index';
import type { ChartAppearance, ChartViewState } from '@/src/charts/chart-option/index';
import { describePoint, summarizeChart } from '@/src/charts/chart-summary/index';

const { spacing, typography, fontWeight, text, intent }: typeof themeVariables = themeVariables;

type EngineModule = typeof ChartEngineModule;

/** `ready` draws the data (or the empty state), `loading` a placeholder and `error` the error state. */
export type ChartStatus = 'ready' | 'loading' | 'error';

/** The point, bar or slice that was clicked, tapped or chosen with Enter. */
export interface ChartSelection<Datum> {
	datum: Datum;
	/** Position of `datum` in `data`. */
	index: number;
	/** Label of the series, or `undefined` for a slice of a pie. */
	series: string | undefined;
}

export type ChartProps<Datum> = Omit<
	ComponentPropsWithRef<'div'>,
	'children' | 'title' | 'onSelect'
> & {
	/** What to draw: the result of `createLineChart`, `createBarChart`... Keep it stable (`useMemo`) between renders. */
	chart: ChartDefinition<Datum>;
	/** Name of the chart, rendered as its caption. Required: it names the chart for assistive technologies. */
	title: string;
	/** Hides the title visually, e.g. under a heading that says the same. Defaults to `false`. */
	hideTitle?: boolean;
	/** What the chart shows and why, under the title. */
	description?: ReactNode;
	/** Replaces the summary generated from the data, read by assistive technologies. */
	summary?: string;
	/** Defaults to `'ready'`. */
	status?: ChartStatus;
	/** Marks the data as possibly out of date, e.g. while it refreshes: the chart stays, with a notice. */
	stale?: boolean;
	/** Explanation under the title of the error state. */
	errorDescription?: ReactNode;
	/** Shows a retry button in the error state. */
	onRetry?: () => void;
	/** Replaces the default empty state. */
	emptyState?: ReactNode;
	/** CSS height of the drawing area. Defaults to `'20rem'`. */
	height?: string;
	/** Colors of the series (or slices), in order, in place of the `chart.series` tokens of the theme. */
	palette?: readonly string[];
	/** Fills bars, areas and slices with a pattern per series besides the color. Defaults to `true`. */
	patterns?: boolean;
	/** Defaults to `'canvas'`. */
	renderer?: ChartRenderer;
	/** Offers a button that shows the data as a table. Defaults to `true`, except for gauges. */
	dataTable?: boolean;
	/** Loads the engine and draws only when the chart comes near the viewport. Defaults to `false`. */
	lazy?: boolean;
	/** Locale of the default number format and of the summary. Defaults to the runtime locale. */
	locale?: string;
	/** Overrides some or all of `defaultChartLabels`. */
	labels?: Partial<ChartLabels>;
	/** Makes points, bars and slices selectable, e.g. to drill down into a category. */
	onSelect?: (selection: ChartSelection<Datum>) => void;
	/** Called with the visible categories after zooming, or `null` when every one is visible. */
	onZoomChange?: (window: ZoomWindow | null) => void;
	/** Called with the labels of the hidden series (or names of the hidden slices) after a legend toggle. */
	onHiddenChange?: (hidden: readonly string[]) => void;
	/** Series (or slices) hidden at first. */
	defaultHidden?: readonly string[];
};

/** What the engine last received in full, to send only the view when nothing else changed. */
interface AppliedOption {
	model: ChartModel;
	appearance: ChartAppearance;
	shape: string;
	instance: ChartEngineInstance;
}

let enginePromise: Promise<EngineModule> | undefined;

/** Loads the engine once for every chart; a failed load is tried again by the next chart. */
const loadChartEngine = (): Promise<EngineModule> => {
	enginePromise ??= import('@/src/charts/chart-engine/index').catch((error: unknown): never => {
		enginePromise = undefined;
		throw error;
	});

	return enginePromise;
};

const Root = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[3],
	minWidth: 0,
	margin: 0,
});

const Header = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: spacing[3],
});

const Heading = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[1],
	minWidth: 0,
});

const Title = styled('p')({
	...typography.headingSmall,
	...prettyWrapStyles,
	margin: 0,
	fontWeight: fontWeight.semibold,
	color: text.primary,
});

const HiddenTitle = styled('p')(visuallyHiddenStyles);

const Description = styled('p')({
	...typography.bodySmall,
	...prettyWrapStyles,
	margin: 0,
	color: text.secondary,
});

const StaleNotice = styled('p')({
	display: 'inline-flex',
	alignItems: 'center',
	gap: spacing[1],
	margin: 0,
	...typography.bodySmall,
	color: intent.warning.text,
});

const Toolbar = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	gap: spacing[1],
});

const Surface = styled('div')({
	position: 'relative',
	minWidth: 0,
	borderRadius: themeVariables.radius.control,
	...focusRingStyles,
});

const Drawing = styled('div')({ width: '100%' });

const HiddenText = styled('div')(visuallyHiddenStyles);

const keyboardKeys: readonly string[] = [
	'ArrowRight',
	'ArrowDown',
	'ArrowLeft',
	'ArrowUp',
	'Home',
	'End',
	'Enter',
	' ',
	'Escape',
	'+',
	'=',
	'-',
];

const sameZoom = (first: ZoomWindow | null, second: ZoomWindow | null): boolean => {
	return first?.start === second?.start && first?.end === second?.end;
};

const clampZoom = (zoom: ZoomWindow | null, count: number): ZoomWindow | null => {
	if (zoom === null || count === 0) return null;

	const start: number = Math.min(Math.max(0, zoom.start), count - 1);
	const end: number = Math.min(Math.max(start, zoom.end), count - 1);

	return start === 0 && end === count - 1 ? null : { start, end };
};

/** A window of `width` categories around `center`, inside the axis. */
const windowAround = (center: number, width: number, count: number): ZoomWindow | null => {
	if (width >= count) return null;

	const start: number = Math.min(Math.max(0, center - Math.floor(width / 2)), count - width);
	return { start, end: start + width - 1 };
};

const legendItemsOf = (model: ChartModel, colors: readonly string[]): LegendItem[] => {
	if (model.kind === 'gauge') return [];

	if (model.kind === 'pie') {
		return model.slices.map((slice: PieSlice, index: number): LegendItem => {
			return {
				label: slice.name,
				color: cyclic(colors, index),
				kind: 'fill',
				marker: cyclic(seriesMarkers, index),
				dash: [],
				pattern: cyclic(seriesPatterns, index),
			};
		});
	}

	return model.series.map((series: ModelSeries, index: number): LegendItem => {
		return {
			label: series.label,
			color: cyclic(colors, index),
			kind: series.type === 'line' ? 'line' : 'fill',
			marker: cyclic(seriesMarkers, index),
			dash: cyclic(seriesDashes, index),
			pattern: cyclic(seriesPatterns, index),
		};
	});
};

const resolveColors = (model: ChartModel, palette: readonly string[]): string[] => {
	if (model.kind === 'cartesian') {
		return model.series.map((series: ModelSeries, index: number): string => {
			return series.color ?? cyclic(palette, index);
		});
	}

	const count: number = model.kind === 'pie' ? model.slices.length : 1;
	return Array.from({ length: Math.max(1, count) }, (_: unknown, index: number): string => {
		return cyclic(palette, index);
	});
};

// Several things change the shape of the option (the type, the axes, the zoom controls, the series); the engine then
// replaces its option instead of merging, which would keep the parts that no longer exist.
const shapeOf = (definition: ChartDefinition<unknown>, model: ChartModel): string => {
	const series: number = model.kind === 'cartesian' ? model.series.length : 1;
	const orientation: string = definition.type === 'bar' ? definition.orientation : '';

	return [definition.type, orientation, String(definition.interaction.zoom), String(series)].join(
		':',
	);
};

const rootFontSize = (): number => {
	return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
};

const useNearViewport = (lazy: boolean, element: RefObject<HTMLElement | null>): boolean => {
	const [near, setNear] = useState<boolean>(!lazy);

	useEffect((): (() => void) | undefined => {
		const target: HTMLElement | null = element.current;

		if (near || target === null || typeof IntersectionObserver === 'undefined') {
			if (!near) setNear(true);
			return undefined;
		}

		const observer: IntersectionObserver = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]): void => {
				if (entries.some((entry: IntersectionObserverEntry): boolean => entry.isIntersecting)) {
					setNear(true);
				}
			},
			{ rootMargin: '200px' },
		);

		observer.observe(target);

		return (): void => {
			observer.disconnect();
		};
	}, [near, element]);

	return near;
};

/**
 * A figure named by its `title`. The drawing is hidden from assistive technologies, which read the summary instead;
 * it is focusable, and the arrow keys move between points, show their tooltip and announce their values. The legend
 * and the zoom controls are buttons, and the data table is one button away. Series differ by color and also by
 * marker, dash and pattern.
 */
export const Chart = <Datum,>({
	chart,
	title,
	hideTitle = false,
	description,
	summary,
	status = 'ready',
	stale = false,
	errorDescription,
	onRetry,
	emptyState,
	height = '20rem',
	palette,
	patterns = true,
	renderer = 'canvas',
	dataTable = chart.type !== 'gauge',
	lazy = false,
	locale,
	labels,
	onSelect,
	onZoomChange,
	onHiddenChange,
	defaultHidden = [],
	...attributes
}: ChartProps<Datum>): ReactElement => {
	const texts: ChartLabels = useComponentLabels('chart', defaultChartLabels, labels);
	const { tokens } = useUiTheme();
	const reducedMotion: boolean = usePrefersReducedMotion();
	const definition: ChartDefinition<unknown> = chart;
	const titleId: string = useId();
	const summaryId: string = useId();
	const helpId: string = useId();
	const tableId: string = useId();
	const rootRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
	const drawingRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
	const instanceRef: RefObject<ChartEngineInstance | null> = useRef<ChartEngineInstance>(null);
	const appliedRef: RefObject<AppliedOption | null> = useRef<AppliedOption>(null);

	const [hidden, setHidden] = useState<ReadonlySet<string>>(
		(): ReadonlySet<string> => new Set(defaultHidden),
	);

	const [requestedZoom, setRequestedZoom] = useState<ZoomWindow | null>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [announcement, setAnnouncement] = useState<string>('');
	const [tableOpen, setTableOpen] = useState<boolean>(false);
	const [engineFailed, setEngineFailed] = useState<boolean>(false);
	const [instanceVersion, setInstanceVersion] = useState<number>(0);
	const [fontSize, setFontSize] = useState<number>(12);
	const nearViewport: boolean = useNearViewport(lazy, rootRef);

	const model: ChartModel = useMemo(
		(): ChartModel => createChartModel(definition, locale),
		[definition, locale],
	);

	const categoryCount: number = model.kind === 'cartesian' ? model.categories.length : 0;
	// New data keeps the zoom, cut to the categories that still exist.
	const zoom: ZoomWindow | null = clampZoom(requestedZoom, categoryCount);
	const empty: boolean = isEmptyModel(model);
	const drawn: boolean = status === 'ready' && !empty && !engineFailed;
	const interactive: boolean = drawn && model.kind !== 'gauge';
	const zoomable: boolean = interactive && definition.interaction.zoom && categoryCount > 2;

	const colors: string[] = useMemo(
		(): string[] => resolveColors(model, palette ?? tokens.chart.series),
		[model, palette, tokens],
	);

	const selectable: boolean = onSelect !== undefined;

	const appearance: ChartAppearance = useMemo((): ChartAppearance => {
		return { colors, tokens, patterns, animation: !reducedMotion, selectable, fontSize };
	}, [colors, tokens, patterns, reducedMotion, selectable, fontSize]);

	const zoomStart: number | undefined = zoom?.start;
	const zoomEnd: number | undefined = zoom?.end;

	const view: ChartViewState = useMemo((): ChartViewState => {
		return {
			hidden,
			zoom:
				zoomStart === undefined || zoomEnd === undefined
					? null
					: { start: zoomStart, end: zoomEnd },
		};
	}, [hidden, zoomStart, zoomEnd]);

	const generatedSummary: string = useMemo(
		(): string => summarizeChart(model, texts, locale),
		[model, texts, locale],
	);

	// Points the keyboard reaches: every category, or the slices that are shown.
	const navigable: number[] = useMemo((): number[] => {
		if (model.kind === 'cartesian') {
			return model.categories.map((_: string, index: number): number => index);
		}

		if (model.kind === 'gauge') return [];

		return model.slices.flatMap((slice: PieSlice, index: number): number[] => {
			return hidden.has(slice.name) ? [] : [index];
		});
	}, [model, hidden]);

	const select = (seriesIndex: number | undefined, index: number): void => {
		if (onSelect === undefined) return;

		if (model.kind === 'pie') {
			const slice: PieSlice | undefined = model.slices[index];
			if (slice === undefined) return;

			onSelect({
				datum: model.definition.data[slice.datumIndex] as Datum,
				index: slice.datumIndex,
				series: undefined,
			});

			return;
		}

		if (model.kind !== 'cartesian') return;

		const series: ModelSeries | undefined =
			seriesIndex === undefined
				? model.series.find((candidate: ModelSeries): boolean => !hidden.has(candidate.label))
				: model.series[seriesIndex];

		onSelect({ datum: model.definition.data[index] as Datum, index, series: series?.label });
	};

	const zoomRangeText = (window: ZoomWindow | null): string => {
		if (model.kind !== 'cartesian') return '';

		const first: string = model.categories[window?.start ?? 0] ?? '';
		const last: string = model.categories[window?.end ?? categoryCount - 1] ?? '';

		return texts.zoomRange(first, last);
	};

	/** Zooms to `window`; announces the new range unless the keyboard moved, which announces the point instead. */
	const applyZoom = (window: ZoomWindow | null, announce: boolean = true): void => {
		const next: ZoomWindow | null = clampZoom(window, categoryCount);
		if (sameZoom(next, zoom)) return;

		setRequestedZoom(next);
		if (announce) setAnnouncement(zoomRangeText(next));
		onZoomChange?.(next);
	};

	const handleItemClick = useEffectEvent((seriesIndex: number, dataIndex: number): void => {
		select(seriesIndex, dataIndex);
	});

	const handleEngineZoom = useEffectEvent((window: ZoomWindow): void => {
		applyZoom(window);
	});

	// One engine instance for as long as the drawing is shown; updates only change its option.
	useEffect((): (() => void) | undefined => {
		const element: HTMLDivElement | null = drawingRef.current;
		if (!drawn || !nearViewport || element === null) return undefined;

		let cancelled: boolean = false;
		let instance: ChartEngineInstance | null = null;
		setFontSize(rootFontSize() * 0.75);

		loadChartEngine().then(
			(engine: EngineModule): void => {
				if (cancelled) return;

				instance = engine.createChartInstance(element, renderer, {
					onItemClick: (seriesIndex: number, dataIndex: number): void => {
						handleItemClick(seriesIndex, dataIndex);
					},
					onZoom: (window: ZoomWindow): void => {
						handleEngineZoom(window);
					},
				});

				instanceRef.current = instance;
				setInstanceVersion((version: number): number => version + 1);
			},
			(): void => {
				if (!cancelled) setEngineFailed(true);
			},
		);

		return (): void => {
			cancelled = true;
			instance?.dispose();
			instanceRef.current = null;
		};
	}, [drawn, nearViewport, renderer]);

	useEffect((): void => {
		const instance: ChartEngineInstance | null = instanceRef.current;
		if (instance === null) return;

		const applied: AppliedOption | null = appliedRef.current;

		// A change of the view alone (legend, zoom) sends only the view; new data or a new look sends everything.
		if (
			applied?.model === model &&
			applied.appearance === appearance &&
			applied.instance === instance
		) {
			instance.update(toViewOption(model, view), false);
			return;
		}

		const shape: string = shapeOf(definition, model);

		instance.update(
			toEngineOption(model, appearance, view),
			applied?.shape !== shape || applied.instance !== instance,
		);

		appliedRef.current = { model, appearance, shape, instance };
	}, [definition, model, appearance, view, instanceVersion]);

	useEffect((): void => {
		const instance: ChartEngineInstance | null = instanceRef.current;
		if (instance === null) return;

		// New data may end before the point the keyboard reached.
		if (activeIndex === null || activeIndex >= pointCountOf(model)) {
			instance.hidePoint();
			return;
		}

		const horizontal: boolean =
			definition.type === 'bar' && definition.orientation === 'horizontal';

		instance.showPoint(
			model.kind === 'pie'
				? { slice: activeIndex }
				: { category: activeIndex, axis: horizontal ? 'y' : 'x' },
		);
	}, [activeIndex, definition, model, appearance, view, instanceVersion]);

	const moveTo = (index: number): void => {
		setActiveIndex(index);
		setAnnouncement(describePoint(model, index, hidden, texts, locale));

		const visibleWidth: number = zoom === null ? categoryCount : zoom.end - zoom.start + 1;
		const outside: boolean = zoom !== null && (index < zoom.start || index > zoom.end);
		if (outside) applyZoom(windowAround(index, visibleWidth, categoryCount), false);
	};

	const zoomBy = (factor: number): void => {
		const current: ZoomWindow = zoom ?? { start: 0, end: categoryCount - 1 };
		const width: number = current.end - current.start + 1;
		const nextWidth: number = Math.min(categoryCount, Math.max(2, Math.round(width * factor)));
		const center: number = activeIndex ?? Math.floor((current.start + current.end) / 2);

		applyZoom(windowAround(center, nextWidth, categoryCount));
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (!keyboardKeys.includes(event.key) || navigable.length === 0) return;
		event.preventDefault();

		const position: number = activeIndex === null ? -1 : navigable.indexOf(activeIndex);
		const last: number = navigable.length - 1;

		const step = (offset: number): number => {
			return navigable[Math.min(Math.max(0, position + offset), last)] ?? 0;
		};

		const actions: Record<string, () => void> = {
			ArrowRight: (): void => {
				moveTo(position === -1 ? (navigable[0] ?? 0) : step(1));
			},
			ArrowDown: (): void => {
				moveTo(position === -1 ? (navigable[0] ?? 0) : step(1));
			},
			ArrowLeft: (): void => {
				moveTo(position === -1 ? (navigable[0] ?? 0) : step(-1));
			},
			ArrowUp: (): void => {
				moveTo(position === -1 ? (navigable[0] ?? 0) : step(-1));
			},
			Home: (): void => {
				moveTo(navigable[0] ?? 0);
			},
			End: (): void => {
				moveTo(navigable[last] ?? 0);
			},
			Enter: (): void => {
				if (activeIndex !== null) select(undefined, activeIndex);
			},
			' ': (): void => {
				if (activeIndex !== null) select(undefined, activeIndex);
			},
			Escape: (): void => {
				setActiveIndex(null);
			},
			'+': (): void => {
				if (zoomable) zoomBy(0.5);
			},
			'=': (): void => {
				if (zoomable) zoomBy(0.5);
			},
			'-': (): void => {
				if (zoomable) zoomBy(2);
			},
		};

		actions[event.key]?.();
	};

	const toggle = (label: string): void => {
		const next: Set<string> = new Set<string>(
			hidden.has(label)
				? [...hidden].filter((entry: string): boolean => entry !== label)
				: [...hidden, label],
		);

		setHidden(next);
		onHiddenChange?.([...next]);
	};

	const legendItems: LegendItem[] = legendItemsOf(model, colors);
	const showLegend: boolean = drawn && definition.interaction.legend && legendItems.length > 0;

	const hasTable: boolean = dataTable && drawn && model.kind !== 'gauge';

	const help: string = [
		texts.navigationHelp,
		zoomable ? texts.zoomHelp : '',
		onSelect === undefined ? '' : texts.selectHelp,
	]
		.filter((sentence: string): boolean => sentence !== '')
		.join(' ');

	const retry = (): void => {
		if (engineFailed) setEngineFailed(false);
		onRetry?.();
	};

	const renderBody = (): ReactNode => {
		if (status === 'loading') return <Skeleton shape='rectangle' height={height} />;

		if (status === 'error' || engineFailed) {
			return (
				<ErrorState
					title={texts.error}
					description={errorDescription}
					labels={{ retry: texts.retry }}
					{...(onRetry === undefined && !engineFailed ? {} : { onRetry: retry })}
				/>
			);
		}

		if (empty) return emptyState ?? <EmptyState title={texts.empty} />;

		return (
			<Surface
				tabIndex={interactive ? 0 : undefined}
				role={interactive ? 'group' : 'img'}
				aria-labelledby={titleId}
				aria-describedby={interactive ? `${summaryId} ${helpId}` : summaryId}
				onKeyDown={interactive ? handleKeyDown : undefined}
				onBlur={(): void => {
					setActiveIndex(null);
				}}
			>
				<Drawing ref={drawingRef} aria-hidden='true' style={{ height }} />
			</Surface>
		);
	};

	return (
		<Root
			{...attributes}
			ref={rootRef}
			role='figure'
			aria-labelledby={titleId}
			aria-busy={status === 'loading' ? 'true' : undefined}
		>
			<Header>
				<Heading>
					{hideTitle ? (
						<HiddenTitle id={titleId}>{title}</HiddenTitle>
					) : (
						<Title id={titleId}>{title}</Title>
					)}

					{description === undefined ? null : <Description>{description}</Description>}

					{stale ? (
						<StaleNotice>
							<Glyph name='warning' size='small' />
							{texts.stale}
						</StaleNotice>
					) : null}
				</Heading>

				{zoomable || hasTable ? (
					<Toolbar>
						{zoomable ? (
							<>
								<IconButton
									label={texts.zoomIn}
									size='small'
									disabled={zoom !== null && zoom.end - zoom.start + 1 <= 2}
									onClick={(): void => {
										zoomBy(0.5);
									}}
								>
									<Glyph name='plus' />
								</IconButton>

								<IconButton
									label={texts.zoomOut}
									size='small'
									disabled={zoom === null}
									onClick={(): void => {
										zoomBy(2);
									}}
								>
									<Glyph name='minus' />
								</IconButton>

								<Button
									size='small'
									variant='ghost'
									disabled={zoom === null}
									onClick={(): void => {
										applyZoom(null);
									}}
								>
									{texts.resetZoom}
								</Button>
							</>
						) : null}

						{hasTable ? (
							<Button
								size='small'
								variant='ghost'
								aria-expanded={tableOpen}
								aria-controls={tableOpen ? tableId : undefined}
								onClick={(): void => {
									setTableOpen(!tableOpen);
								}}
							>
								{tableOpen ? texts.hideTable : texts.showTable}
							</Button>
						) : null}
					</Toolbar>
				) : null}
			</Header>

			{showLegend ? (
				<ChartLegend label={texts.legend} items={legendItems} hidden={hidden} onToggle={toggle} />
			) : null}

			{renderBody()}

			{hasTable && tableOpen ? (
				<ChartDataTable id={tableId} caption={title} model={model} labels={texts} locale={locale} />
			) : null}

			<HiddenText id={summaryId}>{summary ?? generatedSummary}</HiddenText>

			<div id={helpId} hidden>
				{help}
			</div>

			<HiddenText role='status'>{status === 'loading' ? texts.loading : announcement}</HiddenText>
		</Root>
	);
};
