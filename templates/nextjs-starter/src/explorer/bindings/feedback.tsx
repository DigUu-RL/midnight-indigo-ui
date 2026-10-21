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

import type { SubpathBindings } from '#src/explorer/bindings.ts';
import { DockingBayNotice } from '#src/explorer/examples/alert/maintenance.tsx';
import { FlightPlanSaved } from '#src/explorer/examples/alert/saved.tsx';
import { DeleteLogEntry } from '#src/explorer/examples/confirm-dialog/destructive.tsx';
import { CollectBounty } from '#src/explorer/examples/confirm-dialog/pending.tsx';
import { MissionLogs } from '#src/explorer/examples/context-menu/logs.tsx';
import { BountyPoster } from '#src/explorer/examples/context-menu/visible-actions.tsx';
import { CrewManifest } from '#src/explorer/examples/dialog/details.tsx';
import { RenameShip } from '#src/explorer/examples/dialog/form.tsx';
import { CrewDetails } from '#src/explorer/examples/drawer/details.tsx';
import { ShipyardFilters } from '#src/explorer/examples/drawer/filters.tsx';
import { CrewActions } from '#src/explorer/examples/menu/actions.tsx';
import { LogbookEditMenu } from '#src/explorer/examples/menu/shortcuts.tsx';
import { KesselRunRecord } from '#src/explorer/examples/popover/details.tsx';
import { BountyFilters } from '#src/explorer/examples/popover/filters.tsx';
import { SignalScan } from '#src/explorer/examples/progress-bar/indeterminate.tsx';
import { BountyReportUpload } from '#src/explorer/examples/progress-bar/upload.tsx';
import { CrewRemoval } from '#src/explorer/examples/toast-provider/undo.tsx';
import { LogbookTransmission } from '#src/explorer/examples/toast-provider/updates.tsx';
import { PlayerShortcuts } from '#src/explorer/examples/tooltip/shortcuts.tsx';
import { ShipNames } from '#src/explorer/examples/tooltip/truncated.tsx';
import { FeedbackPlayground } from '#src/explorer/playgrounds/feedback.tsx';
import { feedbackSamples } from '#src/explorer/samples/feedback.tsx';

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
