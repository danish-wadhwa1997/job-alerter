/**
 * Settings Page
 *
 * User settings including:
 * - Profile information
 * - Job preferences (work mode, job type)
 * - Notification settings
 * - Account management
 *
 * Server Component for initial data fetch.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SettingsContent } from '@/components/pages/settings-content';

export const metadata = {
  title: 'Settings',
  description: 'Manage your account settings',
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // TODO: Fetch user preferences from database
  // const preferences = await getUserPreferences(session.user.id);

  return (
    <SettingsContent
      user={{
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        image: session?.user?.image || null,
      }}
    />
  );
}
