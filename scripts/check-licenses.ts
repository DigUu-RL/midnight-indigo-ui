// Fails when a production dependency of what we distribute has a license outside the allowlist: the peers a consumer of
// the library installs (listed by the consumer fixture) and the dependencies an application built from the starter
// ships. Dev-only tools (linters, test runners, bundlers) never reach a user and are not audited.
import { spawnSync } from 'node:child_process';
import type { SpawnSyncReturns } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface LicensedPackage {
	name: string;
	versions: string[];
}

type LicenseReport = Record<string, LicensedPackage[]>;

interface PackageManifest {
	license?: string;
}

// Permissive licenses, compatible with distributing the project under MIT, commercial use included.
const allowedLicenses: ReadonlySet<string> = new Set<string>([
	'MIT',
	'ISC',
	'0BSD',
	'BSD-2-Clause',
	'BSD-3-Clause',
	'Apache-2.0',
	'BlueOak-1.0.0',
]);

// Licenses allowed for specific packages only, each with the reason.
const allowedExceptions: Readonly<Record<string, { license: string; reason: string }>> = {
	'@fontsource-variable/geist': {
		license: 'OFL-1.1',
		reason: 'Font files: the SIL Open Font License allows bundling them with any software (D02).',
	},
	'caniuse-lite': {
		license: 'CC-BY-4.0',
		reason: 'Browser support data used by the Next.js build; attribution travels with the package.',
	},
};

const auditedWorkspaces: readonly string[] = [
	'@midnight-indigo/consumer-fixture',
	'@midnight-indigo/nextjs-starter',
];

const repositoryRoot: string = fileURLToPath(new URL('..', import.meta.url));

// An SPDX expression: `(MIT OR Apache-2.0)` needs one allowed alternative, `MIT AND BSD-3-Clause` needs both.
const isAllowedExpression = (expression: string): boolean => {
	const normalized: string = expression.replaceAll(/[()]/g, '').trim();

	return normalized.split(/\s+OR\s+/).some((alternative: string): boolean => {
		return alternative.split(/\s+AND\s+/).every((license: string): boolean => {
			return allowedLicenses.has(license.trim());
		});
	});
};

const isAllowed = (license: string, packageName: string): boolean => {
	return isAllowedExpression(license) || allowedExceptions[packageName]?.license === license;
};

const listLicenses = (workspace: string): LicenseReport => {
	// pnpm sets `npm_execpath` for the scripts it runs: a JavaScript entry, or a native executable since pnpm 11.
	const packageManager: string | undefined = process.env.npm_execpath;
	if (packageManager === undefined) throw new Error('Run through pnpm: pnpm check:licenses.');
	const parameters: string[] = ['licenses', 'list', '--prod', '--json', '--filter', workspace];
	const runsOnNode: boolean = /\.[cm]?js$/.test(packageManager);

	const result: SpawnSyncReturns<string> = spawnSync(
		runsOnNode ? process.execPath : packageManager,
		runsOnNode ? [packageManager, ...parameters] : parameters,
		{ cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
	);

	if (result.status !== 0) throw new Error(`pnpm licenses failed:\n${result.stderr}`);
	return JSON.parse(result.stdout) as LicenseReport;
};

const violations: string[] = auditedWorkspaces.flatMap((workspace: string): string[] => {
	return Object.entries(listLicenses(workspace)).flatMap(
		([license, packages]: [string, LicensedPackage[]]): string[] => {
			return packages
				.filter((licensed: LicensedPackage): boolean => !isAllowed(license, licensed.name))
				.map((licensed: LicensedPackage): string => {
					return `  - ${licensed.name}@${licensed.versions.join(', ')}: ${license} (from ${workspace})`;
				});
		},
	);
});

const ownManifest: PackageManifest = JSON.parse(
	readFileSync(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
) as PackageManifest;

const ownLicenseViolation: string[] =
	ownManifest.license === 'MIT'
		? []
		: [`  - @midnight-indigo/ui declares ${ownManifest.license ?? 'no license'} instead of MIT`];

const problems: string[] = [...ownLicenseViolation, ...violations];

const report: string =
	problems.length > 0
		? ['Licenses outside the allowlist (scripts/check-licenses.ts):', ...problems].join('\n')
		: `OK: every production dependency of ${auditedWorkspaces.join(' and ')} has an allowed license.`;

console[problems.length > 0 ? 'error' : 'log'](report);
process.exitCode = problems.length > 0 ? 1 : 0;
