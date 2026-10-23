// The components of `@midnight-indigo/ui/feedback` in the explorer: see `explorer/bindings.ts`.
import {
	Alert,
	ConfirmDialog,
	ContextMenu,
	Dialog,
	Drawer,
	Menu,
	Popover,
	ProgressBar,
	ToastProvider,
	Tooltip,
} from '@midnight-indigo/ui/feedback';

import type { SubpathBindings } from '@/src/explorer/bindings';
import { DockingBayNotice } from '@/src/explorer/examples/alert/maintenance';
import { FlightPlanSaved } from '@/src/explorer/examples/alert/saved';
import { DeleteLogEntry } from '@/src/explorer/examples/confirm-dialog/destructive';
import { CollectBounty } from '@/src/explorer/examples/confirm-dialog/pending';
import { MissionLogs } from '@/src/explorer/examples/context-menu/logs';
import { BountyPoster } from '@/src/explorer/examples/context-menu/visible-actions';
import { CrewManifest } from '@/src/explorer/examples/dialog/details';
import { RenameShip } from '@/src/explorer/examples/dialog/form';
import { CrewDetails } from '@/src/explorer/examples/drawer/details';
import { ShipyardFilters } from '@/src/explorer/examples/drawer/filters';
import { CrewActions } from '@/src/explorer/examples/menu/actions';
import { LogbookEditMenu } from '@/src/explorer/examples/menu/shortcuts';
import { KesselRunRecord } from '@/src/explorer/examples/popover/details';
import { BountyFilters } from '@/src/explorer/examples/popover/filters';
import { SignalScan } from '@/src/explorer/examples/progress-bar/indeterminate';
import { BountyReportUpload } from '@/src/explorer/examples/progress-bar/upload';
import { CrewRemoval } from '@/src/explorer/examples/toast-provider/undo';
import { LogbookTransmission } from '@/src/explorer/examples/toast-provider/updates';
import { PlayerShortcuts } from '@/src/explorer/examples/tooltip/shortcuts';
import { ShipNames } from '@/src/explorer/examples/tooltip/truncated';
import { FeedbackPlayground } from '@/src/explorer/playgrounds/feedback';
import { feedbackSamples } from '@/src/explorer/samples/feedback';

export const feedbackBindings: SubpathBindings<'feedback'> = {
	playground: FeedbackPlayground,
	samples: feedbackSamples,
	components: {
		Alert: {
			component: Alert,
			examples: { saved: FlightPlanSaved, maintenance: DockingBayNotice },
		},
		ProgressBar: {
			component: ProgressBar,
			examples: { upload: BountyReportUpload, indeterminate: SignalScan },
		},
		Tooltip: { component: Tooltip, examples: { shortcuts: PlayerShortcuts, truncated: ShipNames } },
		Popover: { component: Popover, examples: { filters: BountyFilters, details: KesselRunRecord } },
		Menu: { component: Menu, examples: { actions: CrewActions, shortcuts: LogbookEditMenu } },
		ContextMenu: {
			component: ContextMenu,
			examples: { logs: MissionLogs, visibleActions: BountyPoster },
		},
		Dialog: { component: Dialog, examples: { form: RenameShip, details: CrewManifest } },
		ConfirmDialog: {
			component: ConfirmDialog,
			examples: { destructive: DeleteLogEntry, pending: CollectBounty },
		},
		Drawer: { component: Drawer, examples: { details: CrewDetails, filters: ShipyardFilters } },
		ToastProvider: {
			component: ToastProvider,
			examples: { undo: CrewRemoval, updates: LogbookTransmission },
		},
	},
};
