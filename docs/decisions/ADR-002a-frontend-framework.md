# ADR-002a: Frontend Framework

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Deciders** | Danish       |

---

## Decision

**Next.js 14 with App Router**

---

## Context

Building a job alerter dashboard that needs:
- Fast initial page loads
- SEO for public pages
- User authentication
- Interactive filtering and forms
- Secure handling of API keys and secrets

---

## Options Considered

| Option | Verdict |
|--------|---------|
| Next.js 14 (App Router) | ✅ **Selected** |
| Remix | ❌ Smaller ecosystem, not Vercel-native |
| React + Vite | ❌ No SSR, need separate backend |
| Astro | ❌ Content-focused, not ideal for interactive apps |
| SvelteKit | ❌ Would need to learn Svelte |

---

## Key Benefits

| Feature | Benefit for Our App |
|---------|---------------------|
| **Server Components** | Faster initial load, smaller JS bundle |
| **Vercel deployment** | Zero-config deploy (we have Vercel account) |
| **API Routes** | Handle simple backend logic without separate server |
| **Hybrid rendering** | Server for data, Client for interactivity |
| **Security** | API keys stay on server, never exposed to browser |

---

## Rendering Strategy

| Component Type | When to Use | Example in Our App |
|----------------|-------------|-------------------|
| **Server Component** | Data fetching, static content | Job listings, Dashboard stats |
| **Client Component** | User interactions, browser APIs | Job filters, Resume upload form |

---

## Caching Strategy

| Content | Cache Duration | Reason |
|---------|---------------|--------|
| Landing page | Forever (until deploy) | Static, same for all |
| Job listings | 5-15 minutes | Changes moderately |
| Market stats | 5 minutes | Shared across users |
| User's matched jobs | No cache / Per-user | Personalized |
| User preferences | No cache | User-specific |

---

## Consequences

### Positive
- ✅ Fast initial page loads (Server Components)
- ✅ Secure (secrets stay on server)
- ✅ SEO-friendly (full HTML sent to browser)
- ✅ Industry standard (good for learning/resume)
- ✅ Seamless Vercel deployment

### Negative
- ⚠️ Learning curve for App Router concepts
- ⚠️ More "magic" than plain React
- ⚠️ Need to understand Server vs Client Components

---

## Related Documents

- 📖 [Detailed Discussion](./ADR-002a-frontend-framework-discussion.md) - Full analysis of SSR vs CSR, caching strategies, and security implications
