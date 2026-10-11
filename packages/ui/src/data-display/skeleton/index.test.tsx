// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, styleRulesOf } from '#test/component-harness.ts';
import { reducedMotionMediaQuery } from '#src/tokens/index.ts';
import { Skeleton } from '#src/data-display/skeleton/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('Skeleton', (): void => {
	it('is hidden from assistive technologies and sized by its shape', (): void => {
		render(
			<div aria-busy='true' aria-label='Loading orders'>
				<Skeleton data-testid='line' />
				<Skeleton shape='circle' width='3rem' data-testid='circle' />
			</div>,
		);

		const line: HTMLElement = screen.getByTestId('line');

		expect(line.getAttribute('aria-hidden')).toBe('true');
		expect(declarationsOf(line, '&')).toContain('height:1lh;');
		expect(declarationsOf(screen.getByTestId('circle'), '&')).toContain('height:3rem;');
	});

	it('stops pulsing under reduced motion', (): void => {
		render(<Skeleton data-testid='line' />);

		const reducedRule: string | undefined = styleRulesOf(screen.getByTestId('line')).find(
			(rule: string): boolean => rule.startsWith(`@media ${reducedMotionMediaQuery}`),
		);

		expect(reducedRule).toContain('animation-name:none;');
	});
});
