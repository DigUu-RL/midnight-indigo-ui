// Size of the chart engine in an application bundle: the production build of the scenarios (Vite, which consumes the
// compiled package as any application would) splits ECharts into a chunk of its own, loaded when the first chart mounts.
// The initial chunk must not contain it. Sizes are reported compressed, as served: gzip and brotli.
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

import { expect, test } from '@/test/support/fixtures';

interface ChunkSize {
	file: string;
	raw: number;
	gzip: number;
	brotli: number;
}

const assetsDirectory: string = fileURLToPath(new URL('../../dist/assets/', import.meta.url));
const pageFile: string = fileURLToPath(new URL('../../dist/index.html', import.meta.url));

// ECharts marks the element of each instance with this attribute; no other code of the page has it.
const engineMarker: string = '_echarts_instance_';

const sizeOf = (file: string): ChunkSize => {
	const content: Buffer = readFileSync(`${assetsDirectory}${file}`);

	return {
		file,
		raw: content.length,
		gzip: gzipSync(content, { level: 9 }).length,
		brotli: brotliCompressSync(content).length,
	};
};

const kilobytes = (bytes: number): string => `${(bytes / 1024).toFixed(1)} kB`;

const report = (name: string, size: ChunkSize): void => {
	test.info().annotations.push({
		type: 'measurement',
		description: `${name} (${size.file}): ${kilobytes(size.raw)} raw, ${kilobytes(size.gzip)} gzip, ${kilobytes(size.brotli)} brotli`,
	});
};

test('the chart engine is a chunk of its own, outside the initial chunk', (): void => {
	const chunks: string[] = readdirSync(assetsDirectory).filter((file: string): boolean => {
		return file.endsWith('.js');
	});

	const initial: string | undefined = /<script[^>]+src="\/assets\/([^"]+\.js)"/.exec(
		readFileSync(pageFile, 'utf8'),
	)?.[1];

	const engineChunks: string[] = chunks.filter((file: string): boolean => {
		return (
			file !== initial && readFileSync(`${assetsDirectory}${file}`, 'utf8').includes(engineMarker)
		);
	});

	expect(initial).toBeDefined();

	expect(readFileSync(`${assetsDirectory}${initial ?? ''}`, 'utf8').includes(engineMarker)).toBe(
		false,
	);

	expect(engineChunks).toHaveLength(1);

	const initialSize: ChunkSize = sizeOf(initial ?? '');
	const engineSize: ChunkSize = sizeOf(engineChunks[0] ?? '');

	report('initial chunk', initialSize);
	report('chart engine chunk', engineSize);

	// Line, bar, pie and gauge, the grid, tooltip, legend and data zoom, and both renderers: about 1.2 times the size
	// measured when this budget was set, so a regression (another chart type or component registered) fails it.
	expect(engineSize.gzip).toBeLessThan(260 * 1024);
});
