// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Code } from '#src/code/code/index.tsx';

afterEach((): void => {
	cleanup();
});

describe('Code', (): void => {
	it('is a code element in the monospace font, sized by the text around it', async (): Promise<void> => {
		const { container } = render(
			<p>
				Run <Code>pnpm build</Code> first.
			</p>,
		);

		const code: HTMLElement = screen.getByText('pnpm build');
		const rules: string = styleRulesOf(code).join('');

		expect(code.tagName).toBe('CODE');
		expect(rules).toContain('font-family:var(--mi-font-family-mono);');
		expect(rules).not.toContain('font-size');
		expect(rules).toContain('background-color:var(--mi-surface-field);');
		await expectNoAxeViolations(container);
	});
});
