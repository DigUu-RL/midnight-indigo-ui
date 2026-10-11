// @vitest-environment jsdom
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { act, Suspense, use } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToReadableStream } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { reducedMotionMediaQuery } from '../tokens/index.ts';
import type { HexColor } from '../tokens/index.ts';
import { createUiTheme, defaultUiTheme } from './create-ui-theme.ts';
import type { CreateUiThemeOptions, UiTheme } from './create-ui-theme.ts';
import { UiProvider, useUiTheme } from './ui-provider.tsx';

interface ThemeSnapshot {
	uiTheme: UiTheme;
	muiTheme: Theme;
}

interface ChildrenProps {
	children?: ReactNode;
}

const silent: CreateUiThemeOptions = { onWarning: (): void => undefined };
const customMain: HexColor = '#3D8BFF';
const customTheme: UiTheme = createUiTheme({ palette: { official: { main: customMain } } }, silent);
const themeStyleSelector: string = 'style[data-href^="midnight-indigo-theme-"]';
const snapshots: ThemeSnapshot[] = [];

const ThemeProbe = (): null => {
	snapshots.push({ uiTheme: useUiTheme(), muiTheme: useTheme() });
	return null;
};

const Document = ({ children }: ChildrenProps): ReactElement => {
	return (
		<html lang='en'>
			<head>
				<title>Theme</title>
			</head>
			<body>{children}</body>
		</html>
	);
};

const countOccurrences = (text: string, fragment: string): number => {
	return text.split(fragment).length - 1;
};

let root: Root | undefined;

