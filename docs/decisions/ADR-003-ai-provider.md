# ADR-003: AI Provider

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Deciders** | Danish       |

---

## Decision

**OpenAI GPT-4o-mini as default, with configurable/swappable provider architecture**

---

## Context

Need AI capabilities for:
- Resume parsing (extract structured data)
- Job matching (compare resume to jobs)
- Skill extraction

Requirements:
- Reliable JSON output
- Low cost (personal use)
- Easy to swap providers in future

---

## Options Considered

| Provider | Model | Monthly Cost (₹) | Verdict |
|----------|-------|------------------|---------|
| **OpenAI** | GPT-4o-mini | ₹13 | ✅ Selected |
| Anthropic | Claude Haiku | ₹19 | Good alternative |
| Google | Gemini Flash | ₹7 | Cheapest, less reliable |
| Groq | Llama 3 70B | ₹34 | Fastest, open source |

---

## Key Benefits

| Feature | Benefit |
|---------|---------|
| **Native JSON Mode** | Guaranteed valid JSON (no parsing errors) |
| **Low cost** | ₹0.06 per resume, ₹0.02 per match |
| **Best documentation** | Easy to implement |
| **Configurable** | Swap providers via environment variable |

---

## Caching Strategy

```
Parse resume ONCE → Save JSON to DB → Reuse for all job matches

Without caching: ₹8 for 100 matches
With caching:    ₹2.06 for 100 matches (74% savings!)
```

---

## Configurable Architecture

```bash
# Change provider with environment variable
AI_PROVIDER=openai      # Default
AI_PROVIDER=anthropic   # Switch to Claude
AI_PROVIDER=groq        # Switch to Llama
AI_PROVIDER=local       # Future: your own model
```

---

## Consequences

### Positive
- ✅ Reliable JSON output (no parsing errors)
- ✅ Very affordable (₹13/month)
- ✅ Easy to swap providers later
- ✅ Caching reduces costs by 74%

### Negative
- ⚠️ Dependency on external API
- ⚠️ API costs (though minimal)

---

## Related Documents

- 📖 [Detailed Discussion](./ADR-003-ai-provider-discussion.md) - Full analysis, token explanation, provider comparison
