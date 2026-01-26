/**
 * AI Provider Types and Interfaces
 *
 * These interfaces define the contract for AI providers.
 * All providers (OpenAI, Anthropic, Groq, local) must implement AIProvider.
 * This enables swapping providers without changing application code.
 */

import type { ParsedResume, Job } from '../types';

// ============================================================================
// AI Provider Interface (Core Contract)
// ============================================================================

/**
 * Base interface that ALL AI providers must implement
 *
 * Usage:
 * - Create provider: const ai = createAIProvider()
 * - Parse resume: const data = await ai.parseResume(text)
 * - Match job: const match = await ai.matchJob(resume, job)
 *
 * This enables:
 * - Easy provider switching via environment variable
 * - Consistent API across OpenAI, Anthropic, Groq, local models
 * - Future: Train your own model with same interface
 */
export interface AIProvider {
  /** Human-readable name for logging */
  readonly name: string;

  /**
   * Parse a resume into structured data
   * @param text - Raw text content of the resume
   * @returns Structured resume data (cached in DB to save costs)
   */
  parseResume(text: string): Promise<ParsedResume>;

  /**
   * Calculate match score between resume and job
   * @param resume - Parsed resume data (from cache or parseResume)
   * @param job - Job posting to match against
   * @returns Match result with score and skill analysis
   */
  matchJob(resume: ParsedResume, job: Job): Promise<AIJobMatchResult>;

  /**
   * Extract skills from arbitrary text
   * Useful for parsing job descriptions
   * @param text - Text to extract skills from
   * @returns Array of identified skills
   */
  extractSkills(text: string): Promise<string[]>;
}

// ============================================================================
// AI Provider Result Types
// ============================================================================

/**
 * Result from AI job matching
 * Note: This is different from JobMatch (DB record)
 */
export interface AIJobMatchResult {
  score: number; // 0-100 match percentage
  matchedSkills: string[]; // Skills user has that job requires
  missingSkills: string[]; // Skills job requires that user lacks
  reasoning: string; // AI's explanation of the match
  confidence: number; // 0-1 confidence in the analysis
}

/**
 * Response metadata from AI providers
 * Useful for logging and cost tracking
 */
export interface AIResponseMeta {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost?: number; // Estimated cost in USD
}

// ============================================================================
// Provider Configuration Types
// ============================================================================

/**
 * Supported AI providers
 */
export type AIProviderType = 'openai' | 'anthropic' | 'groq' | 'local';

/**
 * Configuration for creating an AI provider
 */
export interface AIProviderConfig {
  provider: AIProviderType;
  model?: string; // Override default model
  apiKey?: string; // Usually from env var
  baseUrl?: string; // For local models (e.g., Ollama)
}

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
  groq: 'llama3-70b-8192',
  local: 'llama3',
};

// ============================================================================
// Prompt Templates (Shared across providers)
// ============================================================================

/**
 * System prompts for consistent AI behavior
 * These are shared so all providers produce similar output format
 */
export const AI_PROMPTS = {
  /**
   * Resume parsing system prompt
   */
  RESUME_PARSER: `You are a professional resume parser. Extract structured information from resumes.

Return ONLY valid JSON matching this exact schema:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "optional phone",
  "location": "optional location",
  "linkedIn": "optional linkedin url",
  "github": "optional github url",
  "portfolio": "optional portfolio url",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "duration": "Jan 2020 - Present",
      "description": "Brief description of responsibilities"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor's/Master's/etc",
      "field": "Field of Study"
    }
  ],
  "summary": "Brief professional summary",
  "certifications": ["optional certifications"],
  "languages": ["optional spoken languages"]
}

Rules:
- Extract only what's explicitly stated
- For missing optional fields, omit them (don't use null)
- Normalize skill names (e.g., "ReactJS" → "React", "node.js" → "Node.js")
- Keep descriptions concise`,

  /**
   * Job matching system prompt
   */
  JOB_MATCHER: `You are a job matching expert. Analyze how well a candidate's resume matches a job posting.

Return ONLY valid JSON:
{
  "score": 75,
  "matchedSkills": ["React", "TypeScript"],
  "missingSkills": ["GraphQL", "AWS"],
  "reasoning": "Brief 1-2 sentence explanation",
  "confidence": 0.85
}

Scoring guidelines:
- 90-100: Perfect match, has all required skills + relevant experience
- 70-89: Strong match, has most required skills
- 50-69: Partial match, has some required skills
- 30-49: Weak match, missing key requirements
- 0-29: Poor match, significantly underqualified

Consider:
- Required vs nice-to-have skills
- Years of experience
- Industry relevance
- Education requirements`,

  /**
   * Skill extraction system prompt
   */
  SKILL_EXTRACTOR: `Extract technical and professional skills from the text.

Return ONLY a JSON array of skill names:
["React", "TypeScript", "Node.js", "PostgreSQL"]

Rules:
- Normalize names (ReactJS → React, node.js → Node.js)
- Include both hard skills (programming, tools) and soft skills (leadership)
- Don't include company names or job titles
- Deduplicate similar skills`,
} as const;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Wrapped response from AI provider with metadata
 */
export interface AIResponse<T> {
  result: T;
  meta: AIResponseMeta;
}

/**
 * Error from AI provider
 */
export interface AIError {
  code: 'rate_limit' | 'invalid_response' | 'timeout' | 'api_error' | 'unknown';
  message: string;
  provider: string;
  retryable: boolean;
}
