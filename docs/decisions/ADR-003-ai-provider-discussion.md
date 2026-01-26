# ADR-003: AI Provider - Detailed Discussion

| **Status**   | ✅ Approved  |
|--------------|--------------|
| **Date**     | 2026-01-26   |
| **Decision** | OpenAI GPT-4o-mini (configurable architecture) |

---

## 📋 Context

We need AI capabilities for:

1. **Resume Parsing:** Extract structured data from resumes
2. **Job Matching:** Compare resume skills to job requirements
3. **Skill Extraction:** Identify skills from text

### Key Requirements

- **Reliable JSON output:** We need structured data, not prose
- **Affordable:** Personal use, minimal budget
- **Configurable:** Ability to swap providers without code changes
- **Future-proof:** Enable learning path to custom models

---

## 🧠 Understanding AI: Tokens Explained

### What Are Tokens?

AI models break text into small pieces called **tokens**:

```
Text:         "Hello, how are you?"
Tokens:       ["Hello", ",", " how", " are", " you", "?"]
Token Count:  6 tokens
```

### Rule of Thumb

```
~4 characters ≈ 1 token
~0.75 words ≈ 1 token
1000 tokens ≈ 750 words ≈ 1.5 pages
```

### Why Tokens Matter

AI providers charge per token:
- **Input tokens:** What you send (resume + prompt)
- **Output tokens:** What AI generates (parsed result)
- Output tokens cost more (4x) because they require more computation

---

## 💰 Cost Analysis (in Rupees)

**Exchange Rate:** 1 USD = ₹83

### Pricing Per Million Tokens

| Provider | Model | Input (₹/1M) | Output (₹/1M) |
|----------|-------|-------------|---------------|
| **OpenAI** | GPT-4o-mini | ₹12.45 | ₹49.80 |
| **OpenAI** | GPT-4o | ₹207.50 | ₹830.00 |
| **Anthropic** | Claude Haiku | ₹20.75 | ₹103.75 |
| **Anthropic** | Claude Sonnet | ₹249.00 | ₹1,245.00 |
| **Google** | Gemini Flash | ₹6.23 | ₹24.90 |
| **Groq** | Llama 3 70B | ₹48.97 | ₹65.57 |

### Cost Per Operation

| Operation | Tokens | GPT-4o-mini (₹) |
|-----------|--------|-----------------|
| **Resume parsing** | 1500 in, 800 out | ₹0.06 |
| **Job matching** | 800 in, 200 out | ₹0.02 |
| **Skill extraction** | 500 in, 100 out | ₹0.01 |

### Monthly Estimates (Personal Use)

| Scenario | GPT-4o-mini (₹) |
|----------|-----------------|
| 50 resume parses | ₹3 |
| 500 job matches | ₹10 |
| **Total** | **₹13/month** |

**Your AI costs = Less than a cup of chai! 🍵**

---

## 🔑 Critical Feature: JSON Mode

### The Problem Without JSON Mode

```typescript
// AI might return:
"Based on the resume provided, I can see this is John Doe...

```json
{
  "name": "John Doe",
  ...
}
```

Let me know if you need anything else!"

// ❌ This is NOT valid JSON! Your code breaks.
```

### The Solution: Native JSON Mode

```typescript
// With OpenAI JSON Mode
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  response_format: { type: 'json_object' },  // ← Magic!
  messages: [...]
});

// AI returns ONLY:
{
  "name": "John Doe",
  "email": "john@example.com",
  ...
}

// ✅ Guaranteed valid JSON. No parsing errors!
```

### JSON Mode Support

| Provider | JSON Mode | Reliability |
|----------|-----------|-------------|
| **OpenAI** | ✅ Native | ✅✅ Guaranteed |
| **Anthropic** | ❌ None | 🟡 Usually works (95%) |
| **Google** | ✅ Native | ✅ Good |
| **Groq** | ✅ Native | ✅ Good |

---

## 💾 Caching Strategy (Key Optimization!)

### The Smart Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARSE ONCE, REUSE FOREVER                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User uploads resume                                             │
│          ↓                                                       │
│  AI parses resume → JSON (cost: ₹0.06)                          │
│          ↓                                                       │
│  Save JSON to database                                           │
│          ↓                                                       │
│  For EVERY job match: Load cached JSON (FREE!)                   │
│          ↓                                                       │
│  Send small JSON to AI for matching (cost: ₹0.02)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cost Savings

