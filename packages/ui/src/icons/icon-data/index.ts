// Icon data in the Iconify format (`IconifyJSON`), resolved and turned into the contents of an inline SVG. Structural
// types, so the data of any `@iconify-json/*` package fits without the library depending on Iconify at runtime.

/** Position and size of the drawing; Iconify defaults them to `0`, `0`, `16` and `16`. */
export interface IconifyDimensions {
	left?: number;
	top?: number;
	width?: number;
	height?: number;
}

/** Rotation in quarter turns (`1` is 90°) and mirroring. */
export interface IconifyTransformations {
	rotate?: number;
	hFlip?: boolean;
	vFlip?: boolean;
}

/** One icon: the SVG markup inside `<svg>` and how to frame it. */
export interface IconifyIconData extends IconifyDimensions, IconifyTransformations {
	body: string;
	/** Kept for old names; still renderable. */
	hidden?: boolean;
}

/** Another name for an icon of the same collection, optionally transformed. */
export interface IconifyAliasData extends IconifyDimensions, IconifyTransformations {
	parent: string;
	hidden?: boolean;
}

/** A collection of icons, such as the `icons` export of an `@iconify-json/*` package. */
export interface IconifyCollection extends IconifyDimensions {
	prefix: string;
	icons: Record<string, IconifyIconData>;
	aliases?: Record<string, IconifyAliasData>;
}

/** An icon named after its collection, as Iconify writes it: `'tabler:home'`. */
export type IconName = `${string}:${string}`;

/** Contents of the SVG element of an icon. */
export interface RenderedIcon {
	viewBox: string;
	/** Width over height, to size a wide or tall icon without distorting it. */
	aspectRatio: number;
	body: string;
}

const defaultSize: number = 16;

// Only the dimensions that are set, so that spreading them never replaces a value with `undefined`.
const pickDimensions = (source: IconifyDimensions): IconifyDimensions => {
	return {
		...(source.left === undefined ? {} : { left: source.left }),
		...(source.top === undefined ? {} : { top: source.top }),
		...(source.width === undefined ? {} : { width: source.width }),
		...(source.height === undefined ? {} : { height: source.height }),
	};
};

// An alias inherits from its parent: dimensions are replaced, rotations add up and flips cancel each other.
const mergeAlias = (icon: IconifyIconData, alias: IconifyAliasData): IconifyIconData => {
	return {
		...icon,
		...pickDimensions(alias),
		rotate: (icon.rotate ?? 0) + (alias.rotate ?? 0),
		hFlip: (icon.hFlip ?? false) !== (alias.hFlip ?? false),
		vFlip: (icon.vFlip ?? false) !== (alias.vFlip ?? false),
	};
};

// Aliases chain at most a few levels; the limit only guards against a cycle in malformed data.
const maximumAliasDepth: number = 8;

const resolveName = (
	collection: IconifyCollection,
	name: string,
	depth: number,
): IconifyIconData | undefined => {
	const icon: IconifyIconData | undefined = collection.icons[name];
	if (icon !== undefined) return icon;
	const alias: IconifyAliasData | undefined = collection.aliases?.[name];
	if (alias === undefined || depth >= maximumAliasDepth) return undefined;
	const parent: IconifyIconData | undefined = resolveName(collection, alias.parent, depth + 1);

	return parent === undefined ? undefined : mergeAlias(parent, alias);
};

/**
 * Data of one icon of a collection, following aliases and applying the dimensions the collection sets for all its
 * icons. `undefined` when the collection has no such icon.
 */
export const getIconData = (
	collection: IconifyCollection,
	name: string,
): IconifyIconData | undefined => {
	const icon: IconifyIconData | undefined = resolveName(collection, name, 0);
	return icon === undefined ? undefined : { ...pickDimensions(collection), ...icon };
};

const identifierPattern: RegExp = /\sid="(\S+)"/g;

const escapeForPattern = (text: string): string => text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Renames the `id`s of an icon body (gradients, masks, clip paths) and the references to them, so that two copies of
 * the icon on one page do not share them. `scope` must be unique per rendered icon.
 */
