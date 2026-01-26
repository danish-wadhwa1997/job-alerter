# ADR-002b: Backend Architecture

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Deciders** | Danish       |

---

## Decision

**Hybrid Architecture: Next.js API Routes + Separate Python Services**

---

## Context

Building a job alerter with:
- User authentication
- CRUD operations (users, preferences, watchlists)
- Heavy AI processing (resume parsing, job matching)
- Web scraping (company career pages)

Need to balance simplicity, cost, and scalability.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS (Vercel - FREE)                       │
│                    Auth + Simple API                             │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   AI SERVICE (Python)    │      │   SCRAPER SERVICE (Python)   │
│   FastAPI                │      │   Scrapy + FastAPI           │
│   Railway - $0-5/month   │      │   Railway - $0-5/month       │
└──────────────────────────┘      └──────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  DATABASE (Neon) │
                    └──────────────────┘
```

---

## Service Responsibilities

| Service | Language | Responsibilities | Deploy |
|---------|----------|------------------|--------|
| **Next.js** | TypeScript | Auth, CRUD, simple queries | Vercel (free) |
| **AI Service** | Python | Resume parsing, job matching | Railway |
| **Scraper** | Python | Job scraping, scheduling | Railway |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth** | NextAuth.js (Google + GitHub) | Built for Next.js, secure, free |
| **AI Service Language** | Python | Best ML/AI ecosystem, future learning |
| **Scraper Language** | Python | Best scraping ecosystem (Scrapy) |
| **AI Integration** | Modular (interface pattern) | Swap providers without code changes |
| **Logging** | Structured + Sentry | Centralized error tracking |
| **Service Communication** | HTTP/JSON | Simple, language-agnostic |

---

## Cost Estimate

| Service | Provider | Cost |
|---------|----------|------|
| Next.js + Auth | Vercel | FREE |
| Database | Neon | FREE (512MB) |
| AI Service | Railway | FREE / $5 |
| Scraper | Railway | FREE / $5 |
| AI APIs | OpenAI/Anthropic | ~$1-5/month |
| **Total** | | **$0-15/month** |

---

## Consequences

### Positive
- ✅ Free tier covers personal use
- ✅ No serverless timeouts for heavy processing
- ✅ Modular AI (swap OpenAI ↔ Claude ↔ local models)
- ✅ Python services enable ML learning path
- ✅ Independent scaling per service

### Negative
- ⚠️ Multiple services to maintain
- ⚠️ Need to handle service-to-service auth
- ⚠️ More deployment configuration

---

## Related Documents

- 📖 [Detailed Discussion](./ADR-002b-backend-architecture-discussion.md) - Full analysis, code examples, security patterns
