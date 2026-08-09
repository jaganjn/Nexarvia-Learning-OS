# Nexarvia Learning OS — Sprint 1
## Production Foundation: Identity & Access

Goal:
Sign Up → Login → Authenticated Session → Student Profile → Student Dashboard

Included:
- User registration
- bcrypt password hashing
- JWT authentication
- Student profile persistence
- Student / Instructor / Mentor / Admin roles
- Role-based API protection
- Authenticated `/api/me`
- Authenticated `/api/dashboard`
- PostgreSQL + Prisma
- Environment configuration
- Health/readiness endpoints
- Request validation
- Rate-limit guard
- CI/test foundation

Local setup:
1. Start PostgreSQL with `infra/docker-compose.yml`.
2. Copy `backend/.env.example` to `backend/.env`.
3. In `backend`, run `npm install`.
4. Run `npx prisma migrate dev --name init`.
5. Run `npm run db:seed`.
6. Run `npm run dev`.

Seed account:
`demo@nexarvia.local`
`ChangeMe123!`

Change the seed password before real deployment.

This is a production-engineering milestone, not a cloud deployment. Real deployment still requires managed infrastructure, secrets, TLS, monitoring, and external service credentials.
