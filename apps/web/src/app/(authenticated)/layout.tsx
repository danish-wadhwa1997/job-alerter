/**
 * Authenticated Layout
 *
 * This layout wraps all pages that require authentication.
 * It provides:
 * - Session validation (redirect to signin if not authenticated)
 * - App shell with navigation
 *
 * Route group: (authenticated) - parentheses mean it's a route group
 * that doesn't affect the URL structure.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layout/app-shell';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  // Check authentication on the server
  const session = await getServerSession(authOptions);

  // Redirect to signin if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }

  // Render the app shell with navigation
  return <AppShell>{children}</AppShell>;
}
