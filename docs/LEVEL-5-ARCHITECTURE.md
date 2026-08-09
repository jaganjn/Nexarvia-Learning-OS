# Nexarvia Learning OS — Level 5 Architecture

## 5.0 Foundation
- Production-shaped API service
- PostgreSQL data model
- Authentication and role model
- Student profile persistence
- Course/chapter/lesson persistence
- Evidence and submission records
- Learning graph edges
- Recommendation records
- Opportunity records
- Notification records

## 5.1 Learning Engine
- Enrollment/progress model
- Evidence ingestion
- Submission lifecycle
- Capability mapping
- Explainable next-best-action endpoint
- Learning Twin signals
- Adaptive learning modes

## 5.2 AI / Content Engine
Production integration boundary is prepared for:
- LLM gateway
- PDF extraction pipeline
- retrieval/indexing
- structured lesson generation
- quiz generation
- rubric scoring
- AI tutor context
- safety/evaluation layer

## 5.3 Live Learning / Collaboration
Service boundaries:
- live classroom provider
- attendance
- recordings
- project collaboration
- mentor interactions
- notifications

## 5.4 Career Engine
- capability-to-role mapping
- evidence-based readiness
- interview practice
- opportunity matching
- application workflow

## 5.5 Production Operations
- managed PostgreSQL
- object storage for files
- background job queue
- observability
- audit logs
- secrets management
- rate limiting
- backups and recovery
- CI/CD
- security testing

This repository implements the Level 5 foundation and the core service contracts. External production services still require real credentials/accounts and deployment configuration; those cannot responsibly be fabricated inside a ZIP.
