'use client';

/**
 * Authentication Provider
 *
 * Wraps the app with NextAuth's session provider.
 * Enables useSession() hook throughout the app.
 *
 * Features:
 * - Session management
 * - Automatic session refresh
 * - Auth state available in all components
 */

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider 
      session={session}
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch when window gains focus
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
