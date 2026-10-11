// Typed accessors to the token CSS custom properties, for CSS-in-JS, inline styles and component code.
import { cssVariableReference, tokens } from '../tokens/index.ts';
import type { DesignTokens } from '../tokens/index.ts';

type VariableTree<Node> = Node extends string
	? string
	: Node extends readonly (infer Item)[]
		? readonly VariableTree<Item>[]
		: { readonly [Key in keyof Node]: VariableTree<Node[Key]> };

/** Same shape as `DesignTokens`, with each value replaced by its `var(--mi-*)` reference. */
export type ThemeVariables = VariableTree<DesignTokens>;

const toVariableTree = (node: unknown, path: readonly string[]): unknown => {
	if (typeof node === 'string') return cssVariableReference(path);

	if (Array.isArray(node)) {
		return Object.freeze(
			node.map((item: unknown, index: number): unknown => {
				return toVariableTree(item, [...path, String(index + 1)]);
			}),
		);
	}

	return Object.freeze(
		Object.fromEntries(
			Object.entries(node as Record<string, unknown>).map(
				([key, child]: [string, unknown]): [string, unknown] => {
					return [key, toVariableTree(child, [...path, key])];
				},
			),
		),
	);
};

/**
 * `var(--mi-*)` references to every token, e.g. `themeVariables.intent.official.main`. They resolve to the
 * active theme at runtime, so styles written with them follow any palette given to `UiProvider`.
 */
export const themeVariables: ThemeVariables = toVariableTree(tokens, []) as ThemeVariables;
