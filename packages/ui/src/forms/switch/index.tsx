'use client';
// On/off setting that applies at once, e.g. notifications on.
import type { ReactElement } from 'react';

import { ChoiceField } from '@/src/forms/checkbox/index';
import type { ChoiceControlBaseProps } from '@/src/forms/checkbox/index';

// The shared props, not an `Omit` of `CheckboxProps`, whose mapped type would lose the order of the props.
export type SwitchProps = ChoiceControlBaseProps;

/**
 * Native checkbox with `role="switch"`, announced as on or off; Space toggles it and it is submitted like a
 * checkbox. Use it for settings that take effect immediately; in a form submitted later, prefer a `Checkbox`.
 */
export const Switch = (props: SwitchProps): ReactElement => {
	return <ChoiceField {...props} kind='switch' />;
};
