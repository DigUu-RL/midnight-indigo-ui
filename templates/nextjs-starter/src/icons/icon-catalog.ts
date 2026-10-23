// The installed icon sets, read on the server only (`node:fs`): a set is parsed when a page needs it and kept in a small
// cache, and the names of every set are indexed on the first search across all of them (a few seconds, once per server
// process). Nothing of this reaches the browser: the pages send the rendered SVG of the icons they show.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { getIconData } from '@midnight-indigo/ui/icons';
import type { IconifyCollection, IconifyIconData, IconName } from '@midnight-indigo/ui/icons';

import { iconSets } from '@/src/icons/icon-sets';
import type { IconSetEntry } from '@/src/icons/icon-sets';

/** An icon set as its `@iconify-json/*` package stores it. */
interface StoredIconSet extends IconifyCollection {
	icons: Record<string, IconifyIconData & { hidden?: boolean }>;
}

export interface IconMatch {
	prefix: string;
	name: string;
}

/** A match with its data, ready to render. */
export interface LoadedIcon {
	match: IconMatch;
	data: IconifyIconData;
}

export interface IconSearch {
	/** Words that must all appear in the name; empty lists every icon of the chosen sets. */
	query: string;
	prefix?: string | undefined;
	license?: string | undefined;
	/** One-based. */
	page: number;
	pageSize: number;
}

export interface IconSearchResult {
	matches: IconMatch[];
	total: number;
	pageCount: number;
}

// Resolved from the project, where the sets are dependencies; the bundler leaves this path alone.
const requireFromProject: NodeJS.Require = createRequire(join(process.cwd(), 'package.json'));
const cachedSetCount: number = 32;
const loadedSets: Map<string, Promise<StoredIconSet>> = new Map<string, Promise<StoredIconSet>>();

const knownPrefixes: ReadonlySet<string> = new Set<string>(
	iconSets.map((set: IconSetEntry): string => set.prefix),
);

export const findIconSet = (prefix: string): IconSetEntry | undefined => {
	return iconSets.find((set: IconSetEntry): boolean => set.prefix === prefix);
};

const readIconSet = async (prefix: string): Promise<StoredIconSet> => {
	const file: string = requireFromProject.resolve(`@iconify-json/${prefix}/icons.json`);
	return JSON.parse(await readFile(file, 'utf8')) as StoredIconSet;
};

/** The icons of an installed set. The most recently used sets stay parsed. */
export const loadIconSet = async (prefix: string): Promise<StoredIconSet> => {
	if (!knownPrefixes.has(prefix)) throw new Error(`The icon set "${prefix}" is not installed.`);
	const cached: Promise<StoredIconSet> = loadedSets.get(prefix) ?? readIconSet(prefix);
	// Re-inserting moves the set to the end, so the oldest one is first in line to be dropped.
	loadedSets.delete(prefix);
	loadedSets.set(prefix, cached);
	const oldest: string | undefined = loadedSets.keys().next().value;
	if (loadedSets.size > cachedSetCount && oldest !== undefined) loadedSets.delete(oldest);
	return await cached;
};

/** Data of a named icon, or `undefined` when its set is not installed or has no such icon. */
export const findIconData = async (name: string): Promise<IconifyIconData | undefined> => {
	const [prefix = '', iconName = ''] = name.split(':');
	if (!knownPrefixes.has(prefix) || iconName === '') return undefined;
	return getIconData(await loadIconSet(prefix), iconName);
};

// Hidden icons are old names kept for compatibility; the browser lists the current ones.
const visibleNamesOf = (set: StoredIconSet): string[] => {
	const icons: string[] = Object.entries(set.icons)
		.filter(([, icon]: [string, { hidden?: boolean }]): boolean => icon.hidden !== true)
		.map(([name]: [string, unknown]): string => name);

	const aliases: string[] = Object.entries(set.aliases ?? {})
		.filter(([, alias]: [string, { hidden?: boolean }]): boolean => alias.hidden !== true)
		.map(([name]: [string, unknown]): string => name);

	return [...icons, ...aliases].toSorted();
};

