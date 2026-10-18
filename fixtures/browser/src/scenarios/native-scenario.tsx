// What the browser draws by itself, styled by the baseline of `UiProvider`: the page scrollbar (the page is taller than
// the viewport), a container scrolling with `scrollbarStyles`, native controls and their states, the placeholder, the
// structural elements (table, lists, `pre`, `details`, `fieldset`, a modal `dialog`), a card form that Chromium can
// autofill from a test (native fields and a `TextField`), the native text elements, and a catalog of every other form
// control, field state and content element, so that every element the browser can draw is on the page.
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

// The picture of an image button, inline so that the scenario loads nothing.
const launchImage: string = `data:image/svg+xml,${encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#5e48d6"/></svg>',
)}`;

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

			<Panel aria-labelledby='catalog-title' data-testid='catalog'>
				<h2 id='catalog-title'>Every form control</h2>

				<form onSubmit={preventSubmission}>
					<Controls>
						<label>
							Callsign <input type='text' defaultValue='Hunter' />
						</label>

						<label>
							Passcode <input type='password' defaultValue='metroid' />
						</label>

						<label>
							Search <input type='search' defaultValue='Varia Suit' />
						</label>

						<label>
							Phone <input type='tel' defaultValue='+55 11 5555-0100' />
						</label>

						<label>
							Website <input type='url' defaultValue='https://example.com' />
						</label>

						<label>
							Planet <input type='text' list='planet-options' defaultValue='Zebes' />
						</label>

						<datalist id='planet-options'>
							<option value='Zebes' />
							<option value='SR388' />
							<option value='Tallon IV' />
						</datalist>

						<label>
							Departure <input type='datetime-local' defaultValue='2026-10-15T09:30' />
						</label>

						<label>
							Month <input type='month' defaultValue='2026-10' />
						</label>

						<label>
							Week <input type='week' defaultValue='2026-W42' />
						</label>

						<label>
							Mission log <textarea rows={3} defaultValue='Landed on Zebes.' />
						</label>

						<label>
							Crew{' '}
							<select multiple defaultValue={['spike']}>
								<optgroup label='Bebop'>
									<option value='spike'>Spike Spiegel</option>
									<option value='faye'>Faye Valentine</option>
								</optgroup>

								<optgroup label='Rebellion'>
									<option value='leia'>Leia Organa</option>
								</optgroup>
							</select>
						</label>

						<label>
							Sector{' '}
							<select size={3} defaultValue='alpha'>
								<option value='alpha'>Alpha</option>
								<option value='beta'>Beta</option>
								<option value='gamma'>Gamma</option>
							</select>
						</label>

						<label>
							Total <output>42</output>
						</label>

						<button type='reset'>Reset</button>
						<button type='button'>Preview</button>
						<input type='submit' value='Send' />
						<input type='reset' value='Clear' />
						<input type='button' value='Ping' />
						<input type='image' alt='Launch' src={launchImage} width={24} height={24} />
						<input type='hidden' name='mission' value='zebes' />
					</Controls>
				</form>
			</Panel>

			<Panel aria-labelledby='field-states-title' data-testid='field-states'>
				<h2 id='field-states-title'>Field states</h2>

				<Controls>
					<label>
						Empty <input type='text' placeholder='Spike Spiegel' />
					</label>

					<label>
						Hovered <input type='text' defaultValue='Faye Valentine' />
					</label>

					<label>
						Focused <input type='text' defaultValue='Jet Black' />
					</label>

					<label>
						Read only <input type='text' readOnly defaultValue='Edward Wong' />
					</label>

					<label>
						Disabled <input type='text' disabled defaultValue='Ein' />
					</label>

					<label>
						Invalid <input type='email' required defaultValue='not an email' />
					</label>

					<label>
						Disabled date <input type='date' disabled defaultValue='2026-10-15' />
					</label>

					<label>
						Disabled volume <input type='range' disabled defaultValue='30' />
					</label>

					<label>
						Disabled attachment <input type='file' disabled />
					</label>

					<label>
						Disabled notes <textarea rows={2} disabled defaultValue='Archived.' />
					</label>

					<button type='button' disabled>
						Unavailable
					</button>
				</Controls>
			</Panel>

			<Panel aria-labelledby='content-title' data-testid='content'>
				<h2 id='content-title'>Content elements</h2>
				<h1>Heading of level 1</h1>
				<h3>Heading of level 3</h3>
				<h4>Heading of level 4</h4>
				<h5>Heading of level 5</h5>
				<h6>Heading of level 6</h6>

				<p>
					<strong>Strong</strong>, <b>bold</b>, <em>emphasis</em>, <i>idiomatic</i>,{' '}
					<u>annotated</u>, <s>no longer accurate</s>, <del>deleted</del>, <ins>inserted</ins>,{' '}
					<small>small print</small>, H<sub>2</sub>O, E = mc<sup>2</sup>, <q>a short quote</q>,{' '}
					<cite>Metroid Prime</cite>, <dfn>definition</dfn>, <var>bounty</var>,{' '}
					<samp>Mission complete</samp> and <time dateTime='2026-10-15'>October 15</time>.
				</p>

				<figure>
					<blockquote>Every bounty has a story.</blockquote>
					<figcaption>Spike Spiegel</figcaption>
				</figure>

				<address>Bebop, Mars orbit</address>

				<menu>
					<li>Dock</li>
					<li>Refuel</li>
				</menu>

				<table>
					<caption>Bounties collected</caption>

					<thead>
						<tr>
							<th scope='col'>Hunter</th>
							<th scope='col'>Total</th>
						</tr>
					</thead>

					<tbody>
						<tr>
							<th scope='row'>Spike Spiegel</th>
							<td>12,000</td>
						</tr>

						<tr>
							<th scope='row'>Jet Black</th>
							<td>9,000</td>
						</tr>
					</tbody>

					<tfoot>
						<tr>
							<th scope='row'>Crew</th>
							<td>21,000</td>
						</tr>
					</tfoot>
				</table>
			</Panel>

			<PageFiller aria-hidden='true' />
		</>
	);
};
