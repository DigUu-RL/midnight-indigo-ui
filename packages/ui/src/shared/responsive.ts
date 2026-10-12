// Props that change with the viewport width: one value, or one value per breakpoint (mobile first).
import type { CSSObject } from '@mui/material/styles';

import { breakpointMediaQuery, breakpointNames } from '#src/tokens/index.ts';
import type { Breakpoint } from '#src/tokens/index.ts';

/**
 * A value for every width, or values from some breakpoints up: `{ compact: 'column', expanded: 'row' }` is a column
 * until `expanded` and a row from there. A breakpoint left out keeps the value of the previous one.
 */
export type Responsive<Value> = Value | Readonly<Partial<Record<Breakpoint, Value>>>;

const isPerBreakpoint = <Value>(
	value: Responsive<Value>,
): value is Readonly<Partial<Record<Breakpoint, Value>>> => {
	return typeof value === 'object' && value !== null;
};

/** Styles of a responsive value: `compact` (or a single value) without a media query, the others inside theirs. */
export const responsiveStyles = <Value>(
	value: Responsive<Value> | undefined,
	toStyles: (value: Value) => CSSObject,
): CSSObject => {
	if (value === undefined) return {};
	if (!isPerBreakpoint(value)) return toStyles(value);

	return breakpointNames.reduce<CSSObject>(
		(styles: CSSObject, breakpoint: Breakpoint): CSSObject => {
			const breakpointValue: Value | undefined = value[breakpoint];
			if (breakpointValue === undefined) return styles;

			return breakpoint === 'compact'
				? { ...styles, ...toStyles(breakpointValue) }
				: { ...styles, [`@media ${breakpointMediaQuery(breakpoint)}`]: toStyles(breakpointValue) };
		},
		{},
	);
};
