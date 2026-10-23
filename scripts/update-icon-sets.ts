// Updates the icon sets of the starter from the metadata Iconify publishes (`@iconify/collections`):
//
//   pnpm update:icon-sets && pnpm install
//
// Every set whose license allows commercial distribution next to an MIT project (`license-policy.ts`) becomes a
// dependency of the starter (`@iconify-json/<prefix>`, at its latest version), is listed in `src/icons/icon-sets.ts` and
// is credited in the notices (`ICON-NOTICES.md`, `ICON-NOTICES.pt-BR.md`). The other sets are listed with the reason
// they are left out. The license of a set is the one its npm package declares, which `pnpm check:licenses` audits.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

import {
	allowedIconSetLicenses,
	allowedLicenses,
	attributionLicenses,
	iconSetScope,
	isAllowedLicense,
} from '@/scripts/license-policy';

interface CollectionInfo {
	name: string;
	total: number;
	author: { name: string; url?: string };
	license: { title: string; spdx?: string; url?: string };
	hidden?: boolean;
	palette?: boolean;
}

interface RegistryVersion {
	version: string;
	license?: string;
}

// The same shapes as the types written into the generated module.
interface IconSetEntry {
	prefix: string;
	name: string;
	total: number;
	license: string;
	licenseUrl: string;
	author: string;
	authorUrl: string;
	palette: boolean;
	attributionRequired: boolean;
}

type ExclusionReason = 'deprecated' | 'license';

interface ExcludedIconSet {
	prefix: string;
	name: string;
	license: string;
	reason: ExclusionReason;
}

interface PackageManifest {
	dependencies: Record<string, string>;
	[field: string]: unknown;
}

interface NoticeTexts {
	title: string;
	introduction: string;
	attributionHeading: string;
	attributionIntroduction: string;
	allSetsHeading: string;
	excludedHeading: string;
	excludedIntroduction: string;
	columns: { set: string; author: string; license: string; icons: string; reason: string };
	reasons: Record<ExclusionReason, string>;
}

const repositoryRoot: string = fileURLToPath(new URL('..', import.meta.url));
const starterRoot: string = join(repositoryRoot, 'templates', 'nextjs-starter');
const collectionsUrl: string = 'https://cdn.jsdelivr.net/npm/@iconify/collections/collections.json';
const registryUrl: string = 'https://registry.npmjs.org';
const concurrency: number = 16;
const command: string = 'pnpm update:icon-sets';

const fetchJson = async <Result>(url: string): Promise<Result> => {
	const response: Response = await fetch(url);
	if (!response.ok) throw new Error(`GET ${url} answered ${String(response.status)}.`);
	return (await response.json()) as Result;
};

// Runs the requests a few at a time, keeping the order of the input.
const mapInBatches = async <Input, Output>(
	inputs: readonly Input[],
	transform: (input: Input) => Promise<Output>,
): Promise<Output[]> => {
	const results: Output[] = [];

	for (let start: number = 0; start < inputs.length; start += concurrency) {
		results.push(...(await Promise.all(inputs.slice(start, start + concurrency).map(transform))));
	}

	return results;
};

const collections: Record<string, CollectionInfo> =
	await fetchJson<Record<string, CollectionInfo>>(collectionsUrl);

const prefixes: string[] = Object.keys(collections).toSorted();

const publishedVersions: Map<string, RegistryVersion> = new Map<string, RegistryVersion>(
	await mapInBatches(prefixes, async (prefix: string): Promise<[string, RegistryVersion]> => {
		const packageName: string = `${iconSetScope}${prefix}`.replace('/', '%2F');
		return [prefix, await fetchJson<RegistryVersion>(`${registryUrl}/${packageName}/latest`)];
	}),
);

const infoOf = (prefix: string): CollectionInfo => {
	const info: CollectionInfo | undefined = collections[prefix];
	if (info === undefined) throw new Error(`No metadata for the icon set ${prefix}.`);
	return info;
};

const licenseOf = (prefix: string): string => {
	return publishedVersions.get(prefix)?.license ?? infoOf(prefix).license.spdx ?? 'UNKNOWN';
};