| Scenario | Without Caching | With Caching | Savings |
|----------|----------------|--------------|---------|
| 1 resume + 100 matches | ₹8 | ₹2.06 | **74%** |
| 1 resume + 500 matches | ₹38 | ₹10.06 | **74%** |
| 1 resume + 1000 matches | ₹76 | ₹20.06 | **74%** |

### Database Schema for Caching

```typescript
// Resumes table with cached parsed data
export const resumes = pgTable('resumes', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  originalFileName: text('original_file_name'),
  parsedData: jsonb('parsed_data').$type<ParsedResume>(),  // Cached!
  parsedAt: timestamp('parsed_at').defaultNow(),
});

// Job matches with cached scores
export const jobMatches = pgTable('job_matches', {
  userId: text('user_id').references(() => users.id),
  jobId: text('job_id').references(() => jobs.id),
  score: integer('score'),
  matchedSkills: jsonb('matched_skills'),
  missingSkills: jsonb('missing_skills'),
  matchedAt: timestamp('matched_at').defaultNow(),
});
```

---

## 🔄 Configurable Provider Architecture

### Interface Pattern (Swappable Providers)

```python
# apps/ai-service/src/providers/base.py

from abc import ABC, abstractmethod
from typing import List
from models import ParsedResume, JobMatch, Job

class AIProvider(ABC):
    """Base class - ALL providers must implement these methods"""
    
    @abstractmethod
    async def parse_resume(self, text: str) -> ParsedResume:
        """Parse resume text into structured data"""
        pass
    
    @abstractmethod
    async def match_job(self, resume: ParsedResume, job: Job) -> JobMatch:
        """Calculate match score between resume and job"""
        pass
    
    @abstractmethod
    async def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        pass
```

### Provider Implementations

```python
# apps/ai-service/src/providers/openai_provider.py

from openai import OpenAI
from .base import AIProvider
import json

class OpenAIProvider(AIProvider):
    def __init__(self, model: str = "gpt-4o-mini"):
        self.client = OpenAI()
        self.model = model
    
    async def parse_resume(self, text: str) -> ParsedResume:
        response = await self.client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},  # Guaranteed JSON!
            messages=[
                {
                    "role": "system",
                    "content": """Parse the resume and return JSON:
                    {
                        "name": "string",
                        "email": "string",
                        "phone": "string or null",
                        "skills": ["list", "of", "skills"],
                        "experience": [{"company": "", "title": "", "duration": "", "description": ""}],
                        "education": [{"institution": "", "degree": "", "field": ""}],
                        "summary": "brief summary"
                    }"""
                },
                {"role": "user", "content": f"Parse this resume:\n\n{text}"}
            ]
        )
        
        data = json.loads(response.choices[0].message.content)
        return ParsedResume(**data)
```

```python
# apps/ai-service/src/providers/anthropic_provider.py

from anthropic import Anthropic
from .base import AIProvider

class AnthropicProvider(AIProvider):
    def __init__(self, model: str = "claude-3-5-haiku-20241022"):
        self.client = Anthropic()
        self.model = model
    
    async def parse_resume(self, text: str) -> ParsedResume:
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": f"Parse this resume. Return ONLY valid JSON:\n\n{text}"
                }
            ]
        )
        
        # Claude doesn't have JSON mode, need error handling
        content = response.content[0].text
        if content.startswith('```'):
            content = content.replace('```json', '').replace('```', '').strip()
        
        data = json.loads(content)
        return ParsedResume(**data)
```

```python
# apps/ai-service/src/providers/groq_provider.py

from groq import Groq
from .base import AIProvider

class GroqProvider(AIProvider):
    """Ultra-fast inference using Groq's LPU"""
    
    def __init__(self, model: str = "llama3-70b-8192"):
        self.client = Groq()
        self.model = model
    
    async def parse_resume(self, text: str) -> ParsedResume:
        response = await self.client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},
            messages=[...]
        )
        # Similar implementation
```

```python
# apps/ai-service/src/providers/local_provider.py

