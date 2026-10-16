// Sizes of the layout shared by components and the global baseline, so that both always agree.

/** Height of the sticky top bar of `DashboardLayout`; the page keeps anchored targets below it when scrolling. */
export const topbarHeight: string = '4rem';

/** Attribute that marks the sticky top bar, so the global styles know when the page has one. */
export const stickyTopbarAttribute: string = 'data-mi-sticky-topbar';
