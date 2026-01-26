/**
 * Jobs Page
 *
 * Lists all job matches for the user with:
 * - Filtering by match score, company, work mode
 * - Sorting options
 * - Pagination
 *
 * Server Component for initial data fetch.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JobsContent } from '@/components/pages/jobs-content';

export const metadata = {
  title: 'Jobs',
  description: 'View your job matches',
};

export default async function JobsPage() {
  const session = await getServerSession(authOptions);

  // TODO: Fetch jobs from database
  // const jobs = await getJobMatches(session.user.id);

  return <JobsContent />;
}
