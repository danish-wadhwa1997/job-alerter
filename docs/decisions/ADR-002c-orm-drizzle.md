# ADR-002c: ORM - Drizzle

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Deciders** | Danish       |

---

## Decision

**Drizzle ORM for database interactions**

---

## Context

Need an ORM/query builder for PostgreSQL (Neon) that:
- Works well with serverless (Vercel)
- Provides type safety with TypeScript
- Has good developer experience
- Minimal bundle size for fast cold starts

---

## Options Considered

| Option | Verdict |
|--------|---------|
| **Drizzle** | ✅ Selected - Lightweight, SQL-like, serverless-optimized |
| **Prisma** | ❌ Heavy bundle size (~2MB), slower cold starts |
| **Kysely** | ❌ No built-in migrations |
| **Raw SQL** | ❌ No type safety |

---

## Key Benefits

| Feature | Benefit |
|---------|---------|
| **50KB bundle** | Fast serverless cold starts (vs Prisma 2MB) |
| **SQL-like syntax** | Learn real SQL patterns |
| **Full TypeScript** | Types inferred from schema |
| **Edge-ready** | Works on Cloudflare Workers, Vercel Edge |
| **No code generation** | Types come from schema directly |

---

## Performance Impact

| Metric | Drizzle | Prisma |
|--------|---------|--------|
| **Cold start** | ~70ms | ~400ms |
| **Query overhead** | ~0.2ms | ~0.5ms |
| **Bundle size** | 50KB | 2MB |

---

## Consequences

### Positive
- ✅ Fast serverless cold starts
- ✅ Learn real SQL patterns
- ✅ Lightweight bundle
- ✅ Excellent TypeScript types

### Negative
- ⚠️ Manual joins (more explicit code)
- ⚠️ No GUI like Prisma Studio (but Neon has one)
- ⚠️ Smaller community than Prisma

---

## Related Documents

- 📖 [Detailed Discussion](./ADR-002c-orm-drizzle-discussion.md)
