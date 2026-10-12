'use client';
// The library never imports Next.js: the application hands it `next/link`, so internal links navigate on the client.
import { NavigationProvider } from '@midnight-indigo/ui/navigation';
import NextLink from 'next/link';
import type { ReactElement, ReactNode } from 'react';

interface AppNavigationProviderProps {
	children: ReactNode;
}

export const AppNavigationProvider = ({ children }: AppNavigationProviderProps): ReactElement => {
	return <NavigationProvider linkComponent={NextLink}>{children}</NavigationProvider>;
};
