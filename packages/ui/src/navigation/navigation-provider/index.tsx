'use client';
// Lets every link of the library render through the router of the host framework, which the library never imports.
import { createContext, use } from 'react';
import type { ComponentPropsWithRef, ComponentType, Context, ReactElement, ReactNode } from 'react';

/** Props that the library passes to a link component: those of `<a>`, with a required `href`. */
export interface LinkComponentProps extends Omit<ComponentPropsWithRef<'a'>, 'href'> {
	href: string;
}

/**
 * A component that renders an `<a>` for an internal route, such as `Link` of `next/link` or React Router. It receives
 * `LinkComponentProps`, but only `href` is required of its type: routers declare optional props without `undefined`
 * (`next/link` does), which `exactOptionalPropertyTypes` would otherwise reject.
 */
export type LinkComponent = ComponentType<Pick<LinkComponentProps, 'href'>>;

export interface NavigationProviderProps {
	/**
	 * Renders the internal links of `Link`, `Breadcrumbs`, `Pagination`, `TabNavigation` and `Sidebar`. It must forward
	 * every prop (`className`, `aria-current`, handlers and `ref` included) to the `<a>` it renders. Defaults to a plain
	 * `<a>`, which reloads the page.
	 */
	linkComponent: LinkComponent;
	children?: ReactNode;
}

const LinkComponentContext: Context<LinkComponent | undefined> = createContext<
	LinkComponent | undefined
>(undefined);

/**
 * Client Component: in the Next.js App Router, render it from a Client Component of the application that imports
 * `next/link`, as the starter does, and place it in the root layout.
 */
export const NavigationProvider = ({
	linkComponent,
	children,
}: NavigationProviderProps): ReactElement => {
	return <LinkComponentContext value={linkComponent}>{children}</LinkComponentContext>;
};

/** The link component of the nearest `NavigationProvider`, or `undefined` for a plain `<a>`. */
export const useLinkComponent = (): LinkComponent | undefined => use(LinkComponentContext);

/** Props to spread on a styled `<a>` so that it renders through the link component, when there is one. */
export const useLinkAs = (): { as?: LinkComponent } => {
	const linkComponent: LinkComponent | undefined = useLinkComponent();
	return linkComponent === undefined ? {} : { as: linkComponent };
};
