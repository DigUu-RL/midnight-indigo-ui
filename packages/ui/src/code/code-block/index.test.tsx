// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { CodeBlock } from '@/src/code/code-block/index';
import type { CodeFile } from '@/src/code/code-block/index';
import type { HighlightedCode } from '@/src/code/highlighted-code';
import { syntaxColors } from '@/src/code/syntax-theme';
import { ComponentLabelsProvider } from '@/src/shared/component-labels/index';

afterEach((): void => {
	cleanup();
});

const greeting: HighlightedCode = {
	code: "const pilot = 'Spike Spiegel';\n\nexport default pilot;",
	language: 'typescript',
	lines: [
		[
			{ content: 'const ', color: syntaxColors.keyword },
			{ content: 'pilot ' },
			{ content: '= ', color: syntaxColors.punctuation },
			{ content: "'Spike Spiegel'", color: syntaxColors.string },
			{ content: ';', color: syntaxColors.punctuation },
		],
		[],
		[
			{ content: 'export default ', color: syntaxColors.keyword },
			{ content: 'pilot' },
			{ content: ';', color: syntaxColors.punctuation },
		],
	],
};

const files: CodeFile[] = [
	{ name: 'page.tsx', code: greeting },
	{ name: 'theme.css', code: '.hangar {\n\tcolor: pink;\n}', highlightedLines: [2] },
	{ name: 'notes.md', code: '# Bebop' },
];

const lines = (container: HTMLElement): HTMLElement[] => {
	return [...container.querySelectorAll<HTMLElement>('code > span')];
};

describe('CodeBlock', (): void => {
	it('renders the tokens in a group named by the file, with a copy button', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const { container } = render(<CodeBlock code={greeting} fileName='pilot.ts' />);
		const block: HTMLElement = screen.getByRole('group', { name: 'pilot.ts' });
		const keyword: HTMLElement = within(block).getByText('const');

		expect(block.tagName).toBe('PRE');
		expect(block.getAttribute('dir')).toBe('ltr');
		expect(block.tabIndex).toBe(0);
		expect(lines(container)).toHaveLength(3);
		expect(block.textContent).toBe("const pilot = 'Spike Spiegel';export default pilot;");
		expect(keyword.style.color).toBe(syntaxColors.keyword);
		expect(screen.getByText('pilot.ts')).toBeDefined();
		await expectNoAxeViolations(container);

		await user.click(screen.getByRole('button', { name: 'Copy code' }));

		expect(await navigator.clipboard.readText()).toBe(greeting.code);
	});

	it('shows a string without colors and names a block without a file', (): void => {
		render(<CodeBlock code={'pnpm install\npnpm build'} />);
		const block: HTMLElement = screen.getByRole('group', { name: 'Code' });

		expect(block.querySelectorAll('[style*="color"]')).toHaveLength(0);
		expect(block.textContent).toBe('pnpm installpnpm build');
	});

	it('shows the language when there is no file name', (): void => {
		const { container } = render(<CodeBlock code={greeting} />);
		expect(container.textContent).toContain('typescript');
	});

	it('numbers the lines with CSS, so the numbers are never copied', (): void => {
		const { container } = render(<CodeBlock code={greeting} showLineNumbers />);
		const code: HTMLElement | null = container.querySelector('code');
		const rules: string = code === null ? '' : styleRulesOf(code).join('');

		expect(rules).toContain('counter-reset:line;');
		expect(rules).toContain('content:counter(line);');
		expect(rules).toContain('user-select:none;');
		expect(rules).toContain('width:1ch;');
		expect(container.querySelector('pre')?.textContent).not.toMatch(/\d/);
	});

	it('highlights lines with a tint and a bar', (): void => {
		const { container } = render(<CodeBlock code={greeting} highlightedLines={[1, 3]} />);
		const [first, second, third] = lines(container);

		expect(first?.dataset.highlighted).toBe('true');
		expect(second?.dataset.highlighted).toBeUndefined();
		expect(third?.dataset.highlighted).toBe('true');

		expect(first === undefined ? '' : styleRulesOf(first).join('')).toContain(
			'background-color:var(--mi-state-selected);box-shadow:inset 2px 0 0 var(--mi-intent-brand-border);',
		);
	});

	it('shows one tab per file, moved by the arrow keys, and copies the file shown', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const onFileChange: Mock<(name: string) => void> = vi.fn();
		const { container } = render(<CodeBlock files={files} onFileChange={onFileChange} />);
		const tablist: HTMLElement = screen.getByRole('tablist', { name: 'Files' });
		const [page, theme] = within(tablist).getAllByRole('tab');

		expect(within(tablist).getAllByRole('tab')).toHaveLength(3);
		expect(screen.getByRole('tabpanel', { name: 'page.tsx' }).textContent).toContain('Spike');
		expect(page?.getAttribute('aria-controls')).toBe(screen.getByRole('tabpanel').id);
		expect(theme?.hasAttribute('aria-controls')).toBe(false);
		await expectNoAxeViolations(container);

		await user.click(page ?? tablist);
		await user.keyboard('{ArrowRight}');

		expect(document.activeElement).toBe(theme);
		expect(onFileChange).toHaveBeenCalledWith('theme.css');

		expect(screen.getByRole('tabpanel', { name: 'theme.css' }).textContent).toContain(
			'color: pink;',
		);

		expect(lines(container)[1]?.dataset.highlighted).toBe('true');

		await user.click(screen.getByRole('button', { name: 'Copy code' }));

		expect(await navigator.clipboard.readText()).toBe('.hangar {\n\tcolor: pink;\n}');
	});

	it('can be controlled to show a file', (): void => {
		render(<CodeBlock files={files} file='notes.md' />);
		expect(screen.getByRole('tab', { selected: true }).textContent).toBe('notes.md');
	});

	it('has no header without a file name nor a copy button', (): void => {
		render(<CodeBlock code='ls' copyable={false} />);
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.getByRole('group').parentElement?.childElementCount).toBe(1);
	});

	it('takes its texts from the labels', (): void => {
		render(
			<ComponentLabelsProvider labels={{ codeBlock: { code: 'Código', copy: 'Copiar código' } }}>
				<CodeBlock code='ls' />
			</ComponentLabelsProvider>,
		);

		expect(screen.getByRole('group', { name: 'Código' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'Copiar código' })).toBeDefined();
	});
});
