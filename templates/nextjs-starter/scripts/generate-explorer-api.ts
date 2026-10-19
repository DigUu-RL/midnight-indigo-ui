// Generates `src/explorer/component-api.json`, the props of each component of the explorer, from the declarations the
// library publishes (its `dist`, as the starter installs it: run `pnpm build` first):
//
//   node scripts/generate-explorer-api.ts
//
// A prop is listed when the library declares it, or when the catalog names it in `nativeProps`; the attributes of the
// native element that the component only passes on are left out. The type is the one the library writes, the
// description its TSDoc, and the default the code in its `Defaults to …` sentence.
import { realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import typescript from 'typescript';

import { explorerComponents } from '#src/explorer/catalog.ts';
import type { ExplorerComponent } from '#src/explorer/catalog.ts';
import type { ComponentApi, ComponentProp, PropKind } from '#src/explorer/component-api.ts';

interface Prettier {
	format: (source: string, options: Record<string, unknown>) => Promise<string>;
	resolveConfig: (file: string) => Promise<Record<string, unknown> | null>;
}

const starterRoot: string = fileURLToPath(new URL('..', import.meta.url));
const repositoryRoot: string = resolve(starterRoot, '..', '..');
const outputFile: string = join(starterRoot, 'src', 'explorer', 'component-api.json');
const requireFromStarter: NodeJS.Require = createRequire(join(starterRoot, 'package.json'));

const libraryRoot: string = realpathSync(
	dirname(requireFromStarter.resolve('@midnight-indigo/ui/package.json')),
);

// A file that imports every subpath of the catalog; it exists only in the memory of the compiler.
const entryFile: string = join(starterRoot, 'explorer-api-entry.ts');

const compilerOptions: typescript.CompilerOptions = {
	target: typescript.ScriptTarget.ES2022,
	module: typescript.ModuleKind.ESNext,
	moduleResolution: typescript.ModuleResolutionKind.Bundler,
	jsx: typescript.JsxEmit.ReactJSX,
	strict: true,
	exactOptionalPropertyTypes: true,
	skipLibCheck: true,
	noEmit: true,
	types: [],
};

const defaultPattern: RegExp = /Defaults to (`[^`]+`)/;

const isLibraryDeclaration = (declaration: typescript.Declaration): boolean => {
	return realpathSync(declaration.getSourceFile().fileName).startsWith(`${libraryRoot}${sep}`);
};

/** Whether the parenthesis that opens the text closes at its end, e.g. `(() => void)`, not `(a) => (b)`. */
const isWrapped = (type: string): boolean => {
	if (!type.startsWith('(') || !type.endsWith(')')) return false;
	let depth: number = 0;

	// A type is ASCII code, so splitting it into UTF-16 units splits it into characters.
	return type.split('').every((character: string, index: number): boolean => {
		depth += character === '(' ? 1 : character === ')' ? -1 : 0;
		return depth > 0 || index === type.length - 1;
	});
};

const withoutUndefined = (type: string): string => {
	const members: string = type
		.replaceAll(/\s+/g, ' ')
		.split(/ \| (?![^(<{[]*[)>}\]])/)
		.filter((member: string): boolean => member !== 'undefined')
		.join(' | ');

	return isWrapped(members) ? members.slice(1, -1) : members;
};

const documentationOf = (property: typescript.Symbol, checker: typescript.TypeChecker): string => {
	const comments: string[] = (property.getDeclarations() ?? []).map(
		(declaration: typescript.Declaration): string => {
			const name: typescript.Node | undefined = typescript.getNameOfDeclaration(declaration);

			const symbol: typescript.Symbol | undefined =
				name === undefined ? undefined : checker.getSymbolAtLocation(name);

			return typescript.displayPartsToString(symbol?.getDocumentationComment(checker) ?? []);
		},
	);

	return (comments.find((comment: string): boolean => comment !== '') ?? '')
		.replaceAll(/\s*\n\s*/g, ' ')
		.trim();
};

/** The type as written in the declaration, when there is only one; the type the checker computes otherwise. */
const typeTextOf = (property: typescript.Symbol, checker: typescript.TypeChecker): string => {
	const declarations: typescript.Declaration[] = property.getDeclarations() ?? [];
	const [declaration] = declarations;

	const written: string | undefined =
		declarations.length === 1 &&
		declaration !== undefined &&
		typescript.isPropertySignature(declaration)
			? declaration.type?.getText()
			: undefined;

	return withoutUndefined(
		written ??
			checker.typeToString(
				checker.getTypeOfSymbol(property),
				undefined,
				typescript.TypeFormatFlags.NoTruncation,
			),
	);
};

const kindOf = (
	type: typescript.Type,
	typeText: string,
	checker: typescript.TypeChecker,
): { kind: PropKind; options: string[] } => {
	const members: typescript.Type[] = type.isUnion() ? type.types : [type];

	if (members.every((member: typescript.Type): boolean => member.isStringLiteral())) {
		return {
			kind: 'enum',
			options: members.map(
				(member: typescript.Type): string => (member as typescript.StringLiteralType).value,
			),
		};
	}

	if (checker.typeToString(type) === 'boolean') return { kind: 'boolean', options: [] };
	if (typeText === 'ReactNode') return { kind: 'node', options: [] };
	if ((type.flags & typescript.TypeFlags.String) !== 0) return { kind: 'string', options: [] };
	if ((type.flags & typescript.TypeFlags.Number) !== 0) return { kind: 'number', options: [] };
	return { kind: 'other', options: [] };
};

/**
 * The props of every member of a union, e.g. `onClick` and `selected` of a chip that is a button. The props common to
 * all members come first: their symbols join the declarations of every member.
 */
const propertiesOf = (
	propsType: typescript.Type,
	checker: typescript.TypeChecker,
): typescript.Symbol[] => {
	const members: typescript.Type[] = propsType.isUnion() ? propsType.types : [];

	return [propsType, ...members]
		.flatMap((type: typescript.Type): typescript.Symbol[] => checker.getPropertiesOfType(type))
		.reduce((properties: typescript.Symbol[], property: typescript.Symbol): typescript.Symbol[] => {
			const known: boolean = properties.some((candidate: typescript.Symbol): boolean => {
				return candidate.name === property.name;
			});

			return known ? properties : [...properties, property];
		}, []);
};

const describeComponent = (
	component: ExplorerComponent,
	exports: readonly typescript.Symbol[],
	checker: typescript.TypeChecker,
): ComponentProp[] => {
	const exported: typescript.Symbol | undefined = exports.find(
		(symbol: typescript.Symbol): boolean => symbol.name === component.name,
	);

	if (exported === undefined) {
		throw new Error(`@midnight-indigo/ui/${component.subpath} does not export ${component.name}.`);
	}

	const symbol: typescript.Symbol =
		(exported.flags & typescript.SymbolFlags.Alias) === 0
			? exported
			: checker.getAliasedSymbol(exported);

	const [signature] = checker.getTypeOfSymbol(symbol).getCallSignatures();
	const [parameter] = signature?.getParameters() ?? [];
	if (parameter === undefined) throw new Error(`${component.name} takes no props.`);

	const nativeProps: readonly string[] = component.nativeProps;

	return propertiesOf(checker.getTypeOfSymbol(parameter), checker)
		.map((property: typescript.Symbol): [typescript.Symbol, boolean] => {
			return [property, !(property.getDeclarations() ?? []).some(isLibraryDeclaration)];
		})
		.filter(([property, native]: [typescript.Symbol, boolean]): boolean => {
			return !native || nativeProps.includes(property.name);
		})
		.map(([property, native]: [typescript.Symbol, boolean]): ComponentProp => {
			const description: string = native ? '' : documentationOf(property, checker);
			const type: string = typeTextOf(property, checker);

			const resolved: typescript.Type = checker.getNonNullableType(
				checker.getTypeOfSymbol(property),
			);

			return {
				name: property.name,
				type,
				required: (property.flags & typescript.SymbolFlags.Optional) === 0,
				defaultValue: defaultPattern.exec(description)?.[1]?.slice(1, -1) ?? null,
				description,
				native,
				...kindOf(resolved, type, checker),
			};
		});
};

/** The props of every component of the catalog, read from the declarations of the installed library. */
export const generateComponentApi = (): ComponentApi => {
	const subpaths: string[] = [
		...new Set(explorerComponents.map((component: ExplorerComponent): string => component.subpath)),
	];

	const entrySource: string = subpaths
		.map((subpath: string, index: number): string => {
			return `import * as subpath${String(index)} from '@midnight-indigo/ui/${subpath}';`;
		})
		.join('\n');

	const host: typescript.CompilerHost = typescript.createCompilerHost(compilerOptions);
	const readFile: (file: string) => string | undefined = host.readFile.bind(host);
	const fileExists: (file: string) => boolean = host.fileExists.bind(host);
	const getSourceFile: typescript.CompilerHost['getSourceFile'] = host.getSourceFile.bind(host);

	host.readFile = (file: string): string | undefined => {
		return resolve(file) === entryFile ? entrySource : readFile(file);
	};

	host.fileExists = (file: string): boolean => resolve(file) === entryFile || fileExists(file);

	host.getSourceFile = (
		file: string,
		languageVersion: typescript.ScriptTarget | typescript.CreateSourceFileOptions,
	): typescript.SourceFile | undefined => {
		return resolve(file) === entryFile
			? typescript.createSourceFile(file, entrySource, languageVersion, true)
			: getSourceFile(file, languageVersion);
	};

	const program: typescript.Program = typescript.createProgram([entryFile], compilerOptions, host);
	const checker: typescript.TypeChecker = program.getTypeChecker();
	const entry: typescript.SourceFile | undefined = program.getSourceFile(entryFile);
	if (entry === undefined) throw new Error('The compiler did not read the entry file.');

	const exportsBySubpath: Map<string, typescript.Symbol[]> = new Map<string, typescript.Symbol[]>(
		entry.statements
			.filter(typescript.isImportDeclaration)
			.map((declaration: typescript.ImportDeclaration): [string, typescript.Symbol[]] => {
				const specifier: string = (declaration.moduleSpecifier as typescript.StringLiteral).text;

				const moduleSymbol: typescript.Symbol | undefined = checker.getSymbolAtLocation(
					declaration.moduleSpecifier,
				);

				if (moduleSymbol === undefined) {
					throw new Error(
						`${specifier} has no declarations: build the library first (pnpm build).`,
					);
				}

				return [
					specifier.slice('@midnight-indigo/ui/'.length),
					checker.getExportsOfModule(moduleSymbol),
				];
			}),
	);

	return Object.fromEntries(
		explorerComponents.map((component: ExplorerComponent): [string, ComponentProp[]] => {
			return [
				component.name,
				describeComponent(component, exportsBySubpath.get(component.subpath) ?? [], checker),
			];
		}),
	);
};

/** Prettier of the repository, so the file is written as `pnpm format` would write it. */
const formatJson = async (json: string): Promise<string> => {
	const requireFromRepository: NodeJS.Require = createRequire(join(repositoryRoot, 'package.json'));

	// `require.resolve` finds the CommonJS build, whose functions are on the default export.
	const prettierModule: { default: Prettier } = (await import(
		pathToFileURL(requireFromRepository.resolve('prettier')).href
	)) as { default: Prettier };

	const prettier: Prettier = prettierModule.default;

	return prettier.format(json, {
		...(await prettier.resolveConfig(outputFile)),
		filepath: outputFile,
	});
};

const isEntryPoint: boolean =
	process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
	writeFileSync(outputFile, await formatJson(JSON.stringify(generateComponentApi())));
	console.log(`Wrote ${outputFile}.`);
}
