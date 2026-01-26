/**
 * Home Page
 *
 * Landing page for unauthenticated users.
 * Redirects to dashboard if already signed in.
 *
 * Features:
 * - Hero section with value proposition
 * - Sign in buttons (Google, GitHub)
 * - Feature highlights
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LandingPage } from '@/components/pages/landing-page';

export default async function Home() {
  // Check if user is already signed in
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if authenticated
  if (session) {
    redirect('/dashboard');
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}
