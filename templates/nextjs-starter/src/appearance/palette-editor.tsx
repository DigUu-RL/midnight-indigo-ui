'use client';
// Palette configuration: the main color of each intent, a preview of the components with the resulting theme, its
// contrast audit and the `theme.json` to paste into `src/theme.json`. The preview is scoped to its panel (the theme
// stylesheet of `createThemeStylesheet` under a class), so the rest of the page keeps the theme of the build and nothing
// flashes on the next load: the palette of the application is decided at build time, from the JSON.
import { Button } from '@midnight-indigo/ui/buttons';
import { DashboardPanel } from '@midnight-indigo/ui/dashboard';
import { Chip } from '@midnight-indigo/ui/data-display';
import { Alert, ProgressBar, useToast } from '@midnight-indigo/ui/feedback';
import type { ToastApi } from '@midnight-indigo/ui/feedback';
import { TextField } from '@midnight-indigo/ui/forms';
import { useI18n } from '@midnight-indigo/ui/i18n';
import type { I18nValue, RichTags } from '@midnight-indigo/ui/i18n';
import { Grid, Stack } from '@midnight-indigo/ui/layout';
import { Link } from '@midnight-indigo/ui/navigation';
import { createThemeStylesheet, createUiTheme } from '@midnight-indigo/ui/theme';
import type { UiTheme, UiThemeConfig } from '@midnight-indigo/ui/theme';
import {
	auditContrast,
	describeContrastPair,
	isHexColor,
	normalizeHexColor,
	semanticIntents,
} from '@midnight-indigo/ui/tokens';
import type { ContrastResult, SemanticIntent } from '@midnight-indigo/ui/tokens';
import { useMemo, useState } from 'react';
import type { ChangeEvent, ReactElement, ReactNode } from 'react';

import { theme as applicationTheme } from '@/src/theme';

type MainColors = Readonly<Record<SemanticIntent, string>>;

const previewClassName: string = 'palette-preview';

const initialColors: MainColors = Object.fromEntries(
	semanticIntents.map((intent: SemanticIntent): [SemanticIntent, string] => {
		return [intent, applicationTheme.tokens.intent[intent].main];
	}),
) as MainColors;

/** The configuration of the valid colors; an invalid one keeps the color of the build until it is fixed. */
const configurationOf = (colors: MainColors): UiThemeConfig => {
	return {
		palette: Object.fromEntries(
			semanticIntents
				.filter((intent: SemanticIntent): boolean => isHexColor(colors[intent]))
				.map((intent: SemanticIntent): [SemanticIntent, { main: string }] => {
					return [intent, { main: normalizeHexColor(colors[intent]) }];
				}),
		),
	};
};

// `<link>` of the translations: the words of the link stay in the sentence, in the order of each language.
const exportLink: RichTags = {
	link: (children: ReactNode): ReactNode => <Link href='#theme-json'>{children}</Link>,
};

const downloadJson = (json: string): void => {
	const url: string = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
	const anchor: HTMLAnchorElement = document.createElement('a');

	anchor.href = url;
	anchor.download = 'theme.json';
	anchor.click();
	URL.revokeObjectURL(url);
};

