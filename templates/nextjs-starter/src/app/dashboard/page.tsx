// Dashboard demo (Server Component). The `state` search parameter picks how the mock API answers, so the loading,
// empty and error states can be opened, linked and tested directly: `/dashboard?state=error`.
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { DashboardDemo } from '#src/app/dashboard/dashboard-demo.tsx';
import { demoScenarios } from '#src/dashboard/mock-api.ts';
import type { DemoScenario } from '#src/dashboard/mock-api.ts';

export const metadata: Metadata = {
	title: 'Dashboard · Midnight Indigo: UI starter',
};

const isScenario = (value: unknown): value is DemoScenario => {
	return demoScenarios.includes(value as DemoScenario);
};

interface DashboardPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps): Promise<ReactElement> => {
	const { state } = await searchParams;

	return <DashboardDemo scenario={isScenario(state) ? state : 'live'} />;
};

export default DashboardPage;
