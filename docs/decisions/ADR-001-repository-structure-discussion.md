# ADR-001: Repository Structure

| **Status**      | ✅ Approved |
|-----------------|-------------|
| **Date**        | 2026-01-26  |
| **Decision**    | Monorepo with pnpm workspaces + publishable packages |

---

## 📋 Context

We are building **Job Alerter**, a personal job monitoring tool with the following components:

1. **Frontend (web)** - User dashboard for managing preferences and viewing jobs
2. **Backend (api)** - Handles business logic, database operations
3. **Scraper** - Crawls company career pages for new job postings
4. **Shared** - Common types, utilities, constants used across all components

### Key Constraints

- **Timeline:** 1 week to MVP
- **Team size:** Solo developer
- **Learning goals:** Want to learn npm publishing, professional patterns
- **Future scaling:** Architecture should support easy scaling later
- **Tech stack:** JavaScript/TypeScript

### The Question

> Should these components live in one repository (monorepo) or separate repositories (multi-repo)?

---

## 🔍 Options Considered

### Option A: Monorepo (Single Repository)

**Structure:**

```
job-alerter/
├── apps/
│   ├── web/          # Frontend (Next.js)
│   ├── api/          # Backend API
│   └── scraper/      # Scraping service
├── packages/
│   └── shared/       # Shared types, utilities
├── docs/
└── package.json
```

**Pros:**

| Benefit | Explanation |
|---------|-------------|
| Shared code easily | Types, utilities used everywhere without publishing packages |
| Atomic changes | Change API + Frontend in one commit - no version mismatches |
| Simpler setup | One `git clone`, one `npm install` |
| Easier refactoring | Rename a shared type → IDE updates all usages |
| Single source of truth | All code versioned together |
| Faster development | Minimal setup overhead for 1-week timeline |
| Learning-friendly | See how everything connects |

**Cons:**

| Drawback | Explanation |
|----------|-------------|
| Deployment coupling | Deploying one app might trigger CI for all (solvable) |
| Repo size grows | Over years, repo can get large (not a concern at our scale) |
| Team scaling | Multiple teams can conflict (not relevant - solo dev) |
| Different deploy targets | Complex config if apps need different hosting |

---

### Option B: Multi-Repo (Separate Repositories)

**Structure:**

```
job-alerter-web/       # Frontend repo
job-alerter-api/       # Backend repo
job-alerter-scraper/   # Scraper repo
job-alerter-shared/    # Shared types (published as npm package)
```

**Pros:**

| Benefit | Explanation |
|---------|-------------|
| Independent deployment | Deploy frontend without touching backend |
| Clear boundaries | Forces thinking about API contracts upfront |
| Scale with teams | Different teams own different repos |
| Technology flexibility | Scraper could be Python, API could be Go |
| Smaller CI/CD scope | Each repo runs only its own tests |

**Cons:**

| Drawback | Explanation |
|----------|-------------|
| Shared code is painful | Need to publish npm package, manage versions |
| Cross-repo changes | Multiple PRs for one feature |
| More infrastructure | More repos, CI configs, deployment pipelines |
| Version hell | "Frontend v1.3 requires API v2.1 and shared v1.8" |
| Setup overhead | Clone multiple repos, link them locally |
| Slower iteration | Significant overhead for 1-week sprint |

---

### Option C: Git Submodules ❌

Multiple separate Git repos linked in a parent repo.

**Verdict:** Rejected. Submodules are notoriously confusing, have weird git states, and cause more problems than they solve. Even experienced developers avoid them.

---

### Option D: Monorepo with Published Packages ⭐ (SELECTED)

This is how **React, Vue, Babel, and Lodash** work.

**Structure:**

```
job-alerter/                    # Single Git repo
├── apps/
│   ├── web/                    # Deployed to Vercel (NOT published to npm)
│   ├── api/                    # Deployed to Railway (NOT published to npm)
│   └── scraper/                # Deployed to Railway (NOT published to npm)
├── packages/
│   └── shared/                 # PUBLISHED to npm as @job-alerter/shared
├── docs/
├── pnpm-workspace.yaml
└── package.json
```

**How it works:**

- `apps/*` = Deployable applications (never published to npm)
- `packages/*` = Libraries that CAN be published to npm
- During development: Everything links locally (instant updates)
- For production: `packages/shared` is published to npm

**Why this is the best of both worlds:**

| Your Goal | How This Option Achieves It |
|-----------|----------------------------|
| Learn npm publishing | Publish `@job-alerter/shared` package |
| Independent deployments | Each app deploys separately from its folder |
| Clean separation | Strict boundaries between apps and packages |
| Fast development | Local linking = instant updates during dev |
| Real-world pattern | This is how major open-source projects work |
| 1-week timeline | No multi-repo coordination overhead |

---

## 📦 Deep Dive: How pnpm Workspaces Work

### Why pnpm Over npm?

| Aspect | npm (v3+) | pnpm |
|--------|-----------|------|
| Storage | Per-project (duplicates everywhere) | Global store (each version once) |
| Disk usage | High (same package in every project) | Low (shared across projects) |
| Install speed | Slower (downloads every time) | Fast (links from store) |
| Phantom dependencies | ⚠️ Allowed (dangerous!) | ❌ Blocked (safe!) |
| Isolation | Weak (hoisting) | Strong (symlinks) |

