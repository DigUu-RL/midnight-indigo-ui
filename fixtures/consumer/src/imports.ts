// Proves at typecheck time that every public subpath resolves its declarations by package name.
import * as root from '@midnight-indigo/ui';
import * as buttons from '@midnight-indigo/ui/buttons';
import * as charts from '@midnight-indigo/ui/charts';
import * as dashboard from '@midnight-indigo/ui/dashboard';
import * as dataDisplay from '@midnight-indigo/ui/data-display';
import * as feedback from '@midnight-indigo/ui/feedback';
import * as forms from '@midnight-indigo/ui/forms';
import * as internationalization from '@midnight-indigo/ui/i18n';
import * as navigation from '@midnight-indigo/ui/navigation';
import * as theme from '@midnight-indigo/ui/theme';
import * as tokens from '@midnight-indigo/ui/tokens';

export const publicModules: readonly object[] = [
	root,
	tokens,
	theme,
	buttons,
	forms,
	feedback,
	navigation,
	dataDisplay,
	charts,
	internationalization,
	dashboard,
];