let nameIndex: Promise<ReadonlyMap<string, readonly string[]>> | undefined;

// One set at a time, so that only the names stay in memory, not the icons.
const buildNameIndex = async (): Promise<ReadonlyMap<string, readonly string[]>> => {
	const index: Map<string, readonly string[]> = new Map<string, readonly string[]>();

	for (const set of iconSets) {
		const cached: Promise<StoredIconSet> | undefined = loadedSets.get(set.prefix);
		index.set(set.prefix, visibleNamesOf(await (cached ?? readIconSet(set.prefix))));
	}

	return index;
};

const namesOf = async (prefix: string): Promise<readonly string[]> => {
	nameIndex ??= buildNameIndex();
	return (await nameIndex).get(prefix) ?? [];
};

const namesWithoutIndex = async (prefix: string): Promise<readonly string[]> => {
	return nameIndex === undefined
		? visibleNamesOf(await loadIconSet(prefix))
		: await namesOf(prefix);
};

// Exact names first, then names that start with the query, then the rest; by set and name within each group.
const rankOf = (name: string, query: string): number => {
	if (name === query) return 0;
	return name.startsWith(query) ? 1 : 2;
};

export const searchIcons = async (search: IconSearch): Promise<IconSearchResult> => {
	const words: string[] = search.query
		.toLowerCase()
		.trim()
		.split(/[\s:]+/)
		.filter(Boolean);

	const sets: IconSetEntry[] = iconSets.filter((set: IconSetEntry): boolean => {
		return (
			(search.prefix === undefined || set.prefix === search.prefix) &&
			(search.license === undefined || set.license === search.license)
		);
	});

	// A single set is read directly; a search across several builds the index once.
	const namesBySet: (readonly string[])[] = await Promise.all(
		sets.map(async (set: IconSetEntry): Promise<readonly string[]> => {
			return sets.length === 1 ? await namesWithoutIndex(set.prefix) : await namesOf(set.prefix);
		}),
	);

	const containsEveryWord = (name: string): boolean => {
		return words.every((word: string): boolean => name.includes(word));
	};

	const matches: IconMatch[] = sets.flatMap((set: IconSetEntry, setIndex: number): IconMatch[] => {
		return (namesBySet[setIndex] ?? [])
			.filter(containsEveryWord)
			.map((name: string): IconMatch => ({ prefix: set.prefix, name }));
	});

	const query: string = words.join('-');

	const byRank = (first: IconMatch, second: IconMatch): number => {
		return rankOf(first.name, query) - rankOf(second.name, query);
	};

	const ranked: IconMatch[] = query === '' ? matches : matches.toSorted(byRank);

	const pageCount: number = Math.max(Math.ceil(ranked.length / search.pageSize), 1);
	const page: number = Math.min(Math.max(search.page, 1), pageCount);
	const start: number = (page - 1) * search.pageSize;

	return {
		matches: ranked.slice(start, start + search.pageSize),
		total: ranked.length,
		pageCount,
	};
};

/** `prefix:name`, as `IconifyIcon` and the registry write it. */
export const iconNameOf = (match: IconMatch): IconName => `${match.prefix}:${match.name}`;

/** Data of each match, in order; a match whose data cannot be found is left out. */
export const loadMatches = async (matches: readonly IconMatch[]): Promise<LoadedIcon[]> => {
	const loaded: (LoadedIcon | undefined)[] = await Promise.all(
		matches.map(async (match: IconMatch): Promise<LoadedIcon | undefined> => {
			const data: IconifyIconData | undefined = getIconData(
				await loadIconSet(match.prefix),
				match.name,
			);

			return data === undefined ? undefined : { match, data };
		}),
	);

	return loaded.filter((entry: LoadedIcon | undefined): entry is LoadedIcon => {
		return entry !== undefined;
	});
};
