// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/component-harness';
import { Button } from '@/src/buttons/button/index';
import { IconButton } from '@/src/buttons/icon-button/index';
import { Chip } from '@/src/data-display/chip/index';
import { Alert } from '@/src/feedback/alert/index';
import { ToastProvider, useToast } from '@/src/feedback/toast/index';
import type { ToastApi } from '@/src/feedback/toast/index';
import { TextField } from '@/src/forms/text-field/index';
import type { IconifyCollection, IconifyIconData } from '@/src/icons/icon-data/index';
import {
	listRegisteredIconCollections,
	registerIconCollection,
	unregisterIconCollection,
} from '@/src/icons/icon-registry/index';
import { IconifyIcon } from '@/src/icons/iconify-icon/index';
import { Tabs } from '@/src/navigation/tabs/index';

const rocket: IconifyIconData = {
	width: 24,
	height: 24,
	body: '<path fill="none" stroke="currentColor" d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3-5a9 9 0 0 0 6-8"/>',
};

const gradient: IconifyIconData = {
	width: 32,
	height: 16,
	body: '<defs><linearGradient id="shade"/></defs><rect width="32" height="16" fill="url(#shade)"/>',
};

const collection: IconifyCollection = {
	prefix: 'demo',
	width: 24,
	height: 24,
	icons: { rocket: { body: rocket.body } },
};

const iconOf = (container: HTMLElement): SVGSVGElement => {
	const svg: SVGSVGElement | null = container.querySelector('svg');
	if (svg === null) throw new Error('No icon rendered.');
	return svg;
};

beforeEach((): void => {
	registerIconCollection(collection);
});

afterEach((): void => {
	cleanup();
	vi.unstubAllGlobals();

	listRegisteredIconCollections().forEach((prefix: string): void => {
		unregisterIconCollection(prefix);
	});
});

