# ADR-002b: Backend Architecture - Detailed Discussion

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Decision** | Hybrid Architecture with Python Services |

---

## 📋 Context

We need a backend architecture that handles:

1. **Simple Operations** - User CRUD, preferences, job listings
2. **Heavy Processing** - AI resume parsing (10-60s), job matching
3. **Background Tasks** - Web scraping (1-5 min per company)
4. **Authentication** - Secure user login

### Key Constraints

- **Timeline:** 1 week to MVP
- **Cost:** Minimize (personal use)
- **Learning:** Want to learn ML/AI (Python ecosystem)
- **Scalability:** Must be easy to scale later

---

## 🔍 Options Considered

### Option A: Next.js API Routes Only

**Structure:**
```
apps/web/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User CRUD
│   │   ├── jobs/           # Job queries
│   │   └── parse-resume/   # AI processing (here too)
```

**Pros:**
- Simplest architecture
- One codebase, one deployment
- Free on Vercel

**Cons:**
- Serverless timeout (10s free, 60s pro)
- Can't run long AI processing
- Can't do scheduled scraping

**Verdict:** ❌ Rejected - Timeouts kill AI processing and scraping.

---

### Option B: Hybrid (Next.js + Python Services) ⭐ SELECTED

**Structure:**
```
apps/
├── web/                    # Next.js (TypeScript)
│   └── app/api/            # Auth, simple CRUD
├── ai-service/             # Python (FastAPI)
│   └── src/                # Resume parsing, matching
└── scraper/                # Python (Scrapy + FastAPI)
    └── src/                # Job scraping
```

**Pros:**
- No timeout limits on Python services
- Best ecosystem for each task
- Independent scaling
- Enables ML learning path

**Cons:**
- More services to maintain
- Service-to-service communication

**Verdict:** ✅ Selected - Best balance of capability and complexity.

---

## 🏗️ Final Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS (Vercel - FREE)                       │
│                         TypeScript                               │
│                                                                  │
│  Responsibilities:                                               │
│  ✅ Authentication (NextAuth.js - Google + GitHub)               │
│  ✅ User CRUD (preferences, profile)                             │
│  ✅ Job listings (read from DB)                                  │
│  ✅ Company watchlist management                                 │
│  ✅ Orchestrate calls to Python services                         │
│                                                                  │
│  Why here: Fast operations, no timeout risk, free hosting        │
└─────────────────────────────────────────────────────────────────┘
              │                                    │
              │ Heavy tasks delegated              │
              ▼                                    ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   AI SERVICE             │      │   SCRAPER SERVICE            │
│   Python (FastAPI)       │      │   Python (Scrapy + FastAPI)  │
│   Railway - $0-5/month   │      │   Railway - $0-5/month       │
│                          │      │                              │
│   Responsibilities:      │      │   Responsibilities:          │
│   ✅ Resume parsing      │      │   ✅ Scrape career pages     │
│   ✅ Job matching        │      │   ✅ Handle pagination       │
│   ✅ Skill extraction    │      │   ✅ Rate limiting           │
│                          │      │   ✅ Scheduled jobs          │
│   Why here:              │      │                              │
│   - No timeout limits    │      │   Why here:                  │
│   - Python AI ecosystem  │      │   - Scrapy is industry best  │
│   - Future ML learning   │      │   - Long-running tasks OK    │
└──────────────────────────┘      └──────────────────────────────┘
              │                                    │
              └────────────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  DATABASE (Neon) │
                    │   PostgreSQL     │
                    │   FREE (512MB)   │
                    └──────────────────┘
```

---

## 🔐 Authentication

### Choice: NextAuth.js with Google + GitHub

**Why NextAuth.js:**
- Built specifically for Next.js
- Handles OAuth flow, tokens, sessions
- Secure by default (CSRF, secure cookies)
- Free, open source

**Implementation:**

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
});
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

### Auth Flow

```
User clicks "Login with Google"
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  NextAuth.js handles:                                            │
│  1. Redirect to Google                                           │
│  2. User authenticates                                           │
│  3. Google redirects back with code                              │
│  4. Exchange code for tokens                                     │
│  5. Create/update user in database                               │
│  6. Create session cookie                                        │
│  7. Redirect to dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
User is now authenticated (session in cookie)
```

---

## 🧩 Modular AI Integration

### The Problem

We want to swap AI providers without changing application code:
- Start with OpenAI
- Maybe switch to Claude
- Eventually use our own models

### The Solution: Interface Pattern

```typescript
// packages/shared/src/ai/types.ts

