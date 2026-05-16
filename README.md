# Career Craft

Single Next.js (App Router) application with server-side rendering, Prisma + Postgres, JWT auth, and a built-in referral lifecycle.

```
career-craft/
├─ apps/web/                 # Next.js app (SSR + API route handlers + Prisma)
│  ├─ prisma/schema.prisma   # Postgres schema
│  └─ src/
│     ├─ app/                # Pages + API route handlers
│     ├─ components/         # UI
│     ├─ lib/                # client-safe libs + server config
│     └─ server/             # server-only modules (DB, services, auth)
├─ packages/shared/          # Constants, messages, Zod schemas, types
├─ Dockerfile                # Production image (Next standalone output)
└─ docker-compose.yml        # One-command local stack (Postgres + web)
```

## Prerequisites

- Node.js 20+ and npm 10+
- Postgres 14+ (or run via Docker — see below)

## Quick start (local dev)

```bash
# 1. install
npm run install:all

# 2. configure env
cp apps/web/.env.example apps/web/.env.local
#    edit JWT_SECRET, DATABASE_URL if not using docker-compose defaults

# 3. start Postgres (skip if you already have one)
docker compose up -d db

# 4. apply schema
npm run db:push

# 5. run dev server
npm run dev
```

The app is at [http://localhost:3000](http://localhost:3000). All API endpoints live under `/api/*` on the same origin — there's no separate API process.

## Useful scripts

| Script              | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Builds `@career-craft/shared` then starts Next.js in dev mode  |
| `npm run dev:clean` | Same, but wipes `.next/` first                                 |
| `npm run build`     | Builds shared + Next.js for production                         |
| `npm start`         | Runs the production server (`next start`)                      |
| `npm run db:push`   | Sync Prisma schema → DB (dev convenience)                      |
| `npm run db:migrate`| Create + apply a migration                                     |
| `npm run db:deploy` | Apply pending migrations (use in CI / on boot)                 |
| `npm run db:studio` | Launch Prisma Studio                                           |
| `npm run lint`      | Next.js lint                                                   |

## Referral flow (demo)

1. Register / log in.
2. **Enroll** — optional referral code (must match an existing user's code **after** they paid).
3. **Mock payment** — assigns the student their own `referralCode` and attributes a referral when one was used.
4. After the **refund window** (default 7 days, configurable), hit the internal qualify job:

   ```bash
   curl -X POST http://localhost:3000/api/internal/qualify-referrals \
     -H "x-cron-secret: dev-cron-secret"
   ```

   In production, schedule this via your host's cron (Render Cron Job, Fly machines schedule, systemd timer, etc.) using the real `CRON_SECRET`.

## Configuration

All runtime configuration lives in `apps/web/.env.example`. Required in production:

- `DATABASE_URL`   — Postgres connection string
- `JWT_SECRET`     — 32+ char random string
- `CRON_SECRET`    — random string for the internal cron header
- `APP_ORIGIN`     — canonical site origin (used for referral share links)

Optional overrides (in paise / days):

- `STANDARD_PRICE_PAISE`, `REFERRAL_PRICE_PAISE`, `CASH_PER_REFERRAL_PAISE`, `REFUND_WINDOW_DAYS`

All other knobs (cookie max-age, JWT TTL, bcrypt cost factor, referral code alphabet, message strings) live in `packages/shared/src/`.

## Deploying

### Docker (any host)

```bash
docker compose up --build
```

This launches Postgres and the Next.js app, runs `prisma migrate deploy` on boot, and serves on port 3000. Set real `JWT_SECRET`, `CRON_SECRET`, `APP_ORIGIN` via env or compose overrides.

### Node host (Railway / Render / Fly)

1. Provision a Postgres instance, copy `DATABASE_URL` into the service env.
2. Set `JWT_SECRET`, `CRON_SECRET`, `APP_ORIGIN` (+ optional pricing overrides).
3. Build command: `npm run install:all && npm run build`
4. Release command: `npm run db:deploy`
5. Start command: `npm start`
6. Health check path: `/api/health`
7. Schedule a job hitting `POST /api/internal/qualify-referrals` with the cron secret header (daily is fine).

## Security notes

- Use a 32+ char random `JWT_SECRET` and `CRON_SECRET` in production.
- Replace the mock payment flow with your PSP webhooks; keep referral qualification **after** the refund window.
- Never commit `.env*` files.

## Build verification

```bash
npm run build
```
