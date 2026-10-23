'use client';
// Block of source code: highlighted lines, optional line numbers and highlighted lines, a copy button and one tab per
// file. It renders tokens computed beforehand (`highlightCode`), so the browser never runs a highlighter.
import { styled } from '@mui/material/styles';
import type { CSSObject } from '@mui/material/styles';
import type { ComponentPropsWithRef, ReactElement } from 'react';

import { CopyButton } from '@/src/buttons/copy-button/index';
import { plainCode } from '@/src/code/highlighted-code';
import type { CodeLine, CodeToken, HighlightedCode } from '@/src/code/highlighted-code';
import { tabStyles } from '@/src/navigation/tab-appearance/index';
import { useTabList } from '@/src/navigation/tab-list/index';
import type { TabList } from '@/src/navigation/tab-list/index';
import { forwardAllBut } from '@/src/shared/appearance';
import { useComponentLabels } from '@/src/shared/component-labels/index';
import { hiddenScrollbarStyles } from '@/src/theme/native-styles';
import { themeVariables } from '@/src/theme/theme-variables';

const {
	spacing,
	typography,
	fontWeight,
	radius,
	surface,
	border,
	text,
	state,
	intent,
	focus,
}: typeof themeVariables = themeVariables;

/** Texts of the code block. Translate them with the rest of the interface. */
export interface CodeBlockLabels {
	/** Accessible name of a block without a file name. */
	code: string;
	/** Accessible name of the row of file tabs. */
	files: string;
	/** Name of the copy button. */
	copy: string;
}

export const defaultCodeBlockLabels: Readonly<CodeBlockLabels> = Object.freeze({
	code: 'Code',
	files: 'Files',
	copy: 'Copy code',
});

export interface CodeFile {
	/** File name, shown in its tab; unique within the block. */
	name: string;
	/** Tokens from `highlightCode`, or a string shown without colors. */
	code: HighlightedCode | string;
	/** Numbers of the lines to highlight, from 1. */
	highlightedLines?: readonly number[];
}

interface CodeBlockBaseProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
	/** Numbers each line; the numbers are never copied. Defaults to `false`. */
	showLineNumbers?: boolean;
	/** Shows the copy button. Defaults to `true`. */
	copyable?: boolean;
	/** Overrides some or all of `defaultCodeBlockLabels`. */
	labels?: Partial<CodeBlockLabels>;
}

/** One snippet, optionally named after its file. */
interface SingleCodeProps {
	/** Tokens from `highlightCode`, or a string shown without colors. */
	code: HighlightedCode | string;
	/** Shown above the code and used as its accessible name. */
	fileName?: string;
	/** Numbers of the lines to highlight, from 1. */
	highlightedLines?: readonly number[];
	files?: never;
	file?: never;
	defaultFile?: never;
	onFileChange?: never;
}

/** Several files, one tab each (WAI-ARIA tabs pattern). */
interface MultipleFileProps {
	/** The files, one tab each, in order; the copy button copies the file shown. */
	files: readonly CodeFile[];
	/** Name of the file shown, to control it. */
	file?: string;
	/** Name of the file shown at first when uncontrolled. Defaults to the first file. */
	defaultFile?: string;
	/** Called with the name of the file the reader picks. */
	onFileChange?: (name: string) => void;
	code?: never;
	fileName?: never;
	highlightedLines?: never;
}

export type CodeBlockProps = CodeBlockBaseProps & (SingleCodeProps | MultipleFileProps);

interface CodeStyleProps {
	numberWidth: number;
	numbered: boolean;
}

interface LineStyleProps {
	highlighted: boolean;
}

const Root = styled('div')({
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	minWidth: 0,
	overflow: 'hidden',
	border: `1px solid ${border.subtle}`,
	borderRadius: radius.card,
	backgroundColor: surface.field,
	color: text.primary,
});

const Header = styled('div')({
	display: 'flex',
	alignItems: 'center',
	gap: spacing[2],
	minHeight: '2.75rem',
	paddingInlineStart: spacing[4],
	paddingInlineEnd: spacing[2],
	borderBlockEnd: `1px solid ${border.subtle}`,
});

const Caption = styled('span')({
	flex: '1 1 auto',
	minWidth: 0,
	overflow: 'hidden',
	color: text.secondary,
	...typography.code,
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
});

// The tabs fill the header, so the copy button stays at its end however many files there are.
const FileTabRow = styled('div')({
	display: 'flex',
	flex: '1 1 auto',
	gap: spacing[1],
	minWidth: 0,
	marginInlineStart: `calc(-1 * ${spacing[2]})`,
	overflowX: 'auto',
	...hiddenScrollbarStyles,
});

const FileTab = styled('button')({
	...tabStyles,
	...typography.code,
	fontWeight: fontWeight.medium,
});

// Code reads left to right in any page. The block scrolls sideways instead of wrapping, and is a tab stop, so the
// keyboard can scroll it too; its focus ring is drawn inside, where the root does not clip it.
const Pre = styled('pre')({
	boxSizing: 'border-box',
	margin: 0,
	paddingBlock: spacing[4],
	overflow: 'auto',
	...typography.code,
	tabSize: 2,
	'&:focus-visible': {
		outline: `${focus.width} solid ${focus.ring}`,
		outlineOffset: `calc(-1 * ${focus.width})`,
	},
});

