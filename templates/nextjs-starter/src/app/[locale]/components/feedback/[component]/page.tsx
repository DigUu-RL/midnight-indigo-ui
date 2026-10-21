// The pages of the components of `@midnight-indigo/ui/feedback`, served at `/[locale]/components/<slug>` by the proxy:
// see `explorer/component-page.tsx`.
import { feedbackBindings } from '#src/explorer/bindings/feedback.tsx';
import { createComponentRoute } from '#src/explorer/component-page.tsx';
import type { ComponentRoute } from '#src/explorer/component-page.tsx';

const route: ComponentRoute = createComponentRoute('feedback', feedbackBindings);

/** Any other component is a missing page. */
export const dynamicParams: boolean = false;

export const generateStaticParams: ComponentRoute['generateStaticParams'] =
	route.generateStaticParams;

export const generateMetadata: ComponentRoute['generateMetadata'] = route.generateMetadata;

export default route.ComponentPage;
