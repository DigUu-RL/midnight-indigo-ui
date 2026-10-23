'use client';
// Requests the figures of the dashboard again whenever the filters, the scenario or a retry change them. A request
// still running is aborted, so an old answer never replaces a newer one.
import { useEffect, useState } from 'react';

import { fetchDashboard } from '@/src/dashboard/mock-api';
import type { DashboardQuery, DashboardSnapshot, DemoScenario } from '@/src/dashboard/mock-api';

export type RequestStatus = 'loading' | 'ready' | 'error';

interface RequestState {
	status: RequestStatus;
	snapshot: DashboardSnapshot | undefined;
}

export interface DashboardRequest extends RequestState {
	retry: () => void;
}

export const useDashboardSnapshot = (
	{ region, period }: DashboardQuery,
	scenario: DemoScenario,
): DashboardRequest => {
	const [attempt, setAttempt] = useState<number>(0);

	const [state, setState] = useState<RequestState>({ status: 'loading', snapshot: undefined });

	useEffect((): (() => void) => {
		const controller: AbortController = new AbortController();

		setState((current: RequestState): RequestState => {
			return { status: 'loading', snapshot: current.snapshot };
		});

		fetchDashboard({ region, period }, scenario, controller.signal).then(
			(snapshot: DashboardSnapshot): void => {
				setState({ status: 'ready', snapshot });
			},
			(): void => {
				if (!controller.signal.aborted) setState({ status: 'error', snapshot: undefined });
			},
		);

		return (): void => {
			controller.abort();
		};
	}, [region, period, scenario, attempt]);

	return {
		...state,
		retry: (): void => {
			setAttempt((current: number): number => current + 1);
		},
	};
};