export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary?: string;
}

export interface JobMatch {
  jobId: string;
  score: number;          // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

// ALL AI providers must implement this interface
export interface AIProvider {
  parseResume(text: string): Promise<ParsedResume>;
  matchJob(resume: ParsedResume, job: Job): Promise<JobMatch>;
  extractSkills(text: string): Promise<string[]>;
}
```

### Provider Implementations

```python
# apps/ai-service/src/providers/base.py
from abc import ABC, abstractmethod
from typing import List
from models import ParsedResume, JobMatch, Job

class AIProvider(ABC):
    """Base class for all AI providers"""
    
    @abstractmethod
    async def parse_resume(self, text: str) -> ParsedResume:
        pass
    
    @abstractmethod
    async def match_job(self, resume: ParsedResume, job: Job) -> JobMatch:
        pass
    
    @abstractmethod
    async def extract_skills(self, text: str) -> List[str]:
        pass
```

```python
# apps/ai-service/src/providers/openai_provider.py
from openai import OpenAI
from .base import AIProvider

class OpenAIProvider(AIProvider):
    def __init__(self):
        self.client = OpenAI()
    
    async def parse_resume(self, text: str) -> ParsedResume:
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Parse this resume..."},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        return ParsedResume(**json.loads(response.choices[0].message.content))
```

```python
# apps/ai-service/src/providers/anthropic_provider.py
from anthropic import Anthropic
from .base import AIProvider

class AnthropicProvider(AIProvider):
    def __init__(self):
        self.client = Anthropic()
    
    async def parse_resume(self, text: str) -> ParsedResume:
        response = await self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            messages=[{"role": "user", "content": f"Parse: {text}"}]
        )
        return ParsedResume(**json.loads(response.content[0].text))
```

```python
# apps/ai-service/src/providers/local_provider.py
# FUTURE: Your own trained model!

class LocalModelProvider(AIProvider):
    def __init__(self, model_path: str):
        self.model = load_model(model_path)
    
    async def parse_resume(self, text: str) -> ParsedResume:
        # Run your own model
        result = self.model.predict(text)
        return ParsedResume(**result)
```

### Factory Pattern

```python
# apps/ai-service/src/providers/factory.py
import os
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .local_provider import LocalModelProvider

def create_ai_provider() -> AIProvider:
    provider_type = os.environ.get('AI_PROVIDER', 'openai')
    
    if provider_type == 'openai':
        return OpenAIProvider()
    elif provider_type == 'anthropic':
        return AnthropicProvider()
    elif provider_type == 'local':
        return LocalModelProvider(os.environ['MODEL_PATH'])
    else:
        raise ValueError(f"Unknown provider: {provider_type}")
```

### Switching Providers

```bash
# To switch from OpenAI to Claude:
AI_PROVIDER=anthropic  # Just change this env var!

