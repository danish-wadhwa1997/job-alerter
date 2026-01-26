/**
 * NextAuth.js API Route Handler
 *
 * This file handles all authentication API routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/:provider
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 *
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create the NextAuth handler with our configuration
const handler = NextAuth(authOptions);

// Export for both GET and POST requests (required by NextAuth)
export { handler as GET, handler as POST };
