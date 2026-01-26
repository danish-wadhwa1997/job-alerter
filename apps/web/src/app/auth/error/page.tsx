/**
 * Auth Error Page
 *
 * Displays authentication errors in a user-friendly way.
 */

import { redirect } from 'next/navigation';

interface ErrorPageProps {
  searchParams: { error?: string };
}

export const metadata = {
  title: 'Authentication Error',
  description: 'An error occurred during authentication',
};

export default function AuthErrorPage({ searchParams }: ErrorPageProps) {
  // Redirect to signin with error parameter
  redirect(`/auth/signin?error=${searchParams.error || 'Default'}`);
}
