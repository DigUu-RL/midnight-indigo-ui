// Which licenses a production dependency may have: permissive ones for any package, plus exceptions for named packages
// and for the icon sets of Iconify, whose license is the one of each set (F19).

// Permissive licenses, compatible with distributing the project under MIT, commercial use included.
export const allowedLicenses: ReadonlySet<string> = new Set<string>([
	'MIT',
	'ISC',
	'0BSD',
	'BSD-2-Clause',
	'BSD-3-Clause',
	'Apache-2.0',
	'BlueOak-1.0.0',
]);

export interface LicenseException {
	license: string;
	reason: string;
}

// Licenses allowed for specific packages only, each with the reason.
export const allowedExceptions: Readonly<Record<string, LicenseException>> = {
	'@fontsource-variable/geist': {
		license: 'OFL-1.1',
		reason: 'Font files: the SIL Open Font License allows bundling them with any software (D02).',
	},
	'caniuse-lite': {
		license: 'CC-BY-4.0',
		reason: 'Browser support data used by the Next.js build; attribution travels with the package.',
	},
};

export const iconSetScope: string = '@iconify-json/';

/**
 * Licenses an icon set (`@iconify-json/<prefix>`) may have besides the permissive ones. Icons are artwork, not code:
 * public domain dedications, the font license and CC-BY-4.0 (with the attribution the starter generates) all allow
 * commercial distribution next to an MIT project. Share-alike (GPL, CC-BY-SA), non-commercial and unknown licenses do
 * not, so those sets stay out.
 */
export const allowedIconSetLicenses: ReadonlySet<string> = new Set<string>([
	'CC0-1.0',
	'Unlicense',
	'OFL-1.1',
	'CC-BY-4.0',
]);

/** Licenses that oblige the application to credit the authors of the set. */
export const attributionLicenses: ReadonlySet<string> = new Set<string>(['CC-BY-4.0']);

// An SPDX expression: `(MIT OR Apache-2.0)` needs one allowed alternative, `MIT AND BSD-3-Clause` needs both.
export const isAllowedExpression = (
	expression: string,
	licenses: ReadonlySet<string> = allowedLicenses,
): boolean => {
	const normalized: string = expression.replaceAll(/[()]/g, '').trim();

	return normalized.split(/\s+OR\s+/).some((alternative: string): boolean => {
		return alternative.split(/\s+AND\s+/).every((license: string): boolean => {
			return licenses.has(license.trim());
		});
	});
};

const iconSetLicenses: ReadonlySet<string> = new Set<string>([
	...allowedLicenses,
	...allowedIconSetLicenses,
]);

/** Whether a package with this license may ship in what we distribute. */
export const isAllowedLicense = (license: string, packageName: string): boolean => {
	if (packageName.startsWith(iconSetScope)) return isAllowedExpression(license, iconSetLicenses);
	return isAllowedExpression(license) || allowedExceptions[packageName]?.license === license;
};