describe('IconifyIcon', (): void => {
	it('renders imported data as inline SVG, named or decorative like Icon', async (): Promise<void> => {
		const { container } = render(
			<p>
				<IconifyIcon icon={rocket} label='Launched' />
				<IconifyIcon icon={rocket} decorative />
			</p>,
		);

		const [functional, decorative] = [...container.querySelectorAll('svg')];

		expect(screen.getByRole('img', { name: 'Launched' })).toBe(functional);
		expect(functional?.getAttribute('viewBox')).toBe('0 0 24 24');
		expect(functional?.innerHTML).toContain('M4 13a8 8 0 0 1 7 7');
		expect(decorative?.getAttribute('aria-hidden')).toBe('true');
		await expectNoAxeViolations(container);
	});

	it('resolves a name from a registered collection and fails clearly otherwise', (): void => {
		const { container } = render(<IconifyIcon icon='demo:rocket' decorative />);

		expect(iconOf(container).innerHTML).toContain('M4 13a8 8 0 0 1 7 7');

		expect((): unknown => render(<IconifyIcon icon='demo:planet' decorative />)).toThrow(
			'The icon collection "demo" has no icon "planet"',
		);
	});

	it('renders on the server without any request', (): void => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		vi.stubGlobal('XMLHttpRequest', fetchSpy);

		const markup: string = renderToString(
			<>
				<IconifyIcon icon='demo:rocket' label='Launched' />
				<IconifyIcon icon={rocket} decorative />
			</>,
		);

		expect(markup).toContain('role="img" aria-label="Launched"');
		expect(markup.match(/M4 13a8 8 0 0 1 7 7/g)).toHaveLength(2);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('takes the height of its size and keeps the proportions of a wide icon', (): void => {
		const { container } = render(
			<>
				<IconifyIcon icon={rocket} decorative size='large' />
				<IconifyIcon icon={gradient} decorative />
			</>,
		);

		const [square, wide] = [...container.querySelectorAll('svg')];

		expect(square?.style.height).toBe(square?.style.width);
		expect(square?.style.height).toContain('--mi-icon-size-large');
		expect(wide?.style.height).toBe('1em');
		expect(wide?.style.width).toBe('2em');
	});

	it('gives each copy of an icon its own ids', (): void => {
		const { container } = render(
			<>
				<IconifyIcon icon={gradient} decorative />
				<IconifyIcon icon={gradient} decorative />
			</>,
		);

		const identifiers: string[] = [...container.querySelectorAll('linearGradient')].map(
			(element: Element): string => element.id,
		);

		const references: (string | null)[] = [...container.querySelectorAll('rect')].map(
			(element: Element): string | null => element.getAttribute('fill'),
		);

		expect(new Set(identifiers).size).toBe(2);
		expect(identifiers).not.toContain('shade');

		expect(references).toEqual(
			identifiers.map((identifier: string): string => `url(#${identifier})`),
		);
	});

	it('requires choosing between a label and decorative', (): void => {
		// @ts-expect-error An icon must be either labeled or decorative.
		const neither: ReactElement = <IconifyIcon icon={rocket} />;
		// @ts-expect-error An icon cannot be labeled and decorative at once.
		const both: ReactElement = <IconifyIcon icon={rocket} label='Launched' decorative />;
		// @ts-expect-error A name needs the collection prefix.
		const unprefixed: ReactElement = <IconifyIcon icon='rocket' decorative />;

		expect([neither, both, unprefixed]).toHaveLength(3);
	});
});

describe('icon slots accept Iconify icons', (): void => {
	it('Button and IconButton', async (): Promise<void> => {
		const { container } = render(
			<>
				<Button startIcon={<IconifyIcon icon={rocket} decorative />}>Launch</Button>

				<IconButton label='Launch'>
					<IconifyIcon icon='demo:rocket' decorative />
				</IconButton>
			</>,
		);

		const buttons: HTMLElement[] = screen.getAllByRole('button', { name: 'Launch' });

		const iconBodies: string[] = buttons.map((button: HTMLElement): string => {
			return iconOf(button).innerHTML;
		});

		expect(iconBodies).toEqual([
			expect.stringContaining('M4 13a8 8 0 0 1 7 7'),
			expect.stringContaining('M4 13a8 8 0 0 1 7 7'),
		]);

		await expectNoAxeViolations(container);
	});

	it('Alert, in place of the intent glyph', async (): Promise<void> => {
		const { container } = render(
			<Alert intent='success' icon={<IconifyIcon icon={rocket} decorative />}>
				Version 2 is live.
			</Alert>,
		);

		expect(iconOf(container).innerHTML).toContain('M4 13a8 8 0 0 1 7 7');
		await expectNoAxeViolations(container);
	});

	it('Toast, in place of the intent glyph', (): void => {
		const captured: { api: ToastApi | null } = { api: null };

		const Capture = (): null => {
			captured.api = useToast();
			return null;
		};

		render(
			<ToastProvider>
				<Capture />
			</ToastProvider>,
		);

		act((): void => {
			captured.api?.show({
				message: 'Version 2 is live.',
				icon: <IconifyIcon icon='demo:rocket' decorative />,
			});
		});

		const toast: HTMLElement = within(
			screen.getByRole('region', { name: 'Notifications' }),
		).getByRole('listitem');

		expect(iconOf(toast).innerHTML).toContain('M4 13a8 8 0 0 1 7 7');
	});

	it('Chip, Tabs and a functional prefix of a text field', async (): Promise<void> => {
		const { container } = render(
			<>
				<Chip label='Launched' icon={<IconifyIcon icon={rocket} decorative />} />

				<Tabs
					label='Releases'
					items={[
						{
							id: 'next',
							label: 'Next',
							icon: <IconifyIcon icon={rocket} decorative />,
							content: 'Planned',
						},
					]}
				/>

				<TextField label='Rocket' prefix={<IconifyIcon icon={rocket} label='Rocket model' />} />
			</>,
		);

		expect(container.querySelectorAll('svg path[d^="M4 13a8"]')).toHaveLength(3);

		expect(
			screen.getByRole('textbox', { name: 'Rocket' }).getAttribute('aria-describedby'),
		).toBeTruthy();

		await expectNoAxeViolations(container);
	});
});
