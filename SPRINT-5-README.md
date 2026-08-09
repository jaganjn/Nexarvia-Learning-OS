# Sprint 5 — AI Learning Engine

## Goal
Turn the existing learning record into a context-aware learning assistant:

**Learning data → AI context → Explain / Recommend / Remediate → Logged interaction**

### Included
- Student learning-context aggregation
- AI chat endpoint
- AI explanation endpoint
- AI next-step recommendation engine
- AI remediation-plan endpoint
- Learning-signal ingestion
- Recommendation accept/reject decisions
- AI interaction audit trail
- Provider abstraction:
  - Optional OpenAI-compatible HTTP endpoint via environment variables
  - Safe deterministic local fallback when no provider is configured
- Student-facing AI Learning Engine page
- Privacy-oriented redaction of obvious email addresses before external AI calls
- Guardrails against inventing official grades, verified skills or credentials

### External AI provider
No external AI key is bundled. To use a real model, configure `AI_API_URL`, `AI_API_KEY` and `AI_MODEL`. Without those values, the engine uses the local fallback so the application remains runnable.

### Production boundary
Before real deployment, add a managed AI gateway, secret management, provider-specific policy controls, request/response monitoring, cost limits, retention policy, and stronger PII/content filtering.
