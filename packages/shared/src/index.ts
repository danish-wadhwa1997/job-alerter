/**
 * @job-alerter/shared
 *
 * Shared types, utilities, and configurations for the Job Alerter monorepo.
 * This package can be published to npm and used across all apps and services.
 */

// Re-export all types
export * from './types';

// Re-export AI types and interfaces
export * from './ai';

// Re-export database schema (when Drizzle is set up)
// export * from './db';
