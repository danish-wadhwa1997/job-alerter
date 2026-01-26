# ADR-002c: ORM - Drizzle - Detailed Discussion

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Decision** | Drizzle ORM |

---

## 📋 Context

We need an ORM (Object-Relational Mapping) to interact with our PostgreSQL database (Neon). The key requirements are:

- **Type Safety:** Full TypeScript support
- **Performance:** Fast cold starts for serverless (Vercel)
- **Developer Experience:** Easy to use, good documentation
- **Learning Value:** Helps understand SQL patterns

---

## 🔍 What is an ORM?

An ORM lets you interact with your database using code instead of raw SQL:

```typescript
// Without ORM (raw SQL)
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  ['danish@example.com']
);

// With ORM (Drizzle)
const user = await db.select().from(users).where(eq(users.email, 'danish@example.com'));
```

---

## 🔍 Options Considered

### Prisma

**How it works:**

```prisma
// prisma/schema.prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
}
```

```typescript
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});
```

**Pros:**
- Amazing developer experience
- Prisma Studio (visual database browser)
- Excellent documentation

**Cons:**
- Bundle size: ~2MB
- Cold start: ~400ms
- Uses Rust query engine (complexity)

**Verdict:** ❌ Too heavy for serverless

---

### Drizzle ⭐ SELECTED

**How it works:**

```typescript
// drizzle/schema.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
});
```

```typescript
const user = await db.select().from(users).where(eq(users.email, 'test@example.com'));
```

**Pros:**
- Bundle size: ~50KB (40x smaller than Prisma!)
- SQL-like syntax (learn real SQL)
- Excellent TypeScript types
- Works on edge/serverless

**Cons:**
- More verbose for complex joins
- Smaller community
- No built-in GUI

**Verdict:** ✅ Perfect for serverless

---

## ⚡ Performance Reality

### The ORM Overhead Myth

A common concern: "ORMs add performance delays"

**Reality:** ORM overhead is negligible compared to actual database operations:

```
Query execution time breakdown:
┌─────────────────────────────────────────────────────────────────┐
│   Network to DB:     ████████████████████████████  50-200ms     │
│   DB Query:          ████████████                   20-100ms     │
│   ORM Overhead:      █                              0.1-2ms      │
│                                                                  │
│   ORM overhead is <1% of total query time!                       │
└─────────────────────────────────────────────────────────────────┘
```

### The Real Performance Issue: Cold Starts

In serverless, the **bundle size** matters more:

```
SERVERLESS COLD START:

Prisma:
├── Load 2MB bundle:     200-500ms
├── Initialize:          100-200ms
├── First query:         50ms
└── TOTAL:               ~400ms

Drizzle:
├── Load 50KB bundle:    10-20ms
├── Initialize:          5-10ms
├── First query:         50ms
└── TOTAL:               ~70ms

Drizzle is 5-6x faster to cold start!
```

---

## 📝 Schema Definition

### Our Database Schema

```typescript
// packages/shared/src/db/schema.ts

import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const workModeEnum = pgEnum('work_mode', ['remote', 'hybrid', 'onsite']);
export const jobTypeEnum = pgEnum('job_type', ['full_time', 'part_time', 'contract', 'internship']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Resumes table (with cached parsed data)
export const resumes = pgTable('resumes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  originalFileName: text('original_file_name'),
  originalFileUrl: text('original_file_url'),
  parsedData: jsonb('parsed_data').$type<ParsedResume>(),  // Cached AI parsing!
  parsedAt: timestamp('parsed_at').defaultNow(),
});

// Jobs table
export const jobs = pgTable('jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  company: text('company').notNull(),
  companyId: text('company_id').references(() => companies.id),
  location: text('location'),
  workMode: workModeEnum('work_mode').notNull(),
  type: jobTypeEnum('type').notNull(),
  description: text('description'),
  requirements: text('requirements'),
  url: text('url').notNull(),
  salary: text('salary'),
  postedAt: timestamp('posted_at'),
  scrapedAt: timestamp('scraped_at').defaultNow(),
});

// Companies table (watchlist)
export const companies = pgTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  careersUrl: text('careers_url').notNull(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User's watched companies
export const userWatchedCompanies = pgTable('user_watched_companies', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: text('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Job matches (cached AI matching results)
export const jobMatches = pgTable('job_matches', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),  // 0-100
  matchedSkills: jsonb('matched_skills').$type<string[]>(),
  missingSkills: jsonb('missing_skills').$type<string[]>(),
  reasoning: text('reasoning'),
  matchedAt: timestamp('matched_at').defaultNow(),
});

// User preferences
export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  workModes: jsonb('work_modes').$type<string[]>().default(['remote', 'hybrid', 'onsite']),
  jobTypes: jsonb('job_types').$type<string[]>().default(['full_time']),
  locations: jsonb('locations').$type<string[]>(),
  minMatchScore: integer('min_match_score').default(70),
  emailNotifications: boolean('email_notifications').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TypeScript types
export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
  }[];
  summary?: string;
}
```

