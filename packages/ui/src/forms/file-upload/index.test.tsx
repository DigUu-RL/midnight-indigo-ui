// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FileUpload, matchesAccept } from '@/src/forms/file-upload/index';
import { expectNoAxeViolations } from '@/test/component-harness';

const fileOf = (name: string, type: string, size: number = 10): File => {
	return new File(['x'.repeat(size)], name, { type });
};

afterEach((): void => {
	cleanup();
});

describe('FileUpload', (): void => {
	it('is a native file input reached with Tab, stating its limits', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();

		const { container } = render(
			<FileUpload label='Attachments' accept='.pdf,image/*' maxSize={2048} maxFiles={2} multiple />,
		);

		await user.tab();
		const input: HTMLElement = screen.getByLabelText('Attachments');

		expect(document.activeElement).toBe(input);
		expect(input.getAttribute('type')).toBe('file');

		const limits: string = (input.getAttribute('aria-describedby') ?? '')
			.split(' ')
			.map((id: string): string => document.getElementById(id)?.textContent ?? '')
			.join(' ');

		expect(limits).toBe('Accepted types: .pdf, image/*. Up to 2 KB each. Up to 2 files.');
		await expectNoAxeViolations(container);
	});

	it('lists the chosen files with named remove buttons, without drag and drop', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleFiles = vi.fn();
		render(<FileUpload label='Attachments' multiple onFilesChange={handleFiles} />);
		const input: HTMLInputElement = screen.getByLabelText('Attachments');

		await user.upload(input, [
			fileOf('report.pdf', 'application/pdf'),
			fileOf('chart.png', 'image/png'),
		]);

		expect(screen.getByRole('list', { name: 'Chosen files' }).children).toHaveLength(2);

		await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));
		expect(handleFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'chart.png' })]);
		expect(document.activeElement).toBe(input);
	});

	it('leaves out files beyond the limits and says why, in a status message', async (): Promise<void> => {
		const user: UserEvent = userEvent.setup();
		const handleReject = vi.fn();

		render(
			<FileUpload
				label='Photos'
				accept='image/*'
				maxSize={50}
				onReject={handleReject}
				multiple
				// user-event honors `accept`; the drop zone below does not filter, so both paths are covered.
			/>,
		);

		await user.upload(screen.getByLabelText('Photos'), [fileOf('large.png', 'image/png', 100)]);

		expect(screen.getByRole('status').textContent).toBe(
			'large.png was not added: it is larger than 50 B.',
		);

		expect(handleReject).toHaveBeenCalledWith([expect.objectContaining({ reason: 'size' })]);
	});

	it('also takes files dropped on its zone, with the same rules', (): void => {
		const handleFiles = vi.fn();

		const { container } = render(
			<FileUpload label='Contract' accept='.pdf' onFilesChange={handleFiles} />,
		);

		const zone: Element | null =
			container.querySelector('input[type="file"]')?.parentElement ?? null;

		fireEvent.drop(zone ?? document.body, {
			dataTransfer: {
				files: [fileOf('contract.pdf', 'application/pdf'), fileOf('photo.png', 'image/png')],
			},
		});

		expect(handleFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'contract.pdf' })]);

		expect(screen.getByRole('status').textContent).toContain(
			'photo.png was not added: this type is not accepted.',
		);
	});

	it('takes no drop while disabled, and keeps stating its limits without inviting one', async (): Promise<void> => {
		const handleFiles = vi.fn();

		const { container } = render(
			<FileUpload label='Contract' accept='.pdf' disabled onFilesChange={handleFiles} />,
		);

		const zone: Element | null =
			container.querySelector('input[type="file"]')?.parentElement ?? null;

		fireEvent.drop(zone ?? document.body, {
			dataTransfer: { files: [fileOf('contract.pdf', 'application/pdf')] },
		});

		expect(handleFiles).not.toHaveBeenCalled();
		expect(container.textContent).not.toContain('or drop them here');
		expect(container.textContent).toContain('Accepted types: .pdf.');
		await expectNoAxeViolations(container);
	});

	it('matches extensions and media types like the native accept', (): void => {
		expect(matchesAccept(fileOf('a.PDF', ''), '.pdf')).toBe(true);
		expect(matchesAccept(fileOf('a.png', 'image/png'), 'image/*')).toBe(true);
		expect(matchesAccept(fileOf('a.txt', 'text/plain'), 'image/*,.pdf')).toBe(false);
	});
});
