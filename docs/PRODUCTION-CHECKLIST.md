# Production Checklist

## Required before public launch
- [ ] Set strong production secrets; never use example credentials.
- [ ] Managed PostgreSQL with automated backups and point-in-time recovery.
- [ ] Object storage for PDFs, recordings and portfolio artifacts.
- [ ] HTTPS/TLS and secure cookie/token strategy.
- [ ] Rate limiting and abuse protection.
- [ ] Email/notification provider.
- [ ] AI provider + retrieval/indexing + evaluation.
- [ ] PDF extraction/virus scanning/content validation.
- [ ] Live classroom/video provider.
- [ ] Background jobs and retry/dead-letter handling.
- [ ] Central logs, metrics, tracing and alerting.
- [ ] Audit logging for admin/mentor/verification actions.
- [ ] Role/permission review.
- [ ] Privacy policy, terms, retention/deletion workflows and applicable compliance review.
- [ ] CI/CD with staging and production environments.
- [ ] Automated unit/integration/end-to-end tests.
- [ ] Load, security and disaster-recovery testing.
- [ ] Domain/DNS and production deployment.

## What this ZIP provides
A working project structure and production-shaped contracts for the above, plus the complete Level 4 student-facing UI baseline.
