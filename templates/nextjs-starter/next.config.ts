import type { NextConfig } from 'next';

const nextConfiguration: NextConfig = {
	reactStrictMode: true,
	experimental: {
		// `app/global-not-found.tsx`: the root layout is inside `app/[locale]`, so a missing path has no layout to render
		// in. Experimental since Next.js 15.4; the official answer for root layouts under a dynamic segment.
		globalNotFound: true,
	},
};

export default nextConfiguration;
