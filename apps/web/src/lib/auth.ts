/**
 * NextAuth.js Configuration
 *
 * Handles authentication with Google and GitHub OAuth providers.
 *
 * Features:
 * - OAuth 2.0 with Google and GitHub
 * - JWT-based sessions (serverless compatible)
 * - User info stored in session
 *
 * Security:
 * - CSRF protection (built-in)
 * - Secure cookies in production
 * - Token encryption
 *
 * @see https://next-auth.js.org/configuration/options
 */

import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

// ---------------------------------------------------------------------------
// Type Extensions
// ---------------------------------------------------------------------------

// Extend session to include user ID
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

// ---------------------------------------------------------------------------
// Environment Validation
// ---------------------------------------------------------------------------

/**
 * Validates that all required environment variables are set.
 * Throws clear error messages during development.
 */
function validateEnv(): void {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  // At least one OAuth provider must be configured
  const hasGoogleAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  const hasGitHubAuth = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  if (!hasGoogleAuth && !hasGitHubAuth) {
    console.warn(
      '⚠️ No OAuth providers configured. Add GOOGLE_CLIENT_ID/SECRET or GITHUB_CLIENT_ID/SECRET'
    );
  }
}

// Validate in development (skip in production to avoid startup issues)
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnv();
  } catch (error) {
    console.error('Auth configuration error:', error);
  }
}

// ---------------------------------------------------------------------------
// OAuth Providers
// ---------------------------------------------------------------------------

/**
 * Build list of enabled OAuth providers based on environment variables.
 * This allows enabling/disabling providers without code changes.
 */
function buildProviders() {
  const providers = [];

  // Google OAuth - for personal/work Google accounts
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Request minimal scopes for privacy
        authorization: {
          params: {
            scope: 'openid email profile',
          },
        },
      })
    );
  }

  // GitHub OAuth - for developer accounts
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // Request minimal scopes
        authorization: {
          params: {
            scope: 'read:user user:email',
          },
        },
      })
    );
  }

  return providers;
}

// ---------------------------------------------------------------------------
// Auth Options
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  // Dynamic providers based on environment
  providers: buildProviders(),

  // Use JWT for sessions (stateless, serverless-friendly)
  session: {
    strategy: 'jwt',
    // Session expires in 30 days
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  // Custom pages (optional - use defaults for now)
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Callbacks for customizing behavior
  callbacks: {
    /**
     * JWT callback - runs when JWT is created or updated
     * Add user ID to the token for later use
     */
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      // On initial sign in, user object is available
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * Session callback - runs when session is checked
     * Add user ID to the session from the token
     */
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },

    /**
     * Sign in callback - runs before sign in completes
     * Can be used to restrict who can sign in
     */
    async signIn({ user, account, profile }) {
      // For now, allow all sign ins
      // TODO: Add domain restrictions or invite system if needed
      console.info(`User signed in: ${user.email} via ${account?.provider}`);
      return true;
    },
  },

  // Events for logging and side effects
  events: {
    async signIn({ user, account }) {
      // Log successful sign ins (useful for debugging)
      console.info(`[Auth] Sign in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ token }) {
      console.info(`[Auth] Sign out: ${token.email}`);
    },
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