---

## 🔧 Query Examples

### Basic Queries

```typescript
import { db } from '@/lib/db';
import { users, jobs, resumes } from '@/db/schema';
import { eq, desc, gte, and, or } from 'drizzle-orm';

// Select all
const allUsers = await db.select().from(users);

// Select with condition
const user = await db.select().from(users).where(eq(users.email, 'danish@example.com'));

// Select specific columns
const userEmails = await db.select({ email: users.email }).from(users);

// Insert
const [newUser] = await db.insert(users).values({
  email: 'danish@example.com',
  name: 'Danish',
}).returning();

// Update
await db.update(users)
  .set({ name: 'Danish Wadhwa' })
  .where(eq(users.id, userId));

// Delete
await db.delete(users).where(eq(users.id, userId));
```

### Complex Queries

```typescript
// Filter with multiple conditions
const remoteFullTimeJobs = await db
  .select()
  .from(jobs)
  .where(
    and(
      eq(jobs.workMode, 'remote'),
      eq(jobs.type, 'full_time'),
      gte(jobs.postedAt, new Date('2024-01-01'))
    )
  )
  .orderBy(desc(jobs.postedAt))
  .limit(10);

// Join tables
const userWithResume = await db
  .select({
    user: users,
    resume: resumes,
  })
  .from(users)
  .leftJoin(resumes, eq(users.id, resumes.userId))
  .where(eq(users.id, userId));

// Get user's matched jobs with job details
const userMatches = await db
  .select({
    job: jobs,
    match: jobMatches,
  })
  .from(jobMatches)
  .innerJoin(jobs, eq(jobMatches.jobId, jobs.id))
  .where(
    and(
      eq(jobMatches.userId, userId),
      gte(jobMatches.score, 70)
    )
  )
  .orderBy(desc(jobMatches.score));
```

---

## 🆚 Prisma vs Drizzle Comparison

### Same Query: "Get user with their saved jobs"

**Prisma:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { 
    jobMatches: {
      include: { job: true }
    }
  }
});
```

**Drizzle:**
```typescript
const matches = await db
  .select({
    user: users,
    job: jobs,
    score: jobMatches.score,
  })
  .from(users)
  .leftJoin(jobMatches, eq(users.id, jobMatches.userId))
  .leftJoin(jobs, eq(jobMatches.jobId, jobs.id))
  .where(eq(users.id, userId));
```

**Observation:** Prisma is more concise, Drizzle is more explicit (and closer to actual SQL).

---

## ✅ Decision

**Use Drizzle ORM**

### Rationale

1. **Serverless Performance:** 50KB bundle = 70ms cold start (vs Prisma 400ms)
2. **SQL Learning:** SQL-like syntax teaches real database patterns
3. **Type Safety:** Full TypeScript inference from schema
4. **Neon Compatibility:** Works great with Neon PostgreSQL
5. **Edge Ready:** Can use in Vercel Edge Functions if needed

### Consequences

**Positive:**
- Fast cold starts on Vercel
- Learn transferable SQL skills
- Lightweight, focused library

**Negative:**
- More verbose join syntax
- Smaller community (but growing fast)
- No Prisma Studio (use Neon's SQL browser instead)

---

## 📚 Learning Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Drizzle Kit (Migrations)](https://orm.drizzle.team/kit-docs/overview)

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-26 | Initial decision approved |
