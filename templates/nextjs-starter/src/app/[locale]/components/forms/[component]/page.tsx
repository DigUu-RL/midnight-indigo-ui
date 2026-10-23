// The pages of the components of `@midnight-indigo/ui/forms`, served at `/[locale]/components/<slug>` by the proxy:
// see `explorer/component-page.tsx`.
import { formsBindings } from '@/src/explorer/bindings/forms';
import { createComponentRoute } from '@/src/explorer/component-page';
import type { ComponentRoute } from '@/src/explorer/component-page';

const route: ComponentRoute = createComponentRoute('forms', formsBindings);

/** Any other component is a missing page. */
export const dynamicParams: boolean = false;

export const generateStaticParams: ComponentRoute['generateStaticParams'] =
	route.generateStaticParams;

export const generateMetadata: ComponentRoute['generateMetadata'] = route.generateMetadata;

export default route.ComponentPage;
