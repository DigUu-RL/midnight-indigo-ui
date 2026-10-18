// What the browser draws by itself, styled by the baseline of `UiProvider`: the page scrollbar (the page is taller than
// the viewport), a container scrolling with `scrollbarStyles`, native controls and their states, the placeholder, the
// structural elements (table, lists, `pre`, `details`, `fieldset`, a modal `dialog`), a card form that Chromium can
// autofill from a test (native fields and a `TextField`), and the native text elements.
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

// Only a script can make a checkbox indeterminate.
const markIndeterminate = (checkbox: HTMLInputElement | null): void => {
	if (checkbox !== null) checkbox.indeterminate = true;
};

const openDialog = (): void => {
	document.querySelector<HTMLDialogElement>('#native-dialog')?.showModal();
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

						<label>
							Quantity <input type='number' defaultValue='3' />
						</label>

						<label>
							Attachment <input type='file' />
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

			<Panel aria-labelledby='states-title' data-testid='states'>
				<h2 id='states-title'>Control states</h2>

				<Controls>
					<label>
						<input type='checkbox' ref={markIndeterminate} /> Partially selected
					</label>

					<label>
						<input type='checkbox' /> Unchecked
					</label>

					<label>
						<input type='checkbox' defaultChecked disabled /> Locked
					</label>

					<label>
						<input type='radio' name='size' /> Small
					</label>

					<label>
						<input type='radio' name='size' defaultChecked disabled /> Large
					</label>

					<label>
						Disabled country{' '}
						<select disabled defaultValue='br'>
							<option value='br'>Brazil</option>
						</select>
					</label>

					<label>
						Upload <progress value={70} max={100} />
					</label>

					<label>
						Loading <progress />
					</label>

					<label>
						Disk <meter value={0.3} low={0.5} high={0.8} optimum={0} />
					</label>

					<label>
						Memory <meter value={0.65} low={0.5} high={0.8} optimum={0} />
					</label>

					<label>
						Battery <meter value={0.9} low={0.5} high={0.8} optimum={0} />
					</label>
				</Controls>
			</Panel>

			<Panel aria-labelledby='structure-title' data-testid='structure'>
				<h2 id='structure-title'>Structural elements</h2>

				<table>
					<caption>Bounty hunters</caption>

					<thead>
						<tr>
							<th scope='col'>Name</th>
							<th scope='col'>Ship</th>
							<th scope='col'>Bounty</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<td>Spike Spiegel</td>
							<td>Swordfish II</td>
							<td>12,000</td>
						</tr>

						<tr>
							<td>Faye Valentine</td>
							<td>Red Tail</td>
							<td>8,500</td>
						</tr>
					</tbody>
				</table>

				<ul>
					<li>Samus Aran</li>
					<li>Leia Organa</li>
				</ul>

				<ol>
					<li>Land on Zebes</li>
					<li>Find the Varia Suit</li>
				</ol>

				<dl>
					<dt>Ship</dt>
					<dd>Gunship</dd>
				</dl>

				<pre>
					<code>{'pnpm check\npnpm test:browser'}</code>
				</pre>

				<details>
					<summary>Closed section</summary>
					Hidden content.
				</details>

				<details open>
					<summary>Open section</summary>
					Content of an open section.
				</details>

				<fieldset>
					<legend>Notifications</legend>

					<label>
						<input type='checkbox' defaultChecked /> Email
					</label>
				</fieldset>

				<button type='button' onClick={openDialog}>
					Open dialog
				</button>

				<dialog id='native-dialog' aria-labelledby='dialog-title'>
					<h2 id='dialog-title'>Native dialog</h2>

					<form method='dialog'>
						<button type='submit'>Close</button>
					</form>
				</dialog>
			</Panel>

			<PageFiller aria-hidden='true' />
		</>
	);
};
