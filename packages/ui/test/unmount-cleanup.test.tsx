// @vitest-environment jsdom
// Every component that holds something outside its own elements (listeners on the document or the window, media
// queries, observers, intervals, the chart engine) gives it back when it unmounts, also while it is open, focused or
// waiting. A page that mounts and unmounts them again and again (routes, tabs, dialogs) would otherwise accumulate
// work on every event and keep detached elements alive.
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, expect, it } from 'vitest';

import { trackResources } from '#test/resource-tracker.ts';
import type { ResourceTracker } from '#test/resource-tracker.ts';
import { countMediaQueryListeners, resetViewport, setViewportWidth } from '#test/viewport.ts';
import { Button } from '#src/buttons/button/index.tsx';
import { Chart } from '#src/charts/chart/index.tsx';
import { createLineChart } from '#src/charts/chart-factories/index.ts';
import type { LineChartDefinition } from '#src/charts/chart-factories/index.ts';
import { DashboardLayout } from '#src/dashboard/dashboard-layout/index.tsx';
import type { DashboardNavigation } from '#src/dashboard/dashboard-layout/index.tsx';
import { Carousel } from '#src/data-display/carousel/index.tsx';
import { DataTable } from '#src/data-display/data-table/index.tsx';
import type { DataTableColumn } from '#src/data-display/data-table/index.tsx';
import { Dialog } from '#src/feedback/dialog/index.tsx';
import { Drawer } from '#src/feedback/drawer/index.tsx';
import { Menu } from '#src/feedback/menu/index.tsx';
import { Popover } from '#src/feedback/popover/index.tsx';
import { ToastProvider, useToast } from '#src/feedback/toast/index.tsx';
import { Tooltip } from '#src/feedback/tooltip/index.tsx';
import { Combobox } from '#src/forms/combobox/index.tsx';
import type { ComboboxOption } from '#src/forms/combobox/index.tsx';
import { Form } from '#src/forms/form/index.tsx';
import { TextField } from '#src/forms/text-field/index.tsx';
import { TableOfContents } from '#src/navigation/table-of-contents/index.tsx';
import { UiProvider } from '#src/theme/ui-provider.tsx';

interface Sale {
	month: string;
	revenue: number;
}

const sales: Sale[] = [
	{ month: 'Jan', revenue: 120 },
	{ month: 'Feb', revenue: 150 },
	{ month: 'Mar', revenue: 90 },
];

const salesChart: LineChartDefinition<Sale> = createLineChart({
	data: sales,
	x: 'month',
	series: [{ key: 'revenue', label: 'Revenue' }],
	interaction: { zoom: true },
});

const columns: DataTableColumn<Sale>[] = [
	{ id: 'month', header: 'Month', rowHeader: true, cell: (sale: Sale): string => sale.month },
	{ id: 'revenue', header: 'Revenue', cell: (sale: Sale): string => String(sale.revenue) },
];

const cities: readonly ComboboxOption[] = [
	{ value: 'rec', label: 'Recife' },
	{ value: 'rio', label: 'Rio de Janeiro' },
];

const navigation: DashboardNavigation = {
	label: 'Main navigation',
	items: [{ id: 'overview', label: 'Overview', icon: <svg />, href: '/', current: true }],
};

// A toast with a timer, shown as soon as the provider is there.
const ToastOnMount = (): null => {
	const { show } = useToast();

	useEffect((): void => {
		show({ message: 'Report exported.', duration: 60_000 });
	}, [show]);

	return null;
};

interface PageProps {
	/** Opens the dialog and the drawer, which hide the rest of the page while they are open. */
	overlaysOpen: boolean;
}

