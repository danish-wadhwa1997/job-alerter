# ADR-002a: Frontend Framework - Detailed Discussion

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Decision** | Next.js 14 with App Router |

---

## 📋 Context

We need a frontend framework for Job Alerter that can:
- Render a dashboard for managing job preferences
- Display job listings with filtering
- Handle resume uploads
- Authenticate users
- Keep API keys and secrets secure

### Key Constraints

- **Timeline:** 1 week to MVP
- **Deployment:** We have a Vercel account
- **Background:** Strong in React, learning backend
- **Security:** Must not expose API keys to browser

---

## 🔍 Options Considered

### Next.js 14 (App Router) ⭐ SELECTED

**What is it?**
The most popular React framework. Version 14 uses the "App Router" with React Server Components (RSC).

**Pros:**

| Benefit | Explanation |
|---------|-------------|
| Server Components | Components render on server by default → smaller JS bundle |
| Vercel deployment | Zero-config deployment, made by same company |
| File-based routing | Create `app/jobs/page.tsx` → automatically get `/jobs` route |
| API Routes | Can handle simple backend logic without separate server |
| Huge ecosystem | Most tutorials, Stack Overflow answers, libraries |
| Industry standard | Used by Netflix, TikTok, Twitch → great for resume |
| TypeScript first | Excellent TS support out of the box |

**Cons:**

| Drawback | Explanation |
|----------|-------------|
| Learning curve | App Router is new, Server vs Client Components take time |
| Complexity | More "magic" happening behind the scenes |
| Frequent changes | Next.js evolves fast; patterns change between versions |

---

### Remix

**What is it?**
A React framework focused on web standards (forms, HTTP caching).

**Pros:**
- Simpler mental model, less "magic"
- Great data loading patterns
- Progressive enhancement (works without JS)

**Cons:**
- Smaller ecosystem
- Not Vercel-native (needs more config)
- No Server Components (uses different approach)

**Verdict:** ❌ Good framework, but smaller ecosystem and not optimal for Vercel.

---

### React + Vite

**What is it?**
Plain React with Vite as the build tool. No framework.

**Pros:**
- Simplest option
- Fast dev server
- Full control

**Cons:**
- No SSR (client-side only)
- Need separate backend
- Manual routing setup

**Verdict:** ❌ No server rendering means slower initial load and no SEO.

---

### Astro

**What is it?**
Content-focused framework that ships zero JavaScript by default.

**Pros:**
- Extremely fast (zero JS by default)
- Multi-framework support

**Cons:**
- Best for blogs, docs, marketing sites
- Not ideal for interactive dashboards

**Verdict:** ❌ Wrong tool for an interactive application.

---

## 🖥️ Deep Dive: Server vs Client Rendering

### The Question That Came Up

> "How is server rendering faster when the server has to render for multiple clients, while client rendering uses the client's own device?"

This is a great question with a nuanced answer.

---

### What "Faster" Actually Means

| Metric | What It Measures |
|--------|------------------|
| **Time to First Byte (TTFB)** | How long until browser receives first data |
| **First Contentful Paint (FCP)** | How long until user sees something |
| **Time to Interactive (TTI)** | How long until user can interact |

**Server rendering is faster for FCP (user sees content quickly).**
**Client rendering can be faster for subsequent interactions.**

---

### The Waterfall Problem (Why CSR Feels Slow)

**Traditional Client-Side Rendering:**

```
Browser                                              Server
   │                                                    │
   │─────── 1. Request HTML ──────────────────────────▶│
   │◀────── 2. Empty HTML shell (tiny) ────────────────│
   │                                                    │
   │─────── 3. Request JavaScript bundle (500KB) ─────▶│
   │◀────── 4. Download JavaScript ────────────────────│
   │                                                    │
   │  [Parse & Execute JavaScript]                      │
   │                                                    │
   │─────── 5. Fetch user data (API call) ────────────▶│
   │◀────── 6. Return user data ───────────────────────│
   │                                                    │
   │─────── 7. Fetch jobs data (API call) ────────────▶│
   │◀────── 8. Return jobs data ───────────────────────│
   │                                                    │
   │  [React renders UI with data]                      │
   │                                                    │
   ▼  USER FINALLY SEES CONTENT                         │
   
Total time: 2-4 seconds (each step waits for previous)
```

**Server-Side Rendering:**

```
Browser                                              Server
   │                                                    │
   │─────── 1. Request page ──────────────────────────▶│
   │                                                    │
   │                    [Server does ALL the work]:     │
   │                    - Fetch user data (5ms)         │
   │                    - Fetch jobs data (5ms)         │
   │                    - Render complete HTML          │
   │                                                    │
   │◀────── 2. Complete HTML with data ────────────────│
   │                                                    │
   │  USER SEES CONTENT IMMEDIATELY                     │
   │                                                    │
   │─────── 3. Small JS for interactivity ────────────▶│
   │◀────── 4. Hydration JS ───────────────────────────│
   │                                                    │
   ▼  PAGE IS NOW INTERACTIVE                           │

Total time: 0.5-1 second
```

---

### Why Server is Faster for Data Fetching

**The Key: Network Distance**

```
User in India ──── 200ms ────▶ Server in USA ──── 5ms ────▶ Database
                                    │
                               (Same data center!)
```

**Client-side fetch:** User → Server → Database → Server → User = **410ms per API call**

**Server-side fetch:** Server → Database (5ms) → render → User = **~200ms total**

---

## 🗄️ Caching Strategies (The Server Capacity Question)

### The Concern

> "If server has to render for multiple users, won't that use too much server capacity?"

