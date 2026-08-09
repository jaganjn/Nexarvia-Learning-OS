# Level 5 API Contract

## Public
- `GET /health`
- `GET /ready`
- `POST /api/auth/register`
- `POST /api/auth/login`

## Authenticated student
- `GET /api/me`
- `GET /api/dashboard`
- `GET /api/learning-path`
- `POST /api/evidence`
- `POST /api/submissions`
- `POST /api/recommendations/next`
- `GET /api/graph`
- `PATCH /api/profile`
- `POST /api/notifications/:id/read`
- `GET /api/opportunities`
- `PATCH /api/opportunities/:id/status`

## Privileged
- `POST /api/courses` — admin/instructor
- `PATCH /api/evidence/:id/verify` — admin/mentor/instructor

All request bodies are validated with Zod. Authenticated endpoints require a Bearer token.
