// Server Component showing every typographic role and the two kinds of icon, styled only with theme variables.
import { Icon } from '@midnight-indigo/ui';
import { themeVariables } from '@midnight-indigo/ui/theme';
import { typographyRoles } from '@midnight-indigo/ui/tokens';
import type { TypographyRole } from '@midnight-indigo/ui/tokens';
import type { ReactElement } from 'react';

const checkPath: ReactElement = <path d='M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z' />;
const sampleText: string = 'Midnight Indigo keeps every role legible at 200% zoom';

export const TypographySpecimen = (): ReactElement => {
	return (
		<section className='panel'>
			<h2 style={themeVariables.typography.headingMedium}>Typography</h2>
			<ul className='specimen'>
				{typographyRoles.map((role: TypographyRole): ReactElement => {
					return (
						<li key={role} className='specimen-row'>
							<code style={themeVariables.typography.caption}>{role}</code>
							<span className='truncate' style={themeVariables.typography[role]} title={sampleText}>
								{sampleText}
							</span>
						</li>
					);
				})}
			</ul>
			<p className='status' style={themeVariables.typography.body}>
				<Icon label='Completed' size='medium' style={{ color: themeVariables.intent.success.text }}>
					{checkPath}
				</Icon>
				<span>Functional icon: named, because it carries the status on its own.</span>
			</p>
			<p className='status' style={themeVariables.typography.body}>
				<Icon decorative>{checkPath}</Icon>
				<span>Decorative icon: hidden, because the text already says it.</span>
			</p>
		</section>
	);
};
