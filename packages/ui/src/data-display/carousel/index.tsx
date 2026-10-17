'use client';
// Slides shown one at a time, following the carousel pattern of the WAI-ARIA Authoring Practices (no autoplay).
import { styled } from '@mui/material/styles';
import { Children, useRef, useState } from 'react';
import type {
	ComponentPropsWithRef,
	CSSProperties,
	KeyboardEvent,
	ReactElement,
	ReactNode,
	RefObject,
} from 'react';

import { useComponentLabels } from '#src/shared/component-labels/index.tsx';
import { IconButton } from '#src/buttons/icon-button/index.tsx';
import {
	assertLabel,
	colorTransitionStyles,
	focusRingStyles,
	reducedMotion,
} from '#src/shared/appearance.ts';
import { Glyph } from '#src/shared/glyphs/index.tsx';
import { themeVariables } from '#src/theme/theme-variables.ts';

const { spacing, radius, border, motion, intent }: typeof themeVariables = themeVariables;

/** Every text the carousel announces. Translate them with the rest of the interface. */
export interface CarouselLabels {
	/** Role description of the region. */
	carousel: string;
	/** Role description of each slide. */
	slide: string;
	previous: string;
	next: string;
	/** Name of the group of position buttons. */
	slidePicker: string;
	/** Name of a slide, from its 1-based position. */
	slidePosition: (position: number, total: number) => string;
}

export const defaultCarouselLabels: Readonly<CarouselLabels> = Object.freeze({
	carousel: 'carousel',
	slide: 'slide',
	previous: 'Previous slide',
	next: 'Next slide',
	slidePicker: 'Choose a slide',
	slidePosition: (position: number, total: number): string => {
		return `${String(position)} of ${String(total)}`;
	},
});

export interface CarouselProps extends Omit<
	ComponentPropsWithRef<'section'>,
	'children' | 'aria-label' | 'onChange'
> {
	/** Accessible name of the carousel, e.g. `'Featured reports'`. Cannot be blank. */
	label: string;
	/** One child per slide. */
	children: ReactNode;
	/** Index of the visible slide, when the parent controls it. */
	index?: number;
	/** Initial slide when uncontrolled. Defaults to 0. */
	defaultIndex?: number;
	/** Called with the index of the slide that should become visible. */
	onIndexChange?: (index: number) => void;
	/** Goes from the last slide to the first and back. Defaults to `false`. */
	loop?: boolean;
	/** Overrides some or all of `defaultCarouselLabels`. */
	labels?: Partial<CarouselLabels>;
}

const carouselIndexVariable: string = '--mi-carousel-index';

const Root = styled('section')({
	display: 'flex',
	flexDirection: 'column',
	gap: spacing[3],
	minWidth: 0,
});

const Viewport = styled('div')({ overflow: 'hidden', borderRadius: radius.large });

const Track = styled('div')({
	display: 'flex',
	transform: `translateX(calc(var(${carouselIndexVariable}) * -100%))`,
	transitionProperty: 'transform',
	transitionDuration: motion.duration.slow,
	transitionTimingFunction: motion.easing.standard,
	'[dir="rtl"] &': { transform: `translateX(calc(var(${carouselIndexVariable}) * 100%))` },
	[reducedMotion]: { transitionDuration: '0ms' },
});

const Slide = styled('div')({ flex: '0 0 100%', minWidth: 0 });

const Controls = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	alignItems: 'center',
	justifyContent: 'center',
	gap: spacing[2],
	// The chevrons point in the reading direction.
	'[dir="rtl"] & svg': { transform: 'scaleX(-1)' },
});

