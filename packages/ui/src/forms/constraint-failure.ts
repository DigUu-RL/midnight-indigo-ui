// The native constraint that a control fails, first one first, so that each has its own translatable message.

/** A failed native constraint; `invalid` covers the rest (e.g. a custom validity). */
export type ConstraintFailure =
	| 'valueMissing'
	| 'badValue'
	| 'tooShort'
	| 'tooLong'
	| 'rangeUnderflow'
	| 'rangeOverflow'
	| 'stepMismatch'
	| 'invalid';

export const constraintFailure = (validity: ValidityState): ConstraintFailure => {
	if (validity.valueMissing) return 'valueMissing';
	if (validity.typeMismatch || validity.patternMismatch || validity.badInput) return 'badValue';
	if (validity.tooShort) return 'tooShort';
	if (validity.tooLong) return 'tooLong';
	if (validity.rangeUnderflow) return 'rangeUnderflow';
	if (validity.rangeOverflow) return 'rangeOverflow';
	if (validity.stepMismatch) return 'stepMismatch';
	return 'invalid';
};