beforeAll((): void => {
	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach((): void => {
	act((): void => root?.unmount());
	root = undefined;
	snapshots.length = 0;
	document.head.innerHTML = '';
	document.body.innerHTML = '';
});

const renderInBrowser = async (element: ReactElement): Promise<void> => {
	const container: HTMLDivElement = document.createElement('div');
	document.body.append(container);
	root = createRoot(container);

	await act(async (): Promise<void> => {
		root?.render(element);
		await Promise.resolve();
	});
};

describe('UiProvider in the browser', (): void => {
	it('exposes the configured theme to components and to Material UI', async (): Promise<void> => {
		await renderInBrowser(
			<UiProvider theme={customTheme}>
				<ThemeProbe />
			</UiProvider>,
		);

		expect(snapshots.at(-1)?.uiTheme).toBe(customTheme);
		expect(snapshots.at(-1)?.muiTheme.palette.primary.main).toBe(customMain);
		expect(snapshots.at(-1)?.muiTheme.palette.mode).toBe('dark');
	});

	it('falls back to the official theme, also outside of a provider', async (): Promise<void> => {
		await renderInBrowser(
			<>
				<ThemeProbe />
				<UiProvider>
					<ThemeProbe />
				</UiProvider>
			</>,
		);

		expect(snapshots.map((snapshot: ThemeSnapshot): UiTheme => snapshot.uiTheme)).toEqual([
			defaultUiTheme,
			defaultUiTheme,
		]);
	});

	// React remembers the stylesheets it inserted in a document, so this test uses a theme no other test renders.
	it('injects the theme custom properties once in the document head', async (): Promise<void> => {
		const uniqueMain: HexColor = '#7A5CFF';

		const uniqueTheme: UiTheme = createUiTheme(
			{ palette: { official: { main: uniqueMain } } },
			silent,
		);

		await renderInBrowser(
			<UiProvider theme={uniqueTheme}>
				<UiProvider theme={uniqueTheme}>
					<ThemeProbe />
				</UiProvider>
			</UiProvider>,
		);

		const styles: HTMLStyleElement[] = [
			...document.head.querySelectorAll<HTMLStyleElement>(themeStyleSelector),
		];

		const uniqueStyles: HTMLStyleElement[] = styles.filter((style: HTMLStyleElement): boolean => {
			return style.textContent.includes(uniqueMain);
		});

		expect(uniqueStyles).toHaveLength(1);
		expect(uniqueStyles[0]?.textContent).toContain(`--mi-intent-official-main: ${uniqueMain};`);
		expect(uniqueStyles[0]?.textContent).toContain('@layer midnight-indigo.theme {');
	});
});

describe('UiProvider and reduced motion', (): void => {
	const stubMatchMedia = (reducedMotion: boolean): void => {
		vi.stubGlobal('matchMedia', (query: string): MediaQueryList => {
			const ignore = (): void => undefined;

			return {
				matches: reducedMotion && query === reducedMotionMediaQuery,
				media: query,
				onchange: null,
				addEventListener: ignore,
				removeEventListener: ignore,
				addListener: ignore,
				removeListener: ignore,
				dispatchEvent: (): boolean => false,
			};
		});
	};

	afterEach((): void => {
		vi.unstubAllGlobals();
	});

	it('removes Material UI transitions when the user prefers reduced motion', async (): Promise<void> => {
		stubMatchMedia(true);

		await renderInBrowser(
			<UiProvider>
				<ThemeProbe />
			</UiProvider>,
		);

		expect(snapshots.at(-1)?.muiTheme.transitions.duration.standard).toBe(0);

		expect(snapshots.at(-1)?.muiTheme.components?.MuiButtonBase?.defaultProps?.disableRipple).toBe(
			true,
		);
	});

	it('keeps the motion tokens otherwise', async (): Promise<void> => {
		stubMatchMedia(false);

		await renderInBrowser(
			<UiProvider>
				<ThemeProbe />
			</UiProvider>,
		);

		expect(snapshots.at(-1)?.muiTheme.transitions.duration.standard).toBe(320);
	});
});

describe('UiProvider on the server', (): void => {
	const streamedContent = new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, 20);
	});

	const StreamedSection = (): ReactElement => {
		use(streamedContent);

		return (
			<UiProvider theme={customTheme}>
				<p>Streamed section</p>
			</UiProvider>
		);
	};

	it('streams the theme stylesheet once, in the head, before any content', async (): Promise<void> => {
		const stream: ReadableStream<Uint8Array> = await renderToReadableStream(
			<Document>
				<UiProvider theme={customTheme}>
					<main>Shell</main>
					<Suspense fallback={<p>Loading</p>}>
						<StreamedSection />
					</Suspense>
				</UiProvider>
			</Document>,
		);

		const html: string = await new Response(stream).text();

		expect(html).toContain('Streamed section');
		expect(countOccurrences(html, 'data-href="midnight-indigo-theme-')).toBe(1);
		expect(countOccurrences(html, `--mi-intent-official-main: ${customMain};`)).toBe(1);
		expect(html.indexOf('midnight-indigo-theme-')).toBeLessThan(html.indexOf('</head>'));
	});

	it('hydrates without mismatches nor duplicated styles', async (): Promise<void> => {
		const application: ReactElement = (
			<Document>
				<UiProvider theme={customTheme}>
					<main>Content</main>
				</UiProvider>
			</Document>
		);

		const stream: ReadableStream<Uint8Array> & { allReady: Promise<void> } =
			await renderToReadableStream(application);

		await stream.allReady;
		const html: string = await new Response(stream).text();
		const serverDocument: Document = new DOMParser().parseFromString(html, 'text/html');

		document.replaceChild(
			document.importNode(serverDocument.documentElement, true),
			document.documentElement,
		);

		const recoverableErrors: unknown[] = [];

		await act(async (): Promise<void> => {
			root = hydrateRoot(document, application, {
				onRecoverableError: (error: unknown): void => {
					recoverableErrors.push(error);
				},
			});

			await Promise.resolve();
		});

		expect(recoverableErrors).toEqual([]);
		expect(document.querySelectorAll(themeStyleSelector)).toHaveLength(1);
		expect(document.querySelector('main')?.textContent).toBe('Content');
	});
});
