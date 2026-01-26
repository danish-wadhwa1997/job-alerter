/**
 * Dashboard Page
 *
 * Main dashboard showing:
 * - Quick stats (total matches, new jobs, etc.)
 * - Recent job matches
 * - Resume status
 * - Watched companies
 *
 * This is a Server Component - data is fetched on the server.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DashboardContent } from '@/components/pages/dashboard-content';

export const metadata = {
  title: 'Dashboard',
  description: 'Your job search dashboard',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // TODO: Fetch dashboard data from database
  // const stats = await getDashboardStats(session.user.id);
  // const recentMatches = await getRecentMatches(session.user.id);

  return (
    <DashboardContent
      userName={session?.user?.name || 'User'}
    />
  );
}