const Picker = styled('div')({ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' });

// The target is 24 px (WCAG 2.2 minimum); the visible mark inside it is smaller. The current mark is also wider,
// so the position does not depend on color alone.
const PickerButton = styled('button')({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: '1.5rem',
	height: '1.5rem',
	margin: 0,
	padding: 0,
	border: 0,
	borderRadius: radius.pill,
	background: 'none',
	cursor: 'pointer',
	...focusRingStyles,
	'&::before': {
		content: '""',
		width: spacing[2],
		height: spacing[2],
		borderRadius: radius.pill,
		backgroundColor: border.control,
		...colorTransitionStyles,
		transitionProperty: 'background-color, width',
	},
	'&:hover::before': { backgroundColor: intent.brand.hover },
	'&[aria-current="true"]::before': { width: spacing[4], backgroundColor: intent.brand.border },
});

const editableSelector: string =
	'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

const clampIndex = (index: number, total: number): number => {
	return Math.min(Math.max(index, 0), Math.max(total - 1, 0));
};

export const Carousel = ({
	label,
	children,
	index,
	defaultIndex = 0,
	onIndexChange,
	loop = false,
	labels,
	...attributes
}: CarouselProps): ReactElement => {
	const text: CarouselLabels = useComponentLabels('carousel', defaultCarouselLabels, labels);
	const slides: ReactNode[] = Children.toArray(children);
	const total: number = slides.length;
	const [uncontrolledIndex, setUncontrolledIndex] = useState<number>(defaultIndex);
	const current: number = clampIndex(index ?? uncontrolledIndex, total);

	const pickerReferences: RefObject<(HTMLButtonElement | null)[]> = useRef<
		(HTMLButtonElement | null)[]
	>([]);

	const atStart: boolean = !loop && current === 0;
	const atEnd: boolean = !loop && current === total - 1;

	const resolveTarget = (target: number): number => {
		return loop ? (target + total) % total : clampIndex(target, total);
	};

	const goTo = (target: number): number => {
		const next: number = resolveTarget(target);
		if (next === current) return next;
		if (index === undefined) setUncontrolledIndex(next);
		onIndexChange?.(next);
		return next;
	};

	// Arrow keys follow the reading direction; Home and End go to the ends. Fields inside slides keep their keys.
	const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
		if (!(event.target instanceof HTMLElement) || event.target.closest(editableSelector) !== null) {
			return;
		}

		const rightToLeft: boolean = getComputedStyle(event.currentTarget).direction === 'rtl';

		const targets: Record<string, number> = {
			ArrowLeft: rightToLeft ? current + 1 : current - 1,
			ArrowRight: rightToLeft ? current - 1 : current + 1,
			Home: 0,
			End: total - 1,
		};

		const target: number | undefined = targets[event.key];
		if (target === undefined || total < 2) return;
		event.preventDefault();
		const next: number = goTo(target);

		const pickerHasFocus: boolean = pickerReferences.current.includes(
			event.target as HTMLButtonElement,
		);

		if (pickerHasFocus) pickerReferences.current[next]?.focus();
	};

	const trackStyle: CSSProperties = { [carouselIndexVariable]: current };

	return (
		<Root
			{...attributes}
			aria-roledescription={text.carousel}
			aria-label={assertLabel(label, 'The label of a Carousel')}
			onKeyDown={handleKeyDown}
		>
			<Viewport>
				<Track aria-live='polite' style={trackStyle}>
					{slides.map((slide: ReactNode, position: number): ReactElement => {
						return (
							<Slide
								key={position}
								role='group'
								aria-roledescription={text.slide}
								aria-label={text.slidePosition(position + 1, total)}
								inert={position !== current}
								aria-hidden={position === current ? undefined : true}
							>
								{slide}
							</Slide>
						);
					})}
				</Track>
			</Viewport>

			{total > 1 ? (
				<Controls>
					<IconButton
						label={text.previous}
						aria-disabled={atStart}
						onClick={(): void => {
							goTo(current - 1);
						}}
					>
						<Glyph name='chevronLeft' />
					</IconButton>

					<Picker role='group' aria-label={text.slidePicker}>
						{slides.map((_: ReactNode, position: number): ReactElement => {
							return (
								<PickerButton
									key={position}
									ref={(element: HTMLButtonElement | null): void => {
										pickerReferences.current[position] = element;
									}}
									type='button'
									aria-label={text.slidePosition(position + 1, total)}
									aria-current={position === current ? 'true' : undefined}
									tabIndex={position === current ? 0 : -1}
									onClick={(): void => {
										goTo(position);
									}}
								/>
							);
						})}
					</Picker>

					<IconButton
						label={text.next}
						aria-disabled={atEnd}
						onClick={(): void => {
							goTo(current + 1);
						}}
					>
						<Glyph name='chevronRight' />
					</IconButton>
				</Controls>
			) : null}
		</Root>
	);
};
