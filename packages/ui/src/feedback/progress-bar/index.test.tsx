// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { reducedMotionMediaQuery } from '@/src/tokens/index';
import { ProgressBar } from '@/src/feedback/progress-bar/index';

afterEach((): void => {
	cleanup();
});

describe('ProgressBar', (): void => {
	it('exposes a determinate value, clamped to its range', async (): Promise<void> => {
		const { container } = render(
			<>
				<ProgressBar label='Upload' value={40} />

				<ProgressBar
					label='Steps'
					value={7}
					min={0}
					max={5}
					valueText='Step 5 of 5'
					shape='circular'
				/>
			</>,
		);

		const upload: HTMLElement = screen.getByRole('progressbar', { name: 'Upload' });
		const steps: HTMLElement = screen.getByRole('progressbar', { name: 'Steps' });

		expect(upload.getAttribute('aria-valuenow')).toBe('40');
		expect(upload.getAttribute('aria-valuemax')).toBe('100');
		expect(steps.getAttribute('aria-valuenow')).toBe('5');
		expect(steps.getAttribute('aria-valuetext')).toBe('Step 5 of 5');
		await expectNoAxeViolations(container);
	});

	it('leaves the value out while indeterminate', async (): Promise<void> => {
		const { container } = render(<ProgressBar label='Syncing' />);
		const progress: HTMLElement = screen.getByRole('progressbar', { name: 'Syncing' });

		expect(progress.hasAttribute('aria-valuenow')).toBe(false);
		expect(progress.hasAttribute('aria-valuemin')).toBe(false);
		await expectNoAxeViolations(container);
	});

	it('scales the bar to the value, with the motion tokens', (): void => {
		render(<ProgressBar label='Upload' value={25} intent='success' />);
		const track: Element | null = screen.getByRole('progressbar').firstElementChild;
		const indicator: Element | null = track?.firstElementChild ?? null;

		expect(declarationsOf(track ?? document.body, '&')).toContain(
			'background-color:var(--mi-intent-success-container);',
		);

		expect(declarationsOf(indicator ?? document.body, '&')).toContain('transform:scaleX(0.25);');

		expect(declarationsOf(indicator ?? document.body, '&')).toContain(
			'transition-duration:var(--mi-motion-duration-moderate);',
		);
	});

	it('pulses in place instead of moving under reduced motion', (): void => {
		render(
			<>
				<ProgressBar label='Linear' />
				<ProgressBar label='Circular' shape='circular' />
			</>,
		);

		const linear: Element | null =
			screen.getByRole('progressbar', { name: 'Linear' }).firstElementChild?.firstElementChild ??
			null;

		const ring: Element | null = screen
			.getByRole('progressbar', { name: 'Circular' })
			.querySelector('svg');

		const reducedPrefix: string = `@media ${reducedMotionMediaQuery}`;

		const linearReduced: string | undefined = styleRulesOf(linear ?? document.body).find(
			(rule: string): boolean => rule.startsWith(reducedPrefix),
		);

		const ringReduced: string | undefined = styleRulesOf(ring ?? document.body).find(
			(rule: string): boolean => rule.startsWith(reducedPrefix),
		);

		expect(linearReduced).toContain('width:100%;');
		expect(linearReduced).toContain(';transform:none;');
		expect(ringReduced).toContain('stroke-dashoffset:0;');
	});

	it('rejects a blank label', (): void => {
		expect((): void => {
			render(<ProgressBar label='' value={1} />);
		}).toThrow(/label of a ProgressBar cannot be blank/);
	});

	it('keeps the same look (regression)', (): void => {
		render(
			<>
				<ProgressBar label='a' value={50} size='small' />
				<ProgressBar label='b' />
				<ProgressBar label='c' shape='circular' size='large' intent='info' />
			</>,
		);

		const snapshot: string[][] = screen
			.getAllByRole('progressbar')
			.map((progress: HTMLElement): string[] => {
				const styledElements: Element[] = [...progress.querySelectorAll('[class^="css-"]')];
				return styledElements.flatMap(styleRulesOf);
			});

		expect(snapshot).toMatchSnapshot();
	});
});