### The "Phantom Dependency" Problem (npm)

```
project/
├── package.json          # Declares: react, some-library
├── node_modules/
│   ├── react/            # Your dependency ✅
│   ├── some-library/     # Your dependency ✅
│   ├── lodash/           # 🤔 You didn't install this!
│   └── axios/            # 🤔 You didn't install this either!
```

npm "hoists" dependencies to save space, but this means your code can import packages you didn't declare. This breaks when dependencies change.

### pnpm's Solution: Strict Isolation

```
~/.pnpm-store/              # GLOBAL store
├── lodash@4.17.21/
├── react@18.2.0/
└── ...

project/node_modules/
├── react → store/react@18.2.0       ✅ Can access (declared)
└── (lodash is NOT here)              ❌ Cannot access (not declared)
```

pnpm creates symlinks only for declared dependencies. You cannot import undeclared packages.

### Multiple Versions Are Supported

**Myth:** "pnpm only allows one version of a package"

**Reality:** pnpm stores each *unique version* once, but different projects can use different versions.

```
~/.pnpm-store/
├── zod@3.22.0/           # Stored once
└── zod@3.20.0/           # Stored once (different version)

apps/web/node_modules/
└── zod → store/zod@3.22.0    # Web gets 3.22

apps/api/node_modules/
└── zod → store/zod@3.20.0    # API gets 3.20
```

No conflict! Each package gets exactly what it declared.

---

## 🔗 How Local Linking Works

### The `workspace:*` Protocol

In `apps/web/package.json`:

```json
{
  "dependencies": {
    "@job-alerter/shared": "workspace:*"
  }
}
```

| Environment | What Happens |
|-------------|--------------|
| During development | Symlink: `node_modules/@job-alerter/shared` → `packages/shared/` |
| When you publish | `workspace:*` replaced with actual version like `^1.0.0` |

### The Developer Experience

```typescript
// apps/web/src/components/JobCard.tsx
import { Job, formatSalary } from '@job-alerter/shared';

// This resolves to: packages/shared/src/index.ts
// Changes in shared are INSTANTLY available - no npm publish needed!
```

Edit `packages/shared` → Save → Web app sees changes immediately.

---

## 🎯 Type Safety Across Entire System

```
┌─────────────────────────────────────────────────────────────────┐
│                    @job-alerter/shared                          │
│                    ┌──────────────┐                             │
│                    │  Job type    │                             │
│                    └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
           ↓                    ↓                    ↓
    ┌──────────┐         ┌──────────┐         ┌──────────┐
    │  Scraper │         │   API    │         │   Web    │
    │ outputs  │ ──────▶ │ stores & │ ──────▶ │ displays │
    │   Job    │         │  serves  │         │   Job    │
    └──────────┘         │   Job    │         └──────────┘
                         └──────────┘
```

If you add a field to `Job` type in shared:

- **Scraper:** TypeScript error until you provide the new field
- **API:** TypeScript error until you handle the new field
- **Web:** TypeScript shows the new field is available

**One type change = entire system stays in sync!**

---

## 📁 Final Repository Structure

```
job-alerter/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   ├── package.json              # Deps: react, next, @job-alerter/shared
│   │   └── tsconfig.json
│   │
│   ├── api/                          # Backend API
│   │   ├── src/
│   │   ├── package.json              # Deps: hono, drizzle, @job-alerter/shared
│   │   └── tsconfig.json
│   │
│   └── scraper/                      # Job scraper
│       ├── src/
│       ├── package.json              # Deps: playwright, @job-alerter/shared
│       └── tsconfig.json
│
├── packages/
│   └── shared/                       # Published to npm
│       ├── src/
│       │   ├── types/                # Job, User, Resume types
│       │   ├── utils/                # Shared utilities
│       │   ├── constants/            # Work modes, job types
│       │   └── index.ts              # Public exports
│       ├── package.json              # Name: @job-alerter/shared
│       └── tsconfig.json
│
├── docs/
│   └── decisions/
│       ├── ADR-001-repository-structure.md  # This file
│       └── ...
│
├── pnpm-workspace.yaml               # Defines workspace packages
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace config
└── README.md
```

---

## ✅ Decision

**Use Monorepo with pnpm workspaces + publishable packages (Option D)**

### Consequences

**Positive:**

- Fast local development with instant updates
- Type safety across all components
- Learn npm publishing by publishing `@job-alerter/shared`
- Follows industry pattern (React, Vue, Babel)
- Clean boundaries enable future extraction if needed
- Achievable in 1-week timeline

**Negative:**

- Need to learn pnpm workspaces + Turborepo
- Slightly more complex initial setup than single app

### Mitigation for Multi-Repo Benefits

| Multi-Repo Benefit | How We Achieve It |
|-------------------|-------------------|
| Independent deployment | Vercel/Railway watch specific `apps/*` folders |
| Clear boundaries | No cross-app imports except through `packages/` |
| Future team scaling | Clean package boundaries make extraction easy |

---

## 📚 Learning Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Publishing npm Packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Changesets for Versioning](https://github.com/changesets/changesets)

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-26 | Initial decision approved |