export const scopeIdentifiers = (body: string, scope: string): string => {
	const identifiers: string[] = [
		...new Set(
			[...body.matchAll(identifierPattern)].map((match: RegExpExecArray): string => match[1] ?? ''),
		),
	];

	const scopedNames: Map<string, string> = new Map<string, string>(
		identifiers.map((identifier: string, index: number): [string, string] => {
			return [identifier, `${scope}-${String(index)}`];
		}),
	);

	// Longest first, so that `a` does not rename the start of `a.b`.
	const byLength: string[] = identifiers.toSorted(
		(first: string, second: string): number => second.length - first.length,
	);

	return byLength.reduce((scopedBody: string, identifier: string): string => {
		// The same boundaries Iconify uses: `id="x"`, `href="#x"`, `url(#x)` and `x.begin` in animations.
		const reference: RegExp = new RegExp(
			`([#;"])(${escapeForPattern(identifier)})([")]|\\.[a-z])`,
			'g',
		);

		return scopedBody.replace(reference, `$1${scopedNames.get(identifier) ?? identifier}$3`);
	}, body);
};

const normalizeQuarterTurns = (rotate: number): number => ((rotate % 4) + 4) % 4;

const selfClosingTagPattern: RegExp = /<([a-zA-Z][\w:-]*)((?:\s+[^\s=/>]+(?:="[^"]*")?)*)\s*\/>/g;

// `<path/>` becomes `<path></path>`, as the browser serializes it, so the markup of the server and the browser match.
const expandSelfClosingTags = (body: string): string => {
	return body.replace(selfClosingTagPattern, '<$1$2></$1>');
};

/**
 * `viewBox` and body of an icon, with its rotation and flips applied as a transform of the body and its empty elements
 * written with a closing tag.
 */
export const renderIconData = (icon: IconifyIconData): RenderedIcon => {
	const box: Required<IconifyDimensions> = {
		left: icon.left ?? 0,
		top: icon.top ?? 0,
		width: icon.width ?? defaultSize,
		height: icon.height ?? defaultSize,
	};

	const flippedBoth: boolean = icon.hFlip === true && icon.vFlip === true;
	// Flipping both ways is a half turn.
	const quarterTurns: number = normalizeQuarterTurns((icon.rotate ?? 0) + (flippedBoth ? 2 : 0));
	const transforms: string[] = [];

	if (icon.hFlip === true && !flippedBoth) {
		transforms.push(
			`translate(${String(box.width + box.left)} ${String(-box.top)})`,
			'scale(-1 1)',
		);

		box.left = 0;
		box.top = 0;
	}

	if (icon.vFlip === true && !flippedBoth) {
		transforms.push(
			`translate(${String(-box.left)} ${String(box.height + box.top)})`,
			'scale(1 -1)',
		);

		box.left = 0;
		box.top = 0;
	}

	const rotations: Record<number, string> = {
		1: `rotate(90 ${String(box.height / 2 + box.top)} ${String(box.height / 2 + box.top)})`,
		2: `rotate(180 ${String(box.width / 2 + box.left)} ${String(box.height / 2 + box.top)})`,
		3: `rotate(-90 ${String(box.width / 2 + box.left)} ${String(box.width / 2 + box.left)})`,
	};

	const rotation: string | undefined = rotations[quarterTurns];
	if (rotation !== undefined) transforms.unshift(rotation);
	// A quarter turn swaps the axes.
	const turnedSideways: boolean = quarterTurns % 2 === 1;

	const frame: Required<IconifyDimensions> = turnedSideways
		? { left: box.top, top: box.left, width: box.height, height: box.width }
		: box;

	const elements: string = expandSelfClosingTags(icon.body);

	const body: string =
		transforms.length === 0 ? elements : `<g transform="${transforms.join(' ')}">${elements}</g>`;

	return {
		viewBox: [frame.left, frame.top, frame.width, frame.height].map(String).join(' '),
		aspectRatio: frame.width / frame.height,
		body,
	};
};