// At least as wide as the block, and as wide as the longest line, so a highlighted line is tinted to the end.
const Code = styled('code', {
	shouldForwardProp: forwardAllBut('numberWidth', 'numbered'),
})<CodeStyleProps>(({ numberWidth, numbered }: CodeStyleProps): CSSObject => {
	return {
		display: 'inline-block',
		minWidth: '100%',
		font: 'inherit',
		counterReset: 'line',
		...(numbered
			? {
					'& > span::before': {
						content: 'counter(line)',
						counterIncrement: 'line',
						display: 'inline-block',
						width: `${String(numberWidth)}ch`,
						marginInlineEnd: spacing[4],
						color: text.muted,
						textAlign: 'end',
						userSelect: 'none',
					},
				}
			: {}),
	};
});

// A highlighted line is tinted and marked by a 2 px bar at its start, a shape besides the color.
const Line = styled('span', { shouldForwardProp: forwardAllBut('highlighted') })<LineStyleProps>(({
	highlighted,
}: LineStyleProps): CSSObject => {
	return {
		display: 'block',
		minHeight: '1lh',
		paddingInline: spacing[4],
		...(highlighted
			? { backgroundColor: state.selected, boxShadow: `inset 2px 0 0 ${intent.brand.border}` }
			: {}),
	};
});

const toHighlighted = (code: HighlightedCode | string): HighlightedCode => {
	return typeof code === 'string' ? plainCode(code) : code;
};

const renderToken = (token: CodeToken, index: number): ReactElement => {
	return (
		<span
			key={index}
			style={{
				color: token.color,
				fontStyle: token.italic === true ? 'italic' : undefined,
				fontWeight: token.bold === true ? fontWeight.bold : undefined,
			}}
		>
			{token.content}
		</span>
	);
};

interface CodeLinesProps {
	code: HighlightedCode;
	highlightedLines: readonly number[];
	showLineNumbers: boolean;
}

const CodeLines = ({ code, highlightedLines, showLineNumbers }: CodeLinesProps): ReactElement => {
	return (
		<Code numbered={showLineNumbers} numberWidth={String(code.lines.length).length}>
			{code.lines.map((line: CodeLine, index: number): ReactElement => {
				const highlighted: boolean = highlightedLines.includes(index + 1);

				return (
					<Line key={index} highlighted={highlighted} data-highlighted={highlighted || undefined}>
						{line.map(renderToken)}
					</Line>
				);
			})}
		</Code>
	);
};

interface FileTabsProps {
	files: readonly CodeFile[];
	tabList: TabList;
	label: string;
}

const FileTabs = ({ files, tabList, label }: FileTabsProps): ReactElement => {
	return (
		<FileTabRow role='tablist' aria-label={label} onKeyDown={tabList.handleKeyDown}>
			{files.map((file: CodeFile): ReactElement => {
				const selected: boolean = file.name === tabList.selectedValue;

				return (
					<FileTab
						key={file.name}
						ref={tabList.registerTab(file.name)}
						type='button'
						role='tab'
						id={tabList.tabId(file.name)}
						aria-selected={selected}
						// Only the panel of the file shown is rendered.
						aria-controls={selected ? tabList.panelId(file.name) : undefined}
						tabIndex={selected ? 0 : -1}
						onClick={(): void => {
							tabList.select(file.name);
						}}
					>
						{file.name}
					</FileTab>
				);
			})}
		</FileTabRow>
	);
};

/**
 * Give it the result of `highlightCode`, computed on the server (or at build time), or a plain string. The block is
 * named by its file name, else by `labels.code`; with `files`, each file is a tab, and the copy button copies the file
 * shown. Line numbers are drawn by CSS, so they are neither selected nor copied with the code.
 */
export const CodeBlock = ({
	code,
	fileName,
	highlightedLines = [],
	files,
	file,
	defaultFile,
	onFileChange,
	showLineNumbers = false,
	copyable = true,
	labels,
	...attributes
}: CodeBlockProps): ReactElement => {
	const texts: CodeBlockLabels = useComponentLabels('codeBlock', defaultCodeBlockLabels, labels);

	const fileList: readonly CodeFile[] = files ?? [{ name: fileName ?? '', code, highlightedLines }];

	const tabList: TabList = useTabList({
		items: fileList.map((entry: CodeFile): { id: string } => ({ id: entry.name })),
		value: file,
		defaultValue: defaultFile,
		onValueChange: onFileChange,
		activation: 'automatic',
	});

	const shown: CodeFile | undefined =
		fileList.find((entry: CodeFile): boolean => entry.name === tabList.selectedValue) ??
		fileList[0];

	const shownCode: HighlightedCode = toHighlighted(shown?.code ?? '');
	const tabbed: boolean = files !== undefined;

	const panelAttributes: Record<string, string> = tabbed
		? {
				role: 'tabpanel',
				id: tabList.panelId(shown?.name ?? ''),
				'aria-labelledby': tabList.tabId(shown?.name ?? ''),
			}
		: { role: 'group', 'aria-label': fileName ?? texts.code };

	const hasHeader: boolean = tabbed || fileName !== undefined || copyable;

	return (
		<Root {...attributes}>
			{hasHeader ? (
				<Header>
					{tabbed ? (
						<FileTabs files={fileList} tabList={tabList} label={texts.files} />
					) : (
						<Caption>
							{fileName ?? (shownCode.language === 'text' ? '' : shownCode.language)}
						</Caption>
					)}

					{copyable ? (
						<CopyButton value={shownCode.code} label={texts.copy} size='small' variant='ghost' />
					) : null}
				</Header>
			) : null}

			<Pre {...panelAttributes} dir='ltr' tabIndex={0}>
				<CodeLines
					code={shownCode}
					highlightedLines={shown?.highlightedLines ?? []}
					showLineNumbers={showLineNumbers}
				/>
			</Pre>
		</Root>
	);
};
