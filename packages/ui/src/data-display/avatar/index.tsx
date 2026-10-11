'use client';
// Picture of a person or entity, falling back to initials when there is no image or it fails to load.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ReactElement, RefObject } from 'react';

import { appearanceStyles, assertLabel, forwardAllBut } from '#src/shared/appearance.ts';
import type { ControlSize } from '#src/shared/appearance.ts';
import { themeVariables } from '#src/theme/theme-variables.ts';
import type { SemanticIntent } from '#src/tokens/index.ts';

const { typography, fontWeight, radius }: typeof themeVariables = themeVariables;

export type AvatarSize = ControlSize;

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
	/** Name of the person or entity: the accessible name and the source of the initials. Cannot be blank. */
	name: string;
	/** Image URL. Without it, or when it fails to load, the initials are shown. */
	src?: string;
	/** 32, 40 or 48 px. Defaults to `'medium'`. */
	size?: AvatarSize;
	/** Color of the initials, on its soft container. Defaults to `'default'`. */
	intent?: SemanticIntent;
	/** Hides the avatar from assistive technologies when the name is already next to it. */
	decorative?: boolean;
}

interface AvatarStyleProps {
	avatarSize: AvatarSize;
	avatarIntent: SemanticIntent;
}

const sides: Record<AvatarSize, string> = { small: '2rem', medium: '2.5rem', large: '3rem' };

const initialsSizes: Record<AvatarSize, string> = {
	small: typography.caption.fontSize,
	medium: typography.label.fontSize,
	large: typography.body.fontSize,
};

const AvatarRoot = styled('span', {
	shouldForwardProp: forwardAllBut('avatarSize', 'avatarIntent'),
})<AvatarStyleProps>(({ avatarSize, avatarIntent }: AvatarStyleProps): CSSObject => {
	return {
		boxSizing: 'border-box',
		display: 'inline-flex',
		flexShrink: 0,
		alignItems: 'center',
		justifyContent: 'center',
		width: sides[avatarSize],
		height: sides[avatarSize],
		overflow: 'hidden',
		borderRadius: radius.pill,
		verticalAlign: 'middle',
		fontFamily: typography.label.fontFamily,
		fontSize: initialsSizes[avatarSize],
		fontWeight: fontWeight.semibold,
		lineHeight: 1,
		userSelect: 'none',
		...appearanceStyles(avatarIntent, 'soft'),
	};
});

const Image = styled('img')({ width: '100%', height: '100%', objectFit: 'cover' });

/** Up to two initials: the first letters of the first and the last words of `name`. */
export const initialsOf = (name: string): string => {
	const words: string[] = name
		.trim()
		.split(/\s+/u)
		.filter((word: string): boolean => word !== '');

	const first: string | undefined = words.at(0);
	const last: string | undefined = words.length > 1 ? words.at(-1) : undefined;

	return [first, last]
		.map((word: string | undefined): string => {
			return word === undefined ? '' : (Array.from(word).at(0) ?? '');
		})
		.join('')
		.toLocaleUpperCase();
};

export const Avatar = ({
	name,
	src,
	size = 'medium',
	intent = 'default',
	decorative = false,
	...attributes
}: AvatarProps): ReactElement => {
	const accessibleName: string = assertLabel(name, 'The name of an Avatar');
	const imageReference: RefObject<HTMLImageElement | null> = useRef<HTMLImageElement>(null);
	const [failedSource, setFailedSource] = useState<string | undefined>(undefined);
	const showImage: boolean = src !== undefined && failedSource !== src;

	// An image that failed before hydration fired its error event before React listened to it.
	useEffect((): void => {
		const image: HTMLImageElement | null = imageReference.current;
		if (image?.complete === true && image.naturalWidth === 0) setFailedSource(src);
	}, [src]);

	const handleError = (): void => {
		setFailedSource(src);
	};

	const nameAttributes: Record<string, string> = decorative
		? { 'aria-hidden': 'true' }
		: { role: 'img', 'aria-label': accessibleName };

	return (
		<AvatarRoot
			{...attributes}
			{...(showImage ? {} : nameAttributes)}
			avatarSize={size}
			avatarIntent={intent}
		>
			{showImage ? (
				<Image
					ref={imageReference}
					src={src}
					alt={decorative ? '' : accessibleName}
					onError={handleError}
				/>
			) : (
				<span aria-hidden='true'>{initialsOf(accessibleName)}</span>
			)}
		</AvatarRoot>
	);
};
