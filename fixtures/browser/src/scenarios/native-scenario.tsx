// What the browser draws by itself, styled by the baseline of `UiProvider`: the page scrollbar (the page is taller than
// the viewport), a container scrolling with `scrollbarStyles`, native controls, the placeholder, a card form that
// Chromium can autofill from a test (native fields and a `TextField`), and the native text elements.
import { TextField } from '@midnight-indigo/ui/forms';
import { scrollbarStyles, themeVariables } from '@midnight-indigo/ui/theme';
import { styled } from '@mui/material/styles';
import type { ReactElement, SubmitEvent } from 'react';

const { spacing, border, radius, surface }: typeof themeVariables = themeVariables;

const Panel = styled('section')({
	display: 'grid',
	gap: spacing[3],
	marginBlockEnd: spacing[6],
	padding: spacing[4],
	border: `1px solid ${border.subtle}`,
	borderRadius: radius.card,
	backgroundColor: surface.raised,
});

// Scrolls both ways, so both scrollbars and their corner are drawn.
const ScrollingContainer = styled('div')({
	...scrollbarStyles,
	width: '20rem',
	height: '8rem',
	overflow: 'auto',
	border: `1px solid ${border.default}`,
	backgroundColor: surface.field,
});

const WideContent = styled('p')({ width: '40rem', margin: 0, padding: spacing[3] });

const Controls = styled('div')({
	display: 'flex',
	flexWrap: 'wrap',
	gap: spacing[4],
	alignItems: 'center',
});

// Keeps the page taller than the viewport, so the browser draws the page scrollbar.
const PageFiller = styled('div')({ height: '150vh' });

const lines: string[] = Array.from({ length: 12 }, (_: unknown, index: number): string => {
	return `Line ${String(index + 1)} of a container that scrolls inside the page.`;
});

const preventSubmission = (event: SubmitEvent<HTMLFormElement>): void => {
	event.preventDefault();
};

export const NativeScenario = (): ReactElement => {
	return (
		<>
			<Panel aria-labelledby='scrolling-title' data-testid='scrolling'>
				<h2 id='scrolling-title'>Scrolling container</h2>

				<ScrollingContainer tabIndex={0} role='region' aria-label='Scrolling content'>
					{lines.map((line: string): ReactElement => {
						return <WideContent key={line}>{line}</WideContent>;
					})}
				</ScrollingContainer>
			</Panel>

			<Panel aria-labelledby='controls-title' data-testid='controls'>
				<h2 id='controls-title'>Native controls</h2>

				<form autoComplete='on' onSubmit={preventSubmission}>
					<Controls>
						<label>
							Email{' '}
							<input
								type='email'
								name='email'
								autoComplete='email'
								placeholder='samus.aran@example.com'
							/>
						</label>

						<label>
							Date <input type='date' defaultValue='2026-10-15' />
						</label>

						<label>
							Time <input type='time' defaultValue='09:30' />
						</label>

						<label>
							Country{' '}
							<select defaultValue='br'>
								<option value='br'>Brazil</option>
								<option value='pt'>Portugal</option>
							</select>
						</label>

						<label>
							<input type='checkbox' defaultChecked /> Subscribed
						</label>

						<label>
							<input type='radio' name='plan' defaultChecked /> Monthly
						</label>

						<label>
							Volume <input type='range' defaultValue='60' />
						</label>

						<label>
							Accent <input type='color' defaultValue='#5e48d6' />
						</label>

						<button type='submit'>Save</button>
					</Controls>
				</form>
			</Panel>

			<Panel aria-labelledby='card-title' data-testid='card'>
				<h2 id='card-title'>Payment card</h2>

				<form autoComplete='on' onSubmit={preventSubmission}>
					<Controls>
						<label>
							Card number <input name='card-number' autoComplete='cc-number' />
						</label>

						<TextField label='Name on card' name='card-name' autoComplete='cc-name' />

						<label>
							Expiry <input name='card-expiry' autoComplete='cc-exp' />
						</label>

						<label>
							Security code <input name='card-code' autoComplete='cc-csc' />
						</label>
					</Controls>
				</form>
			</Panel>

			<Panel aria-labelledby='text-title' data-testid='text'>
				<h2 id='text-title'>Text elements</h2>

				<p>
					Read the <a href='#text-title'>documentation</a>, press <kbd>Ctrl</kbd> + <kbd>K</kbd>,
					run <code>pnpm check</code> and look for <mark>highlighted</mark> words in the{' '}
					<abbr title='Frequently asked questions'>FAQ</abbr>.
				</p>

				<hr />
				<blockquote>A quotation set apart from the text around it.</blockquote>
			</Panel>

			<PageFiller aria-hidden='true' />
		</>
	);
};
