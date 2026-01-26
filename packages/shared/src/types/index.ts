/**
 * Shared Types for Job Alerter
 *
 * These types are used across the frontend, backend, and Python services.
 * They define the core data structures of the application.
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * User profile stored in the database
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User's job preferences for filtering and matching
 */
export interface UserPreferences {
  userId: string;
  workModes: WorkMode[];
  jobTypes: JobType[];
  locations: string[];
  minMatchScore: number;
  emailNotifications: boolean;
}

// ============================================================================
// Resume Types
// ============================================================================

/**
 * Work experience entry from a parsed resume
 */
export interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Education entry from a parsed resume
 */
export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate?: string;
}

/**
 * Structured resume data extracted by AI
 * This is cached in the database to avoid re-parsing
 */
export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary?: string;
  certifications?: string[];
  languages?: string[];
}

/**
 * Resume record stored in database
 */
export interface Resume {
  id: string;
  userId: string;
  originalFileName: string | null;
  originalFileUrl: string | null;
  parsedData: ParsedResume | null;
  parsedAt: Date | null;
  updatedAt: Date;
}

// ============================================================================
// Job Types
// ============================================================================

/**
 * Work mode for jobs
 */
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

/**
 * Employment type for jobs
 */
export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';

/**
 * Job posting scraped from company career pages
 */
export interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string | null;
  workMode: WorkMode;
  type: JobType;
  description: string | null;
  requirements: string | null;
  url: string;
  salary?: string;
  postedAt: Date | null;
  scrapedAt: Date;
}

/**
 * Result of AI matching a resume to a job
 */
export interface JobMatch {
  id: string;
  userId: string;
  jobId: string;
  score: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string | null;
  matchedAt: Date;
}

// ============================================================================
// Company Types
// ============================================================================

/**
 * Company that users can watch for new job postings
 */
export interface Company {
  id: string;
  name: string;
  careersUrl: string;
  logoUrl?: string;
  atsType?: ATSType;
  createdAt: Date;
}

/**
 * Common Applicant Tracking Systems (ATS) for scraping
 */
export type ATSType =
  | 'greenhouse'
  | 'lever'
  | 'workday'
  | 'ashby'
  | 'bamboohr'
  | 'custom';

/**
 * User's company watchlist entry
 */
export interface UserWatchedCompany {
  userId: string;
  companyId: string;
  createdAt: Date;
}

// ============================================================================
// Notification Types
// ============================================================================

/**
 * Notification channels available
 */
export type NotificationChannel = 'email' | 'push' | 'in_app';

/**
 * Job alert notification
 */
export interface JobNotification {
  id: string;
  userId: string;
  jobMatchId: string;
  channel: NotificationChannel;
  sentAt: Date | null;
  readAt: Date | null;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
