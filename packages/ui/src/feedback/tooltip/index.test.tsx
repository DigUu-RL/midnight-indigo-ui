// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { expectNoAxeViolations, materialRulesOf } from '#test/component-harness.ts';
import { IconButton } from '#src/buttons/icon-button/index.tsx';
import { Tooltip } from '#src/feedback/tooltip/index.tsx';

afterEach((): void => {
	cleanup();
	vi.restoreAllMocks();
});

const renderTooltip = (): HTMLElement => {
	render(
		<>
			<Tooltip content='Ctrl+S'>
				<IconButton label='Save'>
					<svg />
				</IconButton>
			</Tooltip>

			<button type='button'>Next</button>
		</>,
	);

	return screen.getByRole('button', { name: 'Save' });
};

describe('Tooltip', (): void => {
	it('describes a focused trigger without taking focus or replacing its name', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const trigger: HTMLElement = renderTooltip();

		await user.tab();
		const tooltip: HTMLElement = await screen.findByRole('tooltip');

		expect(tooltip.textContent).toBe('Ctrl+S');
		expect(document.activeElement).toBe(trigger);
		expect(trigger.getAttribute('aria-label')).toBe('Save');
		expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
		expect(tooltip.querySelector('a, button, input, [tabindex]')).toBeNull();
		await expectNoAxeViolations(document.body);
	});

	it('closes on Escape and on blur', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const trigger: HTMLElement = renderTooltip();

		await user.tab();
		await screen.findByRole('tooltip');
		await user.keyboard('{Escape}');

		await waitFor((): void => {
			expect(screen.queryByRole('tooltip')).toBeNull();
		});

		expect(document.activeElement).toBe(trigger);
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
		await user.tab({ shift: true });
		await user.tab();
		await screen.findByRole('tooltip');
		await user.tab();

		await waitFor((): void => {
			expect(screen.queryByRole('tooltip')).toBeNull();
		});
	});

	it('opens on hover after the delay and stays while hovered', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const trigger: HTMLElement = renderTooltip();

		await user.hover(trigger);
		expect(screen.queryByRole('tooltip')).toBeNull();
		const tooltip: HTMLElement = await screen.findByRole('tooltip');
		await user.hover(tooltip);

		expect(screen.getByRole('tooltip')).toBe(tooltip);
	});

	it('stacks on the tooltip layer with the overlay surface', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		renderTooltip();
		await user.tab();
		const popper: HTMLElement = await screen.findByRole('tooltip');
		const bubble: Element = popper.firstElementChild ?? popper;

		expect(materialRulesOf(popper)).toContain('z-index:var(--mi-layer-tooltip);');
		expect(materialRulesOf(bubble)).toContain('background-color:var(--mi-surface-overlay);');
		expect(materialRulesOf(bubble)).toContain('font-size:var(--mi-typography-caption-font-size);');
	});

	it('reports a trigger that has no name of its own', (): void => {
		const consoleError: MockInstance<typeof console.error> = vi
			.spyOn(console, 'error')
			.mockImplementation((): void => undefined);

		render(
			<Tooltip content='Delete'>
				<button type='button'>
					<svg aria-hidden='true' />
				</button>
			</Tooltip>,
		);

		expect(consoleError).toHaveBeenCalledWith(expect.stringMatching(/has no accessible name/));
	});
});
