// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { declarationsOf, expectNoAxeViolations, styleRulesOf } from '#test/component-harness.ts';
import { Icon } from '#src/icons/icon/index.tsx';
import type { Appearance } from '#src/shared/appearance.ts';
import { semanticIntents } from '#src/tokens/index.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';
import { Button } from '#src/buttons/button/index.tsx';

const appearances: readonly Appearance[] = ['solid', 'soft', 'outline', 'ghost'];
const plusIcon: ReactElement = <path d='M11 5h2v14h-2zM5 11h14v2H5z' />;

afterEach((): void => {
	cleanup();
});

describe('Button behavior', (): void => {
	it('is a native button named by its label, which does not submit forms by default', async (): Promise<void> => {
		const { container } = render(<Button>Save</Button>);
		const button: HTMLElement = screen.getByRole('button', { name: 'Save' });

		expect(button.tagName).toBe('BUTTON');
		expect(button.getAttribute('type')).toBe('button');
		await expectNoAxeViolations(container);
	});

	it('is activated by pointer, Enter and Space', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Save</Button>);

		await user.tab();
		await user.keyboard('{Enter}');
		await user.keyboard(' ');
		await user.click(screen.getByRole('button'));

		expect(handleClick).toHaveBeenCalledTimes(3);
	});

	it('is skipped by the keyboard and ignores activation when disabled', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleClick = vi.fn();

		render(
			<Button disabled onClick={handleClick}>
				Save
			</Button>,
		);

		await user.click(screen.getByRole('button'));
		await user.tab();

		expect(screen.getByRole('button')).toHaveProperty('disabled', true);
		expect(document.activeElement).toBe(document.body);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it('stays focusable while loading, is marked busy and ignores activation and submission', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleClick = vi.fn();
		const handleSubmit = vi.fn();

		const { container } = render(
			<form onSubmit={handleSubmit}>
				<Button type='submit' loading onClick={handleClick}>
					Save
				</Button>
			</form>,
		);

		const button: HTMLElement = screen.getByRole('button', { name: 'Save' });
		await user.tab();
		await user.keyboard('{Enter}');
		await user.click(button);

		expect(document.activeElement).toBe(button);
		expect(button.getAttribute('aria-busy')).toBe('true');
		expect(button.getAttribute('aria-disabled')).toBe('true');
		expect(button).toHaveProperty('disabled', false);
		expect(handleClick).not.toHaveBeenCalled();
		expect(handleSubmit).not.toHaveBeenCalled();
		await expectNoAxeViolations(container);
	});

	it('hides its icon slots from assistive technologies and replaces the start icon while loading', (): void => {
		const { rerender } = render(
			<Button startIcon={<Icon decorative>{plusIcon}</Icon>} endIcon={<span>→</span>}>
				Add
			</Button>,
		);

		const slots: HTMLElement[] = [
			...screen.getByRole('button').querySelectorAll<HTMLElement>('span[aria-hidden="true"]'),
		];

		expect(slots).toHaveLength(2);
		expect(screen.getByRole('button', { name: 'Add' })).toBeDefined();

		rerender(
			<Button loading startIcon={<Icon decorative>{plusIcon}</Icon>}>
				Add
			</Button>,
		);

		expect(screen.getByRole('button').querySelector('circle')).not.toBeNull();
		expect(screen.getByRole('button').querySelector('path')).toBeNull();
	});

	it('forwards attributes and the ref to the element', (): void => {
		const reference: { current: HTMLButtonElement | null } = { current: null };

		render(
			<Button ref={reference} id='save' data-testid='save' className='application-class'>
				Save
			</Button>,
		);

		expect(reference.current?.id).toBe('save');
		expect(reference.current?.classList.contains('application-class')).toBe(true);
	});
});

describe('Button appearance', (): void => {
	it('uses the intent tokens of each variant at rest, on hover and when pressed', (): void => {
		render(
			<>
				<Button intent='official' variant='solid'>
					Solid
				</Button>

				<Button intent='official' variant='outline'>
					Outline
				</Button>
			</>,
		);

		const solid: HTMLElement = screen.getByRole('button', { name: 'Solid' });
		const outline: HTMLElement = screen.getByRole('button', { name: 'Outline' });
		const enabled: string = ':not(:disabled):not([aria-disabled="true"])';

		expect(declarationsOf(solid, '&')).toContain(
			'background-color:var(--mi-intent-official-main);',
		);

		expect(declarationsOf(solid, '&')).toContain('color:var(--mi-intent-official-contrast-text);');

		expect(declarationsOf(solid, `&:hover${enabled}`)).toContain(
			'background-color:var(--mi-intent-official-hover);',
		);

		expect(declarationsOf(solid, `&:active${enabled}`)).toContain(
			'background-color:var(--mi-intent-official-pressed);',
		);

		expect(declarationsOf(outline, '&')).toContain(
			'border-color:var(--mi-intent-official-border);',
		);

		expect(declarationsOf(outline, `&:hover${enabled}`)).toContain(
			'color:var(--mi-intent-official-on-container);',
		);
	});

	it('shows the focus ring only for keyboard focus, and the disabled tokens whatever the intent', (): void => {
		render(
			<Button intent='error' variant='solid' disabled>
				Delete
			</Button>,
		);

		const button: HTMLElement = screen.getByRole('button');

		expect(declarationsOf(button, '&:focus-visible')).toBe(
			'outline:var(--mi-focus-width) solid var(--mi-focus-ring);outline-offset:var(--mi-focus-offset);',
		);

		expect(
			declarationsOf(button, '&:disabled,&[aria-disabled="true"]:not([aria-busy="true"])'),
		).toContain('background-color:var(--mi-state-disabled-surface);');
	});

	it('keeps the same visual states (regression)', (): void => {
		const variantMatrix: ReactElement[] = appearances.map((variant: Appearance): ReactElement => {
			return (
				<Button key={variant} intent='official' variant={variant}>
					{`official ${variant}`}
				</Button>
			);
		});

		const intentMatrix: ReactElement[] = semanticIntents.map(
			(intent: SemanticIntent): ReactElement => {
				return (
					<Button key={intent} intent={intent} variant='solid'>
						{`${intent} solid`}
					</Button>
				);
			},
		);

		render(
			<>
				{variantMatrix}
				{intentMatrix}
				<Button size='small'>small</Button>
				<Button size='large'>large</Button>
				<Button fullWidth>full width</Button>
			</>,
		);

		const snapshot: Record<string, string[]> = Object.fromEntries(
			screen.getAllByRole('button').map((button: HTMLElement): [string, string[]] => {
				return [button.textContent, styleRulesOf(button)];
			}),
		);

		expect(snapshot).toMatchSnapshot();
	});
});
