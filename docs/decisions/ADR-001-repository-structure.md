# ADR-001: Repository Structure

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Deciders** | Danish       |

---

## Decision

**Monorepo with pnpm workspaces + publishable packages**

---

## Context

Building Job Alerter with multiple components (frontend, backend, scraper, shared code). Need to decide between monorepo vs multi-repo structure.

---

## Options Considered

| Option | Verdict |
|--------|---------|
| A. Pure Monorepo | ❌ Doesn't meet learning goals (npm publishing) |
| B. Pure Multi-Repo | ❌ Too much overhead for 1-week timeline |
| C. Git Submodules | ❌ Complex, error-prone, avoid |
| D. Monorepo + Published Packages | ✅ **Selected** |

---

## Final Structure

```
job-alerter/
├── apps/
│   ├── web/          # Frontend → Vercel
│   ├── api/          # Backend → Railway/Render
│   └── scraper/      # Scraper → Railway/Render
├── packages/
│   └── shared/       # → Published to npm as @job-alerter/shared
├── docs/
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Key Technologies

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager with strict isolation |
| **Turborepo** | Monorepo build orchestration |
| **workspace:\*** | Local package linking during development |

---

## Consequences

### Positive
- ✅ Fast development (local linking)
- ✅ Type safety across all apps
- ✅ Learn npm publishing workflow
- ✅ Industry-standard pattern (React, Vue, Babel)
- ✅ Achievable in 1-week timeline

### Negative
- ⚠️ Need to learn pnpm workspaces
- ⚠️ Slightly more complex initial setup

---

## Related Documents

- 📖 [Detailed Discussion](./ADR-001-repository-structure-discussion.md) - Full pros/cons analysis, pnpm deep-dive, and learning notes
