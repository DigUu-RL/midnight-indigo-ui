'use client';
import { Avatar } from '@midnight-indigo/ui/data-display';
import { FileUpload } from '@midnight-indigo/ui/forms';
import { Stack } from '@midnight-indigo/ui/layout';
import { useState } from 'react';
import type { ReactElement } from 'react';

// One image, controlled by the parent, which shows it as the avatar as soon as it is chosen; without a drop zone, the
// field is the button alone.
export const HunterPortrait = (): ReactElement => {
	const [files, setFiles] = useState<File[]>([]);
	const [preview, setPreview] = useState<string | undefined>(undefined);

	const choose = (chosen: File[]): void => {
		// The address of the previous image is released with it.
		if (preview !== undefined) URL.revokeObjectURL(preview);
		const [portrait] = chosen;
		setFiles(chosen);
		setPreview(portrait === undefined ? undefined : URL.createObjectURL(portrait));
	};

	return (
		<Stack direction='row' gap='4' align='center' wrap style={{ width: '100%', maxWidth: '32rem' }}>
			<Avatar
				name='Faye Valentine'
				size='large'
				{...(preview === undefined ? {} : { src: preview })}
			/>

			<FileUpload
				label='Portrait'
				name='portrait'
				accept='image/png,image/jpeg'
				maxSize={1024 * 1024}
				dropzone={false}
				value={files}
				onFilesChange={choose}
			/>
		</Stack>
	);
};
