import { describe, expect, it } from 'vitest';

import { syntaxColors, syntaxRules } from '#src/code/syntax-theme.ts';
import type { SyntaxRule } from '#src/code/syntax-theme.ts';
import { auditContrast, cssVariableReference, tokens } from '#src/tokens/index.ts';
import type { ContrastResult } from '#src/tokens/index.ts';

const codeBackgrounds: readonly string[] = ['surface.field', 'state.selected'];

describe('syntax theme', (): void => {
	it('draws every rule with a color of the syntax', (): void => {
		const colors: string[] = Object.values(syntaxColors);

		syntaxRules.forEach((rule: SyntaxRule): void => {
			if (rule.settings.foreground !== undefined) {
				expect(colors).toContain(rule.settings.foreground);
			}
		});
	});

	it('has each color audited for 4.5:1 on the code block and on a highlighted line', (): void => {
		const results: ContrastResult[] = auditContrast(tokens);

		Object.values(syntaxColors).forEach((color: string): void => {
			codeBackgrounds.forEach((background: string): void => {
				const result: ContrastResult | undefined = results.find((candidate: ContrastResult) => {
					return (
						cssVariableReference(candidate.foreground.split('.')) === color &&
						candidate.background === background
					);
				});

				expect(result, `${color} on ${background}`).toBeDefined();
				expect(result?.requirement).toBe('text');
				expect(result?.passes, result?.message).toBe(true);
			});
		});
	});
});
