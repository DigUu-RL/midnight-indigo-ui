'use client';
// On/off setting that applies at once, e.g. notifications on.
import type { ReactElement } from 'react';

import { ChoiceField } from '#src/forms/checkbox/index.tsx';
import type { CheckboxProps } from '#src/forms/checkbox/index.tsx';

export type SwitchProps = Omit<CheckboxProps, 'indeterminate'>;

/**
 * Native checkbox with `role="switch"`, announced as on or off; Space toggles it and it is submitted like a
 * checkbox. Use it for settings that take effect immediately; in a form submitted later, prefer a `Checkbox`.
 */
export const Switch = (props: SwitchProps): ReactElement => {
	return <ChoiceField {...props} kind='switch' />;
};