**Answer:** Yes, but caching solves this.

---

### Types of Caching in Next.js

#### 1. Static Rendering (Full Cache)

```typescript
// Built ONCE at deploy time, cached forever
export default function AboutPage() {
  return <div>About our company...</div>;
}
// Result: Zero server CPU per request
```

#### 2. Time-Based Revalidation

```typescript
// Cache for 5 minutes, then regenerate
export const revalidate = 300;

async function JobsPage() {
  const jobs = await fetchJobs();
  return <JobList jobs={jobs} />;
}
// Result: Server renders once every 5 minutes, not every request
```

#### 3. Dynamic Rendering (No Cache)

```typescript
// Fresh render for every request (personalized content)
import { auth } from '@/lib/auth';

async function DashboardPage() {
  const user = await auth();  // Who is logged in?
  const jobs = await getJobsForUser(user.id);  // User-specific
  return <JobList jobs={jobs} />;
}
// Result: Server renders fresh each time
```

---

### Handling Personalized Content

> "If jobs are personalized per user, caching is invalid, right?"

**Correct!** But we use these strategies:

#### Strategy 1: Partial Caching

```typescript
export default async function DashboardPage() {
  const user = await auth();
  
  return (
    <div>
      {/* CACHED - Same for all users */}
      <Header />
      <MarketStats />  {/* "10,234 jobs available" */}
      
      {/* NOT CACHED - User specific */}
      <Suspense fallback={<JobsSkeleton />}>
        <UserJobs userId={user.id} />
      </Suspense>
      
      {/* CACHED - Same for all users */}
      <PopularCompanies />
    </div>
  );
}
// Result: Cache 70% of page, render 30% dynamically
```

#### Strategy 2: Data-Level Caching

```typescript
async function DashboardPage() {
  const user = await auth();
  
  // CACHED: All jobs (same for everyone)
  const allJobs = await getAllJobs();  // Cached 5 min
  
  // NOT CACHED: User preferences
  const prefs = await getUserPreferences(user.id);
  
  // COMPUTED: Filter on server
  const matched = filterJobsForUser(allJobs, prefs);
  
  return <JobList jobs={matched} />;
}
// Result: Expensive job query cached, cheap filtering per request
```

#### Strategy 3: Per-User Caching

```typescript
import { unstable_cache } from 'next/cache';

const getUserMatches = unstable_cache(
  async (userId) => {
    return await computeAIMatches(userId);
  },
  ['user-matches'],
  { revalidate: 3600, tags: [`user-${userId}`] }
);

// Result: AI matching cached per user for 1 hour
```

---

### Visual: What Gets Cached in Our App

```
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD PAGE                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  HEADER                                      [CACHED]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  MARKET STATS                               [CACHED]    │ │
│ │  "10,234 jobs available"                    (5 min)     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  YOUR MATCHED JOBS                          [DYNAMIC]   │ │
│ │  Based on YOUR skills                       (per user)  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  POPULAR COMPANIES                          [CACHED]    │ │
│ │                                              (24 hours)  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Server work per request: ~50-200ms (instead of 500ms+ all dynamic)
```

---

## 🔐 Security Benefits of Server Components

### The Problem with Client Components

```typescript
// ❌ BAD: Client Component
'use client';

function JobFetcher() {
  const res = await fetch('https://api.jobs.com/search', {
    headers: {
      'Authorization': 'Bearer sk_secret_key_123'  // EXPOSED!
    }
  });
}
// User opens DevTools → Network tab → sees API key!
```

### The Solution: Server Components

```typescript
// ✅ GOOD: Server Component (no 'use client')
async function JobFetcher() {
  const res = await fetch('https://api.jobs.com/search', {
    headers: {
      'Authorization': `Bearer ${process.env.JOBS_API_KEY}`  // SAFE!
    }
  });
  return <JobList jobs={await res.json()} />;
}
// User only sees rendered HTML, never the API key
```

### Security Comparison

| Risk | Client Component | Server Component |
|------|-----------------|------------------|
| API keys exposed | ⚠️ Visible in browser | ✅ Hidden on server |
| Database credentials | ❌ Can't use | ✅ Safe to use |
| Business logic | ⚠️ Visible in bundle | ✅ Hidden |
| User data leaks | ⚠️ Must filter carefully | ✅ Filter on server |

---

## 🎯 Component Strategy for Job Alerter

| Page/Feature | Rendering | Why |
|--------------|-----------|-----|
| Landing page | Server | SEO, fast load, cacheable |
| Job listings | Server | Data fetch from DB, cacheable |
| Job filters | Client | User interaction (dropdowns) |
| Dashboard stats | Server | Data fetch, can cache |
| Resume upload | Client | File input, progress bar |
| Preferences form | Client | Form state, validation |
| Auth forms | Client | Form handling |

---

## ✅ Decision

**Use Next.js 14 with App Router**

### Rationale

1. **Performance:** Server Components eliminate waterfall, faster initial load
2. **Security:** API keys and secrets stay on server
3. **Caching:** Partial caching + data caching reduce server load
4. **Deployment:** Seamless Vercel integration
5. **Ecosystem:** Largest React framework ecosystem
6. **Learning:** Industry standard, valuable skill

### Consequences

**Positive:**
- Fast initial page loads
- Secure handling of secrets
- SEO-friendly
- Great developer experience
- Industry-standard patterns

**Negative:**
- Need to learn Server vs Client Component concepts
- More abstraction than plain React
- Patterns may change in future versions

---

## 📚 Learning Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-26 | Initial decision approved |
