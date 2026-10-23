// The icon sets and the icon browser: every set the starter depends on is listed and credited, and the browser, served
// by the production build, searches and shows icons as inline SVG without sending any set to the browser.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, describe, test } from 'node:test';

import { readStreamedPage, startStarter } from '@/test/support/starter-server';
import type { StarterServer, StreamedPage } from '@/test/support/starter-server';
import { excludedIconSets, iconSets } from '@/src/icons/icon-sets';
import type { ExcludedIconSet, IconSetEntry } from '@/src/icons/icon-sets';

interface PackageManifest {
	dependencies: Record<string, string>;
}

const manifest: PackageManifest = JSON.parse(
	readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as PackageManifest;

const readNotices = (fileName: string): string => {
	return readFileSync(new URL(`../${fileName}`, import.meta.url), 'utf8');
};

const noticeFiles: readonly string[] = ['ICON-NOTICES.md', 'ICON-NOTICES.pt-BR.md'];

describe('icon sets', (): void => {
	test('every listed set is a dependency, and no other set is', (): void => {
		const dependencies: string[] = Object.keys(manifest.dependencies)
			.filter((name: string): boolean => name.startsWith('@iconify-json/'))
			.toSorted();

		const listed: string[] = iconSets
			.map((set: IconSetEntry): string => `@iconify-json/${set.prefix}`)
			.toSorted();

		assert.ok(listed.length > 100, 'The starter should ship the open icon sets of Iconify.');
		assert.deepEqual(dependencies, listed);
	});

	test('the notices credit every set that requires attribution and explain every exclusion', (): void => {
		const attributed: IconSetEntry[] = iconSets.filter((set: IconSetEntry): boolean => {
			return set.attributionRequired;
		});

		assert.ok(attributed.length > 0);

		noticeFiles.forEach((fileName: string): void => {
			const notices: string = readNotices(fileName);

			[...iconSets, ...excludedIconSets].forEach((set: IconSetEntry | ExcludedIconSet): void => {
				assert.ok(notices.includes(`(\`${set.prefix}\`)`), `${fileName} misses ${set.prefix}.`);
			});
		});
	});

	test('only CC-BY-4.0 sets require attribution', (): void => {
		iconSets.forEach((set: IconSetEntry): void => {
			assert.equal(set.attributionRequired, set.license === 'CC-BY-4.0', set.prefix);
		});
	});
});

describe('icon browser', (): void => {
	let server: StarterServer;

	before(async (): Promise<void> => {
		server = await startStarter();
	});

	after((): void => {
		server.stop();
	});

	const pageAt = async (path: string): Promise<string> => {
		const page: StreamedPage = await readStreamedPage(`${server.origin}${path}`);
		assert.equal(page.status, 200, `${path} answered ${String(page.status)}.`);
		return page.html;
	};

	test('lists the installed sets before a search', async (): Promise<void> => {
		const html: string = await pageAt('/en-us/icons');

		assert.match(html, /<caption[^>]*>Installed icon sets<\/caption>/);
		assert.ok(html.includes('href="?set=tabler"'));
	});

	test('searches the names of every set and renders the results as inline SVG', async (): Promise<void> => {
		const html: string = await pageAt('/en-us/icons?q=arrow+left');
		const tiles: string[] = html.match(/<a class="icon-tile"[^>]*>\s*<svg/g) ?? [];

		assert.match(html, /<h2[^>]*>[\d,]+ icons<\/h2>/);
		assert.equal(tiles.length, 120);
		assert.match(html, /<nav aria-label="Result pages"/);
	});

	test('filters by set and license, in the language of the URL', async (): Promise<void> => {
		const html: string = await pageAt('/pt-br/icons?q=home&set=tabler&license=MIT');

		assert.match(html, /href="\?q=home&amp;set=tabler&amp;license=MIT&amp;icon=tabler%3Ahome"/);
		assert.doesNotMatch(html, /icon=(?!tabler)[a-z0-9-]+%3A/);
	});

	test('shows an icon in each size and intent, with the code to use it', async (): Promise<void> => {
		const html: string = await pageAt('/en-us/icons?set=tabler&icon=tabler:home');

		assert.match(html, /<h2[^>]*>tabler:home<\/h2>/);
		assert.equal((html.match(/role="img" aria-label="[^"]+"/g) ?? []).length >= 6, true);
		assert.ok(html.includes('export const homeIcon: IconifyIconData = {'));
		assert.ok(html.includes('registerIconCollection(icons);'));
		assert.ok(html.includes('&lt;IconifyIcon icon=&#x27;tabler:home&#x27; decorative /&gt;'));
	});

	test('ignores an unknown set, license or icon', async (): Promise<void> => {
		const html: string = await pageAt('/en-us/icons?set=no-such-set&license=GPL-3.0&icon=nope:x');

		assert.match(html, /<caption[^>]*>Installed icon sets<\/caption>/);
		assert.doesNotMatch(html, /nope:x<\/h2>/);
	});

	test('credits the authors of the CC BY 4.0 sets', async (): Promise<void> => {
		const html: string = await pageAt('/en-us/icons/attribution');

		iconSets
			.filter((set: IconSetEntry): boolean => set.attributionRequired)
			.forEach((set: IconSetEntry): void => {
				assert.ok(html.includes(`<code>${set.prefix}</code>`), `${set.prefix} is not credited.`);
			});
	});
});
