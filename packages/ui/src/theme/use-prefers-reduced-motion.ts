// Reads the reduced motion preference for animations driven by JavaScript, which CSS variables cannot reach.
import useMediaQuery from '@mui/material/useMediaQuery';

import { reducedMotionMediaQuery } from '@/src/tokens/index';

/**
 * Whether the user asked the system to minimize motion. It is `false` during server rendering and hydration, so the
 * markup matches, and follows the system setting from then on.
 */
export const usePrefersReducedMotion = (): boolean => useMediaQuery(reducedMotionMediaQuery);
