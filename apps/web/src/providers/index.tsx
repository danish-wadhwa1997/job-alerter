'use client';

/**
 * Root Providers
 *
 * Combines all providers into a single component.
 * Order matters - outer providers are initialized first.
 *
 * Provider Order:
 * 1. AuthProvider - Authentication context
 * 2. ChakraProvider - UI theme and styling
 */

import type { Session } from 'next-auth';
import { AuthProvider } from './auth-provider';
import { ChakraProvider } from './chakra-provider';

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <AuthProvider session={session}>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </AuthProvider>
  );
}
