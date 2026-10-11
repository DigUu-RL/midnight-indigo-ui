// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { reducedMotionMediaQuery } from '#src/tokens/index.ts';
import { Carousel } from '#src/data-display/carousel/index.tsx';

const slideNames: readonly string[] = ['Revenue', 'Users', 'Churn'];

const slides: ReactElement[] = slideNames.map((name: string): ReactElement => {
	return (
		<p key={name}>
			{name} <a href={`#${name}`}>details</a>
		</p>
	);
});

afterEach((): void => {
	cleanup();
});

const visibleSlide = (): HTMLElement => {
	const visible: HTMLElement | undefined = screen
		.getAllByRole('group', { hidden: true })
		.find((group: HTMLElement): boolean => {
			return group.getAttribute('aria-roledescription') === 'slide' && !group.hasAttribute('inert');
		});

	if (visible === undefined) throw new Error('No visible slide.');
	return visible;
};

describe('Carousel structure', (): void => {
	it('is a named region of slides, with named controls and no axe violations', async (): Promise<void> => {
		const { container } = render(<Carousel label='Highlights'>{slides}</Carousel>);
		const region: HTMLElement = screen.getByRole('region', { name: 'Highlights' });

		expect(region.getAttribute('aria-roledescription')).toBe('carousel');
		expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Next slide' })).toBeDefined();
		expect(screen.getByRole('group', { name: 'Choose a slide' })).toBeDefined();
		expect(visibleSlide().getAttribute('aria-label')).toBe('1 of 3');
		await expectNoAxeViolations(container);
	});

	it('removes hidden slides from the tab order and the accessibility tree', (): void => {
		render(<Carousel label='Highlights'>{slides}</Carousel>);

		const hiddenSlides: HTMLElement[] = screen
			.getAllByRole('group', { hidden: true })
			.filter((group: HTMLElement): boolean => {
				return group.hasAttribute('inert');
			});

		expect(
			hiddenSlides.map((slide: HTMLElement): string | null => slide.getAttribute('aria-label')),
		).toEqual(['2 of 3', '3 of 3']);

		expect(screen.getAllByRole('link')).toHaveLength(1);
		expect(screen.getByRole('link').getAttribute('href')).toBe('#Revenue');
	});

	it('takes every text from labels, for translation', (): void => {
		render(
			<Carousel
				label='Destaques'
				labels={{
					carousel: 'carrossel',
					slide: 'slide',
					previous: 'Slide anterior',
					next: 'Próximo slide',
					slidePicker: 'Escolher um slide',
					slidePosition: (position: number, total: number): string => {
						return `${String(position)} de ${String(total)}`;
					},
				}}
			>
				{slides}
			</Carousel>,
		);

		expect(screen.getByRole('region').getAttribute('aria-roledescription')).toBe('carrossel');
		expect(screen.getByRole('button', { name: 'Próximo slide' })).toBeDefined();
		expect(screen.getByRole('button', { name: '2 de 3' })).toBeDefined();
	});

	it('has no controls with a single slide', (): void => {
		render(<Carousel label='Highlights'>{slides[0]}</Carousel>);

		expect(screen.queryAllByRole('button')).toHaveLength(0);
	});

	it('animates with the motion tokens and not at all under reduced motion', (): void => {
		render(<Carousel label='Highlights'>{slides}</Carousel>);
		const track: HTMLElement | null = visibleSlide().parentElement;
		const rules: string[] = styleRulesOf(track ?? document.body);

		expect(rules.join('')).toContain('transition-duration:var(--mi-motion-duration-slow);');
		expect(rules).toContain(`@media ${reducedMotionMediaQuery}{&{transition-duration:0ms;}}`);
		expect(track?.style.getPropertyValue('--mi-carousel-index')).toBe('0');
	});
});

describe('Carousel navigation', (): void => {
	it('moves with the previous and next buttons, which stay focusable at the ends', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<Carousel label='Highlights'>{slides}</Carousel>);
		const previous: HTMLElement = screen.getByRole('button', { name: 'Previous slide' });
		const next: HTMLElement = screen.getByRole('button', { name: 'Next slide' });

		expect(previous.getAttribute('aria-disabled')).toBe('true');

		await user.click(next);
		await user.click(next);
		expect(visibleSlide().getAttribute('aria-label')).toBe('3 of 3');
		expect(next.getAttribute('aria-disabled')).toBe('true');

		await user.click(next);
		expect(visibleSlide().getAttribute('aria-label')).toBe('3 of 3');
		expect(document.activeElement).toBe(next);

		await user.click(previous);
		expect(visibleSlide().getAttribute('aria-label')).toBe('2 of 3');
	});

	it('moves with arrow keys, Home and End on the position buttons, which keep a single tab stop', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<Carousel label='Highlights'>{slides}</Carousel>);

		// jsdom ignores inert, so focus goes to the picker directly instead of tabbing past the slide links.
		screen.getByRole('button', { name: '1 of 3' }).focus();

		await user.keyboard('{ArrowRight}');
		expect(visibleSlide().getAttribute('aria-label')).toBe('2 of 3');
		expect(document.activeElement?.getAttribute('aria-current')).toBe('true');
		expect(document.activeElement?.getAttribute('aria-label')).toBe('2 of 3');

		await user.keyboard('{End}');
		expect(visibleSlide().getAttribute('aria-label')).toBe('3 of 3');

		await user.keyboard('{Home}');
		expect(visibleSlide().getAttribute('aria-label')).toBe('1 of 3');

		await user.tab();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Next slide');
	});

	it('goes around the ends with loop', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		render(
			<Carousel label='Highlights' loop>
				{slides}
			</Carousel>,
		);

		await user.click(screen.getByRole('button', { name: 'Previous slide' }));
		expect(visibleSlide().getAttribute('aria-label')).toBe('3 of 3');
	});

	it('can be controlled by the parent', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleIndexChange = vi.fn();

		const ControlledCarousel = (): ReactElement => {
			const [index, setIndex] = useState<number>(1);

			return (
				<Carousel
					label='Highlights'
					index={index}
					onIndexChange={(next: number): void => {
						handleIndexChange(next);
						setIndex(next);
					}}
				>
					{slides}
				</Carousel>
			);
		};

		render(<ControlledCarousel />);
		expect(visibleSlide().getAttribute('aria-label')).toBe('2 of 3');

		await user.click(screen.getByRole('button', { name: '1 of 3' }));

		expect(handleIndexChange).toHaveBeenCalledWith(0);
		expect(visibleSlide().getAttribute('aria-label')).toBe('1 of 3');
	});
});
