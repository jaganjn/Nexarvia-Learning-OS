# Local production-shaped infrastructure

1. Copy `backend/.env.example` to `backend/.env` and set a strong JWT_SECRET.
2. Start PostgreSQL: `docker compose -f infra/docker-compose.yml up -d postgres`
3. In `backend/`: `npm install`
4. Run `npx prisma migrate dev --name init`
5. Run `npm run db:seed`
6. Start API: `npm run dev`

For real deployment, replace example credentials, use managed PostgreSQL, secret management, TLS, backups, monitoring and a hardened container registry.
