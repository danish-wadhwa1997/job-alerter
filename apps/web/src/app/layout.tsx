/**
 * Root Layout
 *
 * The root layout wraps all pages in the application.
 * It provides:
 * - HTML document structure
 * - Global providers (auth, theme)
 * - Font loading
 * - Metadata configuration
 *
 * This is a Server Component by default.
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import { ColorModeScriptComponent } from '@/providers/chakra-provider';

// ---------------------------------------------------------------------------
// Font Configuration
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent layout shift
  variable: '--font-inter',
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'Job Alerter - Find Your Dream Job',
    template: '%s | Job Alerter',
  },
  description:
    'Personal job monitoring tool that parses your resume, tracks company postings, and alerts you to relevant opportunities.',
  keywords: ['job search', 'resume parser', 'job alerts', 'career'],
  authors: [{ name: 'Danish Wadhwa' }],
  creator: 'Danish Wadhwa',
  robots: {
    index: false, // Personal app - don't index
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a202c' },
  ],
};

// ---------------------------------------------------------------------------
// Layout Component
// ---------------------------------------------------------------------------

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong color mode */}
        <ColorModeScriptComponent />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
