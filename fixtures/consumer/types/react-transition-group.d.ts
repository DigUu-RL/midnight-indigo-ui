// The declarations of `@mui/x-date-pickers` import `react-transition-group/CSSTransition` without an extension. That
// package has no `exports`, so ESM resolution (`NodeNext`) does not find its types, and a consumer without
// `skipLibCheck` gets TS7016. This maps the specifier to the real declarations; `Bundler` resolution needs nothing.
declare module 'react-transition-group/CSSTransition' {
	export * from 'react-transition-group/CSSTransition.js';
	export { default } from 'react-transition-group/CSSTransition.js';
}
