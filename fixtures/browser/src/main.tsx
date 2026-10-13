// Entry of the performance scenarios. The URL picks the scenario and its size, e.g. `/?scenario=data-table&size=10000`
// or `/?scenario=data-table&processing=server&size=10000000`. The page marks `scenario-start` before rendering and
// `scenario-ready` after the first paint, and sets `data-scenario-ready` on <html> for the tests to wait on.
import { createUiTheme, UiProvider } from '@midnight-indigo/ui/theme';
import { StrictMode, useEffect } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

import { ComboboxScenario, SelectScenario } from '#src/scenarios/choice-scenarios.tsx';
import { DataTableScenario } from '#src/scenarios/data-table-scenario.tsx';
import { ListScenario } from '#src/scenarios/list-scenario.tsx';

const parameters: URLSearchParams = new URLSearchParams(window.location.search);
const scenario: string = parameters.get('scenario') ?? 'data-table';
const size: number = Number(parameters.get('size') ?? '10000');

const processing: 'client' | 'server' =
	parameters.get('processing') === 'server' ? 'server' : 'client';

const scenarios: Record<string, () => ReactElement> = {
	'data-table': (): ReactElement => <DataTableScenario rowCount={size} processing={processing} />,
	combobox: (): ReactElement => <ComboboxScenario optionCount={size} />,
	select: (): ReactElement => <SelectScenario optionCount={size} />,
	list: (): ReactElement => <ListScenario itemCount={size} />,
};

const renderScenario: () => ReactElement =
	scenarios[scenario] ??
	((): ReactElement => {
		throw new Error(`Unknown scenario: ${scenario}.`);
	});

// The callback of the frame after the commit runs before that frame paints; the task it schedules runs after.
const ReadySignal = (): null => {
	useEffect((): void => {
		requestAnimationFrame((): void => {
			setTimeout((): void => {
				performance.mark('scenario-ready');
				performance.measure('scenario-render', 'scenario-start', 'scenario-ready');
				document.documentElement.dataset.scenarioReady = 'true';
			});
		});
	}, []);

	return null;
};

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement === null) throw new Error('The page has no #root element.');

performance.mark('scenario-start');

createRoot(rootElement).render(
	<StrictMode>
		<UiProvider theme={createUiTheme()}>
			<main style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem' }}>
				{renderScenario()}
				<ReadySignal />
			</main>
		</UiProvider>
	</StrictMode>,
);