# To use your own model later:
AI_PROVIDER=local
MODEL_PATH=/path/to/your/model
```

**Zero code changes required!**

---

## 🔒 Service-to-Service Security

### Internal API Key

```
┌─────────────────┐         ┌─────────────────┐
│   Next.js API   │ ──────▶ │   AI Service    │
│                 │         │                 │
│  Headers:       │         │  Validates:     │
│  Authorization: │         │  - API key      │
│  Bearer <key>   │         │  - Request      │
└─────────────────┘         └─────────────────┘
```

**Next.js calling AI Service:**

```typescript
// apps/web/app/api/resume/parse/route.ts
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  // 1. Verify user is authenticated
  const session = await auth();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Get the resume file
  const formData = await request.formData();
  const file = formData.get('resume') as File;
  const text = await extractText(file);
  
  // 3. Call AI service with internal API key
  const response = await fetch(`${process.env.AI_SERVICE_URL}/parse-resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      text,
      userId: session.user.id 
    }),
  });
  
  // 4. Return result to client
  const parsed = await response.json();
  return Response.json(parsed);
}
```

**AI Service validating requests:**

```python
# apps/ai-service/src/main.py
from fastapi import FastAPI, Header, HTTPException
import os

app = FastAPI()

async def verify_internal_key(authorization: str = Header(...)):
    expected = f"Bearer {os.environ['INTERNAL_API_KEY']}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.post("/parse-resume")
async def parse_resume(
    request: ParseRequest,
    _: None = Depends(verify_internal_key)  # Validates every request
):
    result = await ai_provider.parse_resume(request.text)
    return result
```

---

## 📊 Logging & Observability

### Strategy

| Phase | Tool | Purpose |
|-------|------|---------|
| **Now** | Structured logs + Sentry | Console logs, error tracking |
| **Later** | Add Axiom | Centralized log search |

### Structured Logging

```typescript
// packages/shared/src/logger/index.ts
import pino from 'pino';

export function createLogger(component: string) {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service: process.env.SERVICE_NAME,
      component,
      environment: process.env.NODE_ENV,
    },
  });
}

// Usage
const logger = createLogger('resume-parser');
logger.info('Parsing started', { userId: '123', fileSize: 245000 });
logger.error('Parsing failed', { userId: '123', error: err.message });
```

```python
# apps/ai-service/src/logger.py
import logging
import json

class StructuredLogger:
    def __init__(self, service: str, component: str):
        self.service = service
        self.component = component
        self.logger = logging.getLogger(f"{service}.{component}")
    
    def info(self, message: str, **kwargs):
        self._log('INFO', message, kwargs)
    
    def error(self, message: str, **kwargs):
        self._log('ERROR', message, kwargs)
    
    def _log(self, level: str, message: str, extra: dict):
        log_data = {
            'level': level,
            'service': self.service,
            'component': self.component,
            'message': message,
            **extra
        }
        print(json.dumps(log_data))

# Usage
logger = StructuredLogger('ai-service', 'resume-parser')
logger.info('Parsing started', user_id='123', file_size=245000)
```

### Sentry Integration

**Next.js:**
```bash
npx @sentry/wizard@latest -i nextjs
```

**Python:**
```python
import sentry_sdk
sentry_sdk.init(dsn=os.environ['SENTRY_DSN'])
```

### Correlation IDs

Track requests across services:

```typescript
// Next.js generates ID, passes to AI service
const requestId = crypto.randomUUID();

await fetch(AI_SERVICE_URL, {
  headers: {
    'x-request-id': requestId,
  }
});
```

```python
# AI service logs with same ID
@app.post("/parse-resume")
async def parse(request: Request):
    request_id = request.headers.get('x-request-id')
    logger.info('Parsing', request_id=request_id)
```

**Search logs:** `request_id="abc-123"` → See full flow!

---

## 💰 Cost Analysis

| Service | Provider | Free Tier | Paid |
|---------|----------|-----------|------|
| **Next.js** | Vercel | ✅ Generous | $20/mo |
| **Database** | Neon | ✅ 512MB | $19/mo |
| **AI Service** | Railway | ✅ $5 credit | $5-20/mo |
| **Scraper** | Railway | ✅ $5 credit | $5-20/mo |
| **AI APIs** | OpenAI | ❌ Pay-per-use | ~$1-5/mo |
| **Error Tracking** | Sentry | ✅ 5K errors | $26/mo |
| **Logs (later)** | Axiom | ✅ 500GB | $25/mo |

**Personal Use Total: $0-15/month**

---

## 🚀 Future ML Learning Path

This architecture enables your learning journey:

### Phase 1: External APIs (Now)
```
Your App → OpenAI API → Response
```

### Phase 2: Try Different Providers
```
Your App → Claude API → Response
(Just change AI_PROVIDER env var)
```

### Phase 3: Run Open-Source Models
```
Your App → Ollama (Llama 3) → Response
(Add LocalOllamaProvider)
```

### Phase 4: Train Custom Models
```
Your App → Your PyTorch Model → Response
(Add CustomModelProvider)
```

All possible because of the modular interface pattern!

---

## ✅ Decision Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Architecture** | Hybrid | Balance simplicity & capability |
| **Auth** | NextAuth (Google + GitHub) | Built for Next.js, secure, free |
| **AI Service** | Python (FastAPI) | ML ecosystem, future learning |
| **Scraper** | Python (Scrapy) | Industry best for scraping |
| **AI Integration** | Interface pattern | Swap providers easily |
| **Logging** | Structured + Sentry | Debug across services |
| **Communication** | HTTP/JSON + Internal API key | Simple, secure |

---

## 📚 Learning Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Scrapy Documentation](https://scrapy.org/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-26 | Initial decision approved |