const hasAllowedLicense = (prefix: string): boolean => {
	return isAllowedLicense(licenseOf(prefix), `${iconSetScope}${prefix}`);
};

// Iconify hides the sets it deprecated; they stay out even under an allowed license.
const isIncluded = (prefix: string): boolean => {
	return infoOf(prefix).hidden !== true && hasAllowedLicense(prefix);
};

const includedSets: IconSetEntry[] = prefixes
	.filter(isIncluded)
	.map((prefix: string): IconSetEntry => {
		const info: CollectionInfo = infoOf(prefix);
		const license: string = licenseOf(prefix);

		return {
			prefix,
			name: info.name,
			total: info.total,
			license,
			licenseUrl: info.license.url ?? '',
			author: info.author.name,
			authorUrl: info.author.url ?? '',
			palette: info.palette === true,
			attributionRequired: attributionLicenses.has(license),
		};
	});

const excludedSets: ExcludedIconSet[] = prefixes
	.filter((prefix: string): boolean => !isIncluded(prefix))
	.map((prefix: string): ExcludedIconSet => {
		return {
			prefix,
			name: infoOf(prefix).name,
			license: licenseOf(prefix),
			reason: hasAllowedLicense(prefix) ? 'deprecated' : 'license',
		};
	});

const writeFormatted = async (file: string, content: string): Promise<void> => {
	const options: Awaited<ReturnType<typeof resolveConfig>> = await resolveConfig(file);
	writeFileSync(file, await format(content, { ...options, filepath: file }));
};

const moduleSource: string = `// Generated by \`${command}\` from the metadata of Iconify. Do not edit by hand.
// The icon sets the starter depends on (one \`@iconify-json/<prefix>\` package each) and the sets left out.

export interface IconSetEntry {
	prefix: string;
	name: string;
	/** Number of icons. */
	total: number;
	/** SPDX identifier, as the npm package declares it. */
	license: string;
	licenseUrl: string;
	author: string;
	authorUrl: string;
	/** Multicolor icons, which ignore the text color. */
	palette: boolean;
	/** The license (CC-BY-4.0) requires crediting the author. */
	attributionRequired: boolean;
}

/** \`deprecated\`: hidden by Iconify; \`license\`: not allowed for commercial distribution with an MIT project. */
export type ExclusionReason = 'deprecated' | 'license';

export interface ExcludedIconSet {
	prefix: string;
	name: string;
	license: string;
	reason: ExclusionReason;
}

export const iconSets: readonly IconSetEntry[] = ${JSON.stringify(includedSets)};

export const excludedIconSets: readonly ExcludedIconSet[] = ${JSON.stringify(excludedSets)};
`;

await writeFormatted(join(starterRoot, 'src', 'icons', 'icon-sets.ts'), moduleSource);

// The icon sets replace the previous ones among the dependencies; everything else stays.
const manifestPath: string = join(starterRoot, 'package.json');
const manifest: PackageManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageManifest;

const otherDependencies: [string, string][] = Object.entries(manifest.dependencies).filter(
	([name]: [string, string]): boolean => !name.startsWith(iconSetScope),
);

const iconDependencies: [string, string][] = includedSets.map(
	(set: IconSetEntry): [string, string] => {
		const version: string | undefined = publishedVersions.get(set.prefix)?.version;
		if (version === undefined) throw new Error(`No published version of ${set.prefix}.`);
		return [`${iconSetScope}${set.prefix}`, `^${version}`];
	},
);

manifest.dependencies = Object.fromEntries(
	[...otherDependencies, ...iconDependencies].toSorted(
		([first]: [string, string], [second]: [string, string]): number => first.localeCompare(second),
	),
);

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);

const listedLicenses: string = [...allowedLicenses, ...allowedIconSetLicenses].join(', ');
const attributionPage: string = '`/<locale>/icons/attribution`';

