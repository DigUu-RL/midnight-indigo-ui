// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { expectNoAxeViolations, styleRulesOf } from '@/test/component-harness';
import { TableOfContents } from '@/src/navigation/table-of-contents/index';
import type {
	TableOfContentsItem,
	TableOfContentsProps,
} from '@/src/navigation/table-of-contents/index';

afterEach((): void => {
	cleanup();
	vi.restoreAllMocks();
});

const items: TableOfContentsItem[] = [
	{ id: 'installation', label: 'Installation' },
	{ id: 'usage', label: 'Usage' },
	{ id: 'props', label: 'Props', level: 2 },
	{ id: 'accessibility', label: 'Accessibility' },
];

const Page = (props: Partial<TableOfContentsProps>): ReactElement => {
	return (
		<>
			<TableOfContents items={items} {...props} />

			{items.map((item: TableOfContentsItem): ReactElement => {
				return (
					<h2 key={item.id} id={item.id}>
						{item.label}
					</h2>
				);
			})}
		</>
	);
};

/** Places the start of each section at a distance from the top of the viewport, as a scroll would. */
const placeSections = (tops: Readonly<Record<string, number>>): void => {
	Object.entries(tops).forEach(([id, top]: [string, number]): void => {
		const element: HTMLElement | null = document.getElementById(id);
		if (element === null) throw new Error(`No section ${id}.`);
		vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, top, 600, 40));
	});
};

const scroll = async (target: Element | Document = document): Promise<void> => {
	await act(async (): Promise<void> => {
		fireEvent.scroll(target);

		await new Promise<void>((resolve: () => void): void => {
			requestAnimationFrame((): void => {
				resolve();
			});
		});
	});
};

const currentLink = (): HTMLElement | null => {
	return document.querySelector<HTMLElement>('a[aria-current="location"]');
};

describe('TableOfContents', (): void => {
	it('is a navigation named by its visible title, with a link to each section', async (): Promise<void> => {
		const { container } = render(<Page />);
		const navigation: HTMLElement = screen.getByRole('navigation', { name: 'On this page' });
		const links: HTMLElement[] = screen.getAllByRole('link');

		expect(navigation.querySelectorAll('li')).toHaveLength(4);

		expect(links.map((link: HTMLElement): string | null => link.getAttribute('href'))).toEqual([
			'#installation',
			'#usage',
			'#props',
			'#accessibility',
		]);

		await expectNoAxeViolations(container);
	});

	it('makes the first section current before any section reaches the line', async (): Promise<void> => {
		render(<Page />);
		placeSections({ installation: 300, usage: 700, props: 1100, accessibility: 1500 });
		await scroll();

		expect(currentLink()?.textContent).toBe('Installation');
	});

	it('marks the current section with a brand bar and indents nested ones', (): void => {
		render(<Page />);
		const rules: string = styleRulesOf(screen.getByRole('link', { name: 'Installation' })).join('');

		expect(rules).toContain(
			'&[aria-current="location"]::before{background-color:var(--mi-intent-brand-border);}',
		);

		expect(rules).toContain('padding-inline-start:var(--mi-spacing-3);');

		expect(styleRulesOf(screen.getByRole('link', { name: 'Props' })).join('')).toContain(
			'padding-inline-start:var(--mi-spacing-6);',
		);
	});

	it('follows the scroll of the page and of inner containers', async (): Promise<void> => {
		const onActiveIdChange: Mock<(id: string) => void> = vi.fn();
		render(<Page onActiveIdChange={onActiveIdChange} />);

		placeSections({ installation: -600, usage: -200, props: 90, accessibility: 500 });
		await scroll();

		expect(currentLink()?.textContent).toBe('Props');
		expect(onActiveIdChange).toHaveBeenLastCalledWith('props');

		placeSections({ installation: -300, usage: 40, props: 300, accessibility: 800 });
		await scroll(screen.getByRole('navigation'));

		expect(currentLink()?.textContent).toBe('Usage');
	});

	it('makes the last section current at the end of the scroll', async (): Promise<void> => {
		render(<Page />);
		const scroller: HTMLElement = document.body;
		vi.spyOn(scroller, 'scrollHeight', 'get').mockReturnValue(2000);
		vi.spyOn(scroller, 'clientHeight', 'get').mockReturnValue(800);
		scroller.scrollTop = 1200;

		placeSections({ installation: -900, usage: -500, props: 300, accessibility: 600 });
		await scroll(scroller);

		expect(currentLink()?.textContent).toBe('Accessibility');
	});

	it('keeps a followed link current until the user scrolls', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		render(<Page scrollOffset={0} />);
		placeSections({ installation: -900, usage: -500, props: -100, accessibility: 600 });

		await user.click(screen.getByRole('link', { name: 'Accessibility' }));
		await scroll();

		expect(currentLink()?.textContent).toBe('Accessibility');

		fireEvent.wheel(window);
		await scroll();

		expect(currentLink()?.textContent).toBe('Props');
	});

	it('can be controlled and translated', (): void => {
		render(<Page activeId='usage' labels={{ title: 'Nesta página' }} />);

		expect(screen.getByRole('navigation', { name: 'Nesta página' })).toBeDefined();
		expect(currentLink()?.textContent).toBe('Usage');
	});

	it('stops listening when it unmounts', (): void => {
		const removeListener: Mock<typeof document.removeEventListener> = vi.spyOn(
			document,
			'removeEventListener',
		);

		const { unmount } = render(<Page />);
		unmount();

		expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function), { capture: true });
	});
});