const Page = ({ overlaysOpen }: PageProps): ReactElement => {
	return (
		<UiProvider>
			<ToastProvider>
				<ToastOnMount />

				<DashboardLayout navigation={navigation} brand={<a href='/'>Acme</a>}>
					<TableOfContents items={[{ id: 'sales', label: 'Sales' }]} />

					<Form>
						<TextField label='Name' name='name' />
						<Combobox label='City' name='city' options={cities} />
					</Form>

					<DataTable
						caption='Sales'
						columns={columns}
						rows={sales}
						getRowId={(sale: Sale): string => sale.month}
					/>

					<Chart chart={salesChart} title='Drawn sales' renderer='svg' />
					<Chart chart={salesChart} title='Sales below the fold' lazy />

					<Carousel label='Highlights'>
						<p>Revenue</p>
						<p>Users</p>
					</Carousel>

					<Tooltip content='Ctrl+S'>
						<Button>Save</Button>
					</Tooltip>

					<Menu
						trigger={<Button>Row actions</Button>}
						items={[{ id: 'rename', label: 'Rename', onSelect: (): void => undefined }]}
					/>

					<Popover title='Filters' trigger={<Button>Filters</Button>}>
						<p>Owner</p>
					</Popover>

					<Dialog open={overlaysOpen} title='Rename' onClose={(): void => undefined}>
						<p>New name</p>
					</Dialog>

					<Drawer open={overlaysOpen} title='Order #1042' onClose={(): void => undefined}>
						<p>Placed today.</p>
					</Drawer>
				</DashboardLayout>
			</ToastProvider>
		</UiProvider>
	);
};

let tracker: ResourceTracker | undefined;

beforeEach((): void => {
	setViewportWidth(1280);
});

afterEach((): void => {
	cleanup();
	tracker?.restore();
	tracker = undefined;
	resetViewport();
});

// jsdom runs the animation frames on an interval, which it clears once no frame is requested.
const waitForFrames = async (): Promise<void> => {
	await new Promise<void>((resolve: () => void): void => {
		setTimeout(resolve, 100);
	});
};

// It mounts, opens and draws dozens of components: slower than a unit test, above all beside the parallel suite.
it('releases listeners, media queries, observers, intervals and the chart engine on unmount', async (): Promise<void> => {
	// React listens to the events of the document once, at its first root there, for good: not a resource of a component.
	render(<p>Warm-up</p>).unmount();
	const user: UserEvent = userEvent.setup();
	tracker = trackResources();
	const before: string[] = tracker.held();
	const { container, rerender, unmount }: RenderResult = render(<Page overlaysOpen={false} />);

	await waitFor((): void => {
		expect(container.querySelector('[role="figure"] svg')).not.toBeNull();
	});

	// The toast and the live region that announces it.
	await screen.findAllByText('Report exported.');
	await user.type(screen.getByRole('combobox', { name: 'City' }), 'r');
	await screen.findByRole('listbox');
	await user.hover(screen.getByRole('button', { name: 'Save' }));
	await screen.findByRole('tooltip');
	await user.click(screen.getByRole('button', { name: 'Filters' }));
	await user.click(screen.getByRole('button', { name: 'Row actions', hidden: true }));
	await screen.findByRole('menu');
	rerender(<Page overlaysOpen />);
	// The drawer opened last, over the dialog.
	await screen.findByRole('dialog', { name: 'Order #1042' });
	expect(screen.getByRole('dialog', { name: 'Rename', hidden: true })).toBeDefined();
	const held: string[] = tracker.held();

	// The interactions really took hold of something, or there would be nothing to release.
	expect(held.length).toBeGreaterThan(before.length);
	expect(held).toContain('ResizeObserver');
	expect(held).toContain('IntersectionObserver');
	expect(held).toContain('document scroll (capture)');
	expect(countMediaQueryListeners()).toBeGreaterThan(0);

	// A frame requested before the unmount still runs once; an animation that keeps requesting frames would not stop.
	unmount();
	await waitForFrames();

	expect(tracker.held()).toEqual(before);
	expect(countMediaQueryListeners()).toBe(0);
}, 30_000);
