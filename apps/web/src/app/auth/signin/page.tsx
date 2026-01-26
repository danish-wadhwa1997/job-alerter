/**
 * Sign In Page
 *
 * Custom sign-in page with:
 * - OAuth provider buttons
 * - Error handling
 * - Branded design
 *
 * This replaces the default NextAuth sign-in page.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignInContent } from '@/components/pages/signin-content';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to Job Alerter',
};

interface SignInPageProps {
  searchParams: { error?: string; callbackUrl?: string };
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  // Redirect to dashboard if already signed in
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return (
    <SignInContent
      error={searchParams.error}
      callbackUrl={searchParams.callbackUrl || '/dashboard'}
    />
  );
}
