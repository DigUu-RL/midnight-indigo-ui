// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, styleRulesOf } from '@/test/component-harness';
import { Container } from '@/src/layout/container/index';
import type { ContainerSize } from '@/src/layout/container/index';

afterEach((): void => {
	cleanup();
});

describe('Container', (): void => {
	it('renders the chosen element with its attributes', (): void => {
		render(
			<Container as='main' id='content' aria-label='Orders'>
				Orders
			</Container>,
		);

		const main: HTMLElement = screen.getByRole('main', { name: 'Orders' });

		expect(main.id).toBe('content');
		expect(main.textContent).toBe('Orders');
	});

	it.each<[ContainerSize, string]>([
		['small', 'max-width:40rem;'],
		['medium', 'max-width:64rem;'],
		['large', 'max-width:80rem;'],
		['full', 'max-width:none;'],
	])('centers a %s container', (size: ContainerSize, maximumWidth: string): void => {
		render(<Container size={size} data-testid='container' />);
		const declarations: string = declarationsOf(screen.getByTestId('container'), '&');

		expect(declarations).toContain(maximumWidth);
		expect(declarations).toContain('margin-inline:auto;');
		expect(declarations).toContain('width:100%;');
	});

	it('widens its gutters at the medium and expanded breakpoints', (): void => {
		render(<Container data-testid='container' />);

		expect(styleRulesOf(screen.getByTestId('container'))).toEqual([
			expect.stringContaining('padding-inline:var(--mi-spacing-4);'),
			'@media (min-width: 37.5em){&{padding-inline:var(--mi-spacing-6);}}',
			'@media (min-width: 52.5em){&{padding-inline:var(--mi-spacing-8);}}',
		]);
	});

	it('can drop the gutters, e.g. for a full-bleed table', (): void => {
		render(<Container gutters={false} data-testid='container' />);
		const rules: string = styleRulesOf(screen.getByTestId('container')).join('');

		expect(rules).not.toContain('padding-inline');
	});
});
