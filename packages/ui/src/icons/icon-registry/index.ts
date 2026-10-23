// Collections registered by the application, so that an icon can be named (`'tabler:home'`) instead of imported.
// Registration is per JavaScript environment: what the server registers is not on the client, and vice versa.
import { getIconData } from '@/src/icons/icon-data/index';
import type { IconifyCollection, IconifyIconData, IconName } from '@/src/icons/icon-data/index';

const collections: Map<string, IconifyCollection> = new Map<string, IconifyCollection>();

/**
 * Makes the icons of a collection available by name. A whole collection weighs hundreds of kilobytes or more, so on
 * the client prefer importing single icons; on the server (e.g. a React Server Component) registering costs no
 * client JavaScript. Registering a prefix again replaces its collection.
 */
export const registerIconCollection = (collection: IconifyCollection): void => {
	collections.set(collection.prefix, collection);
};

/** Removes a registered collection; returns whether it was registered. */
export const unregisterIconCollection = (prefix: string): boolean => collections.delete(prefix);

/** Prefixes of the registered collections, in registration order. */
export const listRegisteredIconCollections = (): string[] => [...collections.keys()];

const splitName = (name: string): [string, string] => {
	const separator: number = name.indexOf(':');

	if (separator <= 0 || separator === name.length - 1) {
		throw new TypeError(
			`"${name}" is not an icon name. Write the collection prefix and the icon name, e.g. "tabler:home".`,
		);
	}

	return [name.slice(0, separator), name.slice(separator + 1)];
};

/** Data of a named icon from the registered collections. Throws when the collection or the icon does not exist. */
export const resolveIconName = (name: IconName): IconifyIconData => {
	const [prefix, iconName]: [string, string] = splitName(name);
	const collection: IconifyCollection | undefined = collections.get(prefix);

	if (collection === undefined) {
		throw new Error(
			`No icon collection is registered for the prefix "${prefix}" (icon "${name}"). Register it with ` +
				`registerIconCollection(icons) from "@iconify-json/${prefix}" in the same environment (server or client) ` +
				'that renders the icon, or import the icon data instead.',
		);
	}

	const icon: IconifyIconData | undefined = getIconData(collection, iconName);

	if (icon === undefined) {
		throw new Error(`The icon collection "${prefix}" has no icon "${iconName}" (icon "${name}").`);
	}

	return icon;
};