export const PaletteEditor = (): ReactElement => {
	const { t, rich, formatNumber }: I18nValue = useI18n();
	const toast: ToastApi = useToast();
	const [colors, setColors] = useState<MainColors>(initialColors);

	const configuration: UiThemeConfig = useMemo(
		(): UiThemeConfig => configurationOf(colors),
		[colors],
	);

	// Warnings are shown on the page, translated, instead of in the console.
	const previewTheme: UiTheme = useMemo((): UiTheme => {
		return createUiTheme(configuration, { onWarning: (): void => undefined });
	}, [configuration]);

	const failures: ContrastResult[] = useMemo((): ContrastResult[] => {
		return auditContrast(previewTheme.tokens).filter(
			(result: ContrastResult): boolean => !result.passes,
		);
	}, [previewTheme]);

	const json: string = `${JSON.stringify(configuration, null, '\t')}\n`;

	const changeColor = (intent: SemanticIntent, value: string): void => {
		setColors((current: MainColors): MainColors => ({ ...current, [intent]: value }));
	};

	const copyJson = (): void => {
		navigator.clipboard.writeText(json).then(
			(): void => {
				toast.show({ intent: 'success', message: t('appearance.export.copied') });
			},
			(): void => {
				toast.show({ intent: 'error', message: t('appearance.export.copyFailed') });
			},
		);
	};

	return (
		<Grid columns={{ compact: 1, large: 2 }} gap='6'>
			<DashboardPanel
				title={t('appearance.colors.title')}
				description={t('appearance.colors.description')}
				footer={
					<Button
						variant='outline'
						onClick={(): void => {
							setColors(initialColors);
						}}
					>
						{t('appearance.colors.reset')}
					</Button>
				}
			>
				<Stack gap='4'>
					{semanticIntents.map((intent: SemanticIntent): ReactElement => {
						const label: string = t(`appearance.intents.${intent}`);
						const valid: boolean = isHexColor(colors[intent]);

						return (
							<div key={intent} className='color-field'>
								<TextField
									label={label}
									name={intent}
									value={colors[intent]}
									spellCheck={false}
									autoComplete='off'
									description={t('appearance.colors.format')}
									error={valid ? undefined : t('appearance.colors.invalid')}
									onChange={(event: ChangeEvent<HTMLInputElement>): void => {
										changeColor(intent, event.currentTarget.value);
									}}
								/>

								<input
									type='color'
									aria-label={t('appearance.colors.pick', { intent: label })}
									value={valid ? normalizeHexColor(colors[intent]).toLowerCase() : '#000000'}
									onChange={(event: ChangeEvent<HTMLInputElement>): void => {
										changeColor(intent, event.currentTarget.value.toUpperCase());
									}}
								/>
							</div>
						);
					})}
				</Stack>
			</DashboardPanel>

			<DashboardPanel
				title={t('appearance.preview.title')}
				description={t('appearance.preview.description')}
			>
				<div className={previewClassName}>
					<style>{createThemeStylesheet(previewTheme, `.${previewClassName}`)}</style>

					<Stack gap='4'>
						<div className='row'>
							{semanticIntents.map((intent: SemanticIntent): ReactElement => {
								return (
									<Button key={intent} intent={intent}>
										{t(`appearance.intents.${intent}`)}
									</Button>
								);
							})}
						</div>

						<div className='row'>
							{semanticIntents.map((intent: SemanticIntent): ReactElement => {
								return (
									<Chip
										key={intent}
										intent={intent}
										variant='soft'
										label={t(`appearance.intents.${intent}`)}
									/>
								);
							})}
						</div>

						<Alert intent='success' title={t('appearance.preview.alertTitle')}>
							{t('appearance.preview.alertMessage')}
						</Alert>

						<ProgressBar label={t('appearance.preview.progress')} value={64} />
						<p>{rich('appearance.preview.export', {}, exportLink)}</p>
					</Stack>
				</div>
			</DashboardPanel>

			<DashboardPanel
				title={t('appearance.contrast.title')}
				description={t('appearance.contrast.description')}
			>
				{failures.length === 0 ? (
					<Alert intent='success' title={t('appearance.contrast.passTitle')}>
						{t('appearance.contrast.passMessage')}
					</Alert>
				) : (
					<Alert
						intent='warning'
						title={t('appearance.contrast.failTitle', { count: failures.length })}
					>
						<ul className='contrast-failures'>
							{failures.map((failure: ContrastResult): ReactElement => {
								return (
									<li key={describeContrastPair(failure)}>
										<code>{failure.foreground}</code> / <code>{failure.background}</code>
										{': '}
										{t('appearance.contrast.ratio', {
											ratio: formatNumber(failure.ratio, { maximumFractionDigits: 2 }),
											minimum: formatNumber(failure.minimum, { maximumFractionDigits: 1 }),
											requirement: t(`appearance.contrast.requirements.${failure.requirement}`),
										})}
									</li>
								);
							})}
						</ul>
					</Alert>
				)}
			</DashboardPanel>

			<DashboardPanel
				id='theme-json'
				title={t('appearance.export.title')}
				description={rich('appearance.export.description')}
				toolbar={
					<div className='row'>
						<Button variant='outline' onClick={copyJson}>
							{t('appearance.export.copy')}
						</Button>

						<Button
							variant='outline'
							onClick={(): void => {
								downloadJson(json);
							}}
						>
							{t('appearance.export.download')}
						</Button>
					</div>
				}
			>
				<pre className='code-block' tabIndex={0} aria-label={t('appearance.export.code')}>
					<code>{json}</code>
				</pre>
			</DashboardPanel>
		</Grid>
	);
};
