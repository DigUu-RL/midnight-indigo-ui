'use client';
// Feedback and overlays: alerts in the page, a toast after an action, and every overlay opened from a button.
import { Button, IconButton } from '@midnight-indigo/ui/buttons';
import { Card, CardContent, CardHeader } from '@midnight-indigo/ui/data-display';
import {
	Alert,
	ConfirmDialog,
	ContextMenu,
	Dialog,
	Drawer,
	Menu,
	Popover,
	Tooltip,
	useToast,
} from '@midnight-indigo/ui/feedback';
import type { ToastApi } from '@midnight-indigo/ui/feedback';
import { TextField } from '@midnight-indigo/ui/forms';
import { Icon } from '@midnight-indigo/ui';
import { useState } from 'react';
import type { ReactElement } from 'react';

const copyIcon: ReactElement = (
	<Icon decorative>
		<path d='M8 8h11v11H8zM5 5h11v2H7v9H5z' />
	</Icon>
);

type OpenOverlay = 'dialog' | 'confirm' | 'drawer' | null;

export const OverlaysShowcase = (): ReactElement => {
	const toast: ToastApi = useToast();
	const [openOverlay, setOpenOverlay] = useState<OpenOverlay>(null);

	const close = (): void => {
		setOpenOverlay(null);
	};

	return (
		<Card as='section'>
			<CardHeader
				title='Feedback and overlays'
				subtitle='Alerts, toasts, dialogs, a drawer, a popover, menus and a tooltip.'
				headingLevel={2}
			/>

			<CardContent>
				<div className='stack'>
					<Alert intent='warning' title='Two invoices are overdue'>
						Pay them before Friday to keep the workspace active.
					</Alert>

					<Alert intent='success' variant='outline'>
						Your profile is complete.
					</Alert>

					<div className='row'>
						<Button
							intent='official'
							variant='solid'
							onClick={(): void => {
								toast.show({ intent: 'success', title: 'Saved', message: 'The report was saved.' });
							}}
						>
							Save report
						</Button>

						<Button
							onClick={(): void => {
								toast.show({
									intent: 'error',
									title: 'Sync failed',
									message: 'Check your connection.',
									action: { label: 'Retry', onAction: (): void => undefined },
								});
							}}
						>
							Simulate an error
						</Button>

						<Button
							onClick={(): void => {
								setOpenOverlay('dialog');
							}}
						>
							Rename report
						</Button>

						<Button
							intent='error'
							variant='outline'
							onClick={(): void => {
								setOpenOverlay('confirm');
							}}
						>
							Delete report
						</Button>

						<Button
							onClick={(): void => {
								setOpenOverlay('drawer');
							}}
						>
							Show details
						</Button>

						<Popover title='Filters' trigger={<Button>Filters</Button>}>
							<TextField label='Owner' name='owner' />
						</Popover>

						<Menu
							trigger={<Button>More actions</Button>}
							items={[
								{ id: 'duplicate', label: 'Duplicate', shortcut: 'Control+D' },
								{ id: 'archive', label: 'Archive' },
								{ id: 'separator', separator: true },
								{
									id: 'delete',
									label: 'Delete',
									destructive: true,
									onSelect: (): void => {
										setOpenOverlay('confirm');
									},
								},
							]}
						/>

						<Tooltip content='Copies the link to the clipboard'>
							<IconButton label='Copy link'>{copyIcon}</IconButton>
						</Tooltip>
					</div>

					<ContextMenu
						label='Actions for Q3 report'
						items={[
							{ id: 'open', label: 'Open' },
							{ id: 'share', label: 'Share' },
						]}
					>
						<div className='panel' tabIndex={0}>
							Q3 report — right click, or focus and press Shift+F10
						</div>
					</ContextMenu>
				</div>
			</CardContent>

			<Dialog
				open={openOverlay === 'dialog'}
				title='Rename report'
				description='The new name is visible to everyone in the workspace.'
				onClose={close}
				actions={
					<>
						<Button variant='outline' onClick={close}>
							Cancel
						</Button>

						<Button intent='official' variant='solid' onClick={close}>
							Rename
						</Button>
					</>
				}
			>
				<TextField label='Name' name='name' defaultValue='Q3 report' />
			</Dialog>

			<ConfirmDialog
				open={openOverlay === 'confirm'}
				intent='error'
				title='Delete this report?'
				description='It will be removed for everyone. This cannot be undone.'
				labels={{ confirm: 'Delete report', cancel: 'Keep report' }}
				onConfirm={(): void => {
					close();
					toast.show({ message: 'The report was deleted.' });
				}}
				onCancel={close}
			/>

			<Drawer
				open={openOverlay === 'drawer'}
				title='Q3 report'
				description='Created by Ana Souza on 2 October.'
				onClose={close}
			>
				<p>Revenue, churn and new teams of the third quarter.</p>
			</Drawer>
		</Card>
	);
};