const noticeTexts: readonly [string, NoticeTexts][] = [
	[
		'ICON-NOTICES.md',
		{
			title: 'Icon notices',
			introduction: `The starter depends on ${String(includedSets.length)} icon sets of [Iconify](https://iconify.design), one \`@iconify-json/<prefix>\` package each, under the license of each set. The icons are rendered offline: nothing is downloaded at runtime. Generated by \`${command}\`; do not edit by hand.`,
			attributionHeading: 'Attribution',
			attributionIntroduction: `These sets are licensed under CC BY 4.0, which requires crediting their authors. Keep this notice, or the attribution page of the starter (${attributionPage}), in an application that ships their icons.`,
			allSetsHeading: 'All included sets',
			excludedHeading: 'Excluded sets',
			excludedIntroduction: `Allowed licenses: ${listedLicenses}. Sets under any other license (copyleft, share-alike, non-commercial or unknown) and the sets Iconify deprecated are left out:`,
			columns: {
				set: 'Set',
				author: 'Author',
				license: 'License',
				icons: 'Icons',
				reason: 'Reason',
			},
			reasons: {
				deprecated: 'Deprecated by Iconify',
				license: 'License does not allow commercial distribution with an MIT project',
			},
		},
	],
	[
		'ICON-NOTICES.pt-BR.md',
		{
			title: 'Avisos dos ícones',
			introduction: `O starter depende de ${String(includedSets.length)} conjuntos de ícones do [Iconify](https://iconify.design), um pacote \`@iconify-json/<prefixo>\` cada, sob a licença de cada conjunto. Os ícones são renderizados offline: nada é baixado em tempo de execução. Gerado por \`${command}\`; não edite à mão.`,
			attributionHeading: 'Atribuição',
			attributionIntroduction: `Estes conjuntos são licenciados sob CC BY 4.0, que exige dar crédito aos autores. Mantenha este aviso, ou a página de atribuição do starter (${attributionPage}), em uma aplicação que distribui os seus ícones.`,
			allSetsHeading: 'Todos os conjuntos incluídos',
			excludedHeading: 'Conjuntos excluídos',
			excludedIntroduction: `Licenças permitidas: ${listedLicenses}. Os conjuntos sob qualquer outra licença (copyleft, share-alike, não comercial ou desconhecida) e os conjuntos que o Iconify descontinuou ficam de fora:`,
			columns: {
				set: 'Conjunto',
				author: 'Autor',
				license: 'Licença',
				icons: 'Ícones',
				reason: 'Motivo',
			},
			reasons: {
				deprecated: 'Descontinuado pelo Iconify',
				license: 'A licença não permite distribuição comercial com um projeto MIT',
			},
		},
	],
];

const link = (text: string, url: string): string => (url === '' ? text : `[${text}](${url})`);
const cell = (text: string): string => text.replaceAll('|', '\\|');

const setRow = (set: IconSetEntry): string => {
	return `| ${cell(set.name)} (\`${set.prefix}\`) | ${link(cell(set.author), set.authorUrl)} | ${link(set.license, set.licenseUrl)} | ${String(set.total)} |`;
};

const renderNotices = (texts: NoticeTexts): string => {
	const { set, author, license, icons, reason }: NoticeTexts['columns'] = texts.columns;
	const setTable: string = `| ${set} | ${author} | ${license} | ${icons} |\n| --- | --- | --- | --- |`;

	return [
		`# ${texts.title}`,
		'',
		texts.introduction,
		'',
		`## ${texts.attributionHeading}`,
		'',
		texts.attributionIntroduction,
		'',
		setTable,
		...includedSets.filter((entry: IconSetEntry): boolean => entry.attributionRequired).map(setRow),
		'',
		`## ${texts.allSetsHeading}`,
		'',
		setTable,
		...includedSets.map(setRow),
		'',
		`## ${texts.excludedHeading}`,
		'',
		texts.excludedIntroduction,
		'',
		`| ${set} | ${license} | ${reason} |\n| --- | --- | --- |`,
		...excludedSets.map((entry: ExcludedIconSet): string => {
			return `| ${cell(entry.name)} (\`${entry.prefix}\`) | ${entry.license} | ${texts.reasons[entry.reason]} |`;
		}),
		'',
	].join('\n');
};

for (const [fileName, texts] of noticeTexts) {
	await writeFormatted(join(starterRoot, fileName), renderNotices(texts));
}

console.log(
	`${String(includedSets.length)} icon sets included, ${String(excludedSets.length)} excluded. Run pnpm install to fetch them.`,
);
