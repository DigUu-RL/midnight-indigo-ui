'use client';
// Whether the viewport is at least as wide as a breakpoint, for behavior that CSS alone cannot switch.
import useMediaQuery from '@mui/material/useMediaQuery';

import { breakpointMediaQuery } from '#src/tokens/index.ts';
import type { Breakpoint } from '#src/tokens/index.ts';

/**
 * `true` from `breakpoint` up. It is `false` on the server and during hydration, then follows the viewport, so
 * prefer responsive props and CSS for what must be right in the first paint; use this for behavior, e.g. closing a
 * navigation drawer once the permanent sidebar is visible.
 */
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
	return useMediaQuery(breakpointMediaQuery(breakpoint));
};
