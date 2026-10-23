// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { declarationsOf, expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { Stack } from '@/src/layout/stack/index';

afterEach((): void => {
	cleanup();
});

describe('Stack', (): void => {
	it('stacks its children in a column with the default gap', (): void => {
		render(
			<Stack data-testid='stack'>
				<p>First</p>
				<p>Second</p>
			</Stack>,
		);

		const declarations: string = declarationsOf(screen.getByTestId('stack'), '&');

		expect(declarations).toContain('display:flex;');
		expect(declarations).toContain('flex-direction:column;');
		expect(declarations).toContain('gap:var(--mi-spacing-4);');
		expect(declarations).toContain('align-items:stretch;');
		expect(declarations).toContain('flex-wrap:nowrap;');
	});

	it('changes direction and gap from a breakpoint up', (): void => {
		render(
			<Stack
				data-testid='stack'
				direction={{ compact: 'column', medium: 'row' }}
				gap={{ compact: '2', expanded: '6' }}
			/>,
		);

		expect(styleRulesOf(screen.getByTestId('stack'))).toEqual([
			expect.stringMatching(/flex-direction:column;gap:var\(--mi-spacing-2\);/),
			expect.stringMatching(/^@media \(min-width: 37\.5em\)\{&\{.*flex-direction:row;\}\}$/),
			'@media (min-width: 52.5em){&{gap:var(--mi-spacing-6);}}',
		]);
	});

	it('aligns, distributes and wraps', (): void => {
		render(<Stack data-testid='stack' direction='row' align='center' justify='between' wrap />);
		const declarations: string = declarationsOf(screen.getByTestId('stack'), '&');

		expect(declarations).toContain('align-items:center;');
		expect(declarations).toContain('justify-content:space-between;');
		expect(declarations).toContain('flex-wrap:wrap;');
	});

	it('keeps the semantics of a list without its bullets', async (): Promise<void> => {
		render(
			<Stack as='ul' aria-label='Recent orders'>
				<li>#1042</li>
				<li>#1043</li>
			</Stack>,
		);

		const list: HTMLElement = screen.getByRole('list', { name: 'Recent orders' });

		expect(screen.getAllByRole('listitem')).toHaveLength(2);
		expect(declarationsOf(list, '&')).toContain('list-style:none;');
		await expectNoAxeViolations(document.body);
	});
});