class LocalModelProvider(AIProvider):
    """Future: Your own trained model!"""
    
    def __init__(self, model_url: str = "http://localhost:11434"):
        self.model_url = model_url  # e.g., Ollama
    
    async def parse_resume(self, text: str) -> ParsedResume:
        # Call your local model
        response = await httpx.post(
            f"{self.model_url}/api/generate",
            json={"model": "llama3", "prompt": text}
        )
        # Process response
```

### Factory Pattern (Choose Provider at Runtime)

```python
# apps/ai-service/src/providers/factory.py

import os
from .base import AIProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .groq_provider import GroqProvider
from .local_provider import LocalModelProvider

def create_ai_provider() -> AIProvider:
    """Create AI provider based on environment variable"""
    
    provider_type = os.environ.get('AI_PROVIDER', 'openai')
    model = os.environ.get('AI_MODEL')
    
    providers = {
        'openai': lambda: OpenAIProvider(model or 'gpt-4o-mini'),
        'anthropic': lambda: AnthropicProvider(model or 'claude-3-5-haiku-20241022'),
        'groq': lambda: GroqProvider(model or 'llama3-70b-8192'),
        'local': lambda: LocalModelProvider(os.environ.get('LOCAL_MODEL_URL')),
    }
    
    if provider_type not in providers:
        raise ValueError(f"Unknown AI provider: {provider_type}")
    
    return providers[provider_type]()
```

### Switching Providers

```bash
# .env file

# Default (MVP)
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

# Switch to Claude
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-haiku-20241022

# Switch to Groq (ultra-fast)
AI_PROVIDER=groq
AI_MODEL=llama3-70b-8192

# Future: Your own model
AI_PROVIDER=local
LOCAL_MODEL_URL=http://localhost:11434
```

**Zero code changes required! Just change environment variables.**

---

## 🎓 Future Learning Path

This architecture enables your ML learning journey:

```
Phase 1: External APIs (Now)
├── Start with OpenAI GPT-4o-mini
└── Learn prompt engineering

Phase 2: Try Different Providers
├── Switch to Claude (just change env var)
├── Try Groq for speed
└── Compare quality and costs

Phase 3: Run Open-Source Models
├── Install Ollama locally
├── Run Llama 3, Mistral
└── Add LocalModelProvider

Phase 4: Fine-tune Models
├── Fine-tune GPT-3.5 on your data
├── Learn Hugging Face
└── Train custom classifiers

Phase 5: Build Custom Models
├── Learn PyTorch basics
├── Train your own resume parser
└── Deploy to production
```

---

## 🆚 Provider Comparison

| Factor | OpenAI | Anthropic | Groq | Local |
|--------|--------|-----------|------|-------|
| **JSON Mode** | ✅ Native | ❌ None | ✅ Native | ❌ Varies |
| **Quality** | ✅✅ Best | ✅✅ Best | ✅ Good | 🟡 Varies |
| **Speed** | ✅ Fast | ✅ Fast | ✅✅ Fastest | 🟡 Varies |
| **Cost (₹/month)** | ₹13 | ₹19 | ₹34 | ₹0 (FREE) |
| **Privacy** | 🟡 Cloud | 🟡 Cloud | 🟡 Cloud | ✅ Local |
| **Documentation** | ✅✅ Best | ✅ Good | ✅ Good | 🟡 Varies |

---

## ✅ Decision

**OpenAI GPT-4o-mini as default, with configurable provider architecture**

### Rationale

1. **JSON Mode:** Guaranteed valid JSON = no parsing errors
2. **Cost:** ₹13/month (less than a chai!)
3. **Documentation:** Best docs and community
4. **Configurable:** Can swap providers via environment variable
5. **Future-proof:** Architecture supports custom models later

### Configuration

```bash
# Default configuration
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...

# Enable caching (recommended)
CACHE_PARSED_RESUMES=true
```

### Consequences

**Positive:**
- Reliable JSON output (native JSON mode)
- Affordable (₹13/month with caching)
- Easy to swap providers without code changes
- Learning path to custom models

**Negative:**
- Dependency on external API (mitigated by swappable architecture)
- API costs (minimal, and can switch to free local models)

---

## 📚 Learning Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Groq Documentation](https://console.groq.com/docs)
- [Ollama (Local Models)](https://ollama.ai/)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2026-01-26 | Initial decision approved |
