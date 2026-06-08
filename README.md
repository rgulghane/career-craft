# AI Career Launchpad

Single Next.js (App Router) application with server-side rendering, MongoDB, JWT auth, and a built-in referral lifecycle.

```
career-craft/
├─ apps/web/                 # Next.js app (SSR + API route handlers)
│  ├─ src/server/db/         # MongoDB client + data access
│  └─ src/
│     ├─ app/                # Pages + API route handlers
│     ├─ components/         # UI
│     ├─ lib/                # client-safe libs + server config
│     └─ server/             # server-only modules (DB, services, auth)
├─ packages/shared/          # Constants, messages, Zod schemas, types
├─ Dockerfile                # Production image (Next standalone output)
└─ docker-compose.yml        # Optional local Docker deploy (web only)
```

## Prerequisites

- Node.js 20+ and npm 10+
- MongoDB 6+ (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Quick start (local dev)

```bash
# 1. install
npm run install:all

# 2. configure env
cp apps/web/.env.example apps/web/.env.local
#    set DATABASE_URL to your MongoDB URI (include database name in the path)

# 3. ensure indexes
npm run db:setup

# 4. run dev server
npm run dev
```

The app is at [http://localhost:3000](http://localhost:3000). All API endpoints live under `/api/*` on the same origin — there's no separate API process.

**Admin portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) — full admin: `ADMIN_EMAIL=… ADMIN_PASSWORD='…' npm run db:create-admin`. Read-only admins: `npm run db:create-admin-readonly` or **Admin → Team** in the UI (full admin only). Batch: `ADMIN_USERS_FILE=apps/web/scripts/readonly-admins.example.csv npm run db:create-readonly-admins-batch`.

## Useful scripts


| Script                                    | What it does                                                   |
| ----------------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                             | Builds `@career-craft/shared` then starts Next.js in dev mode  |
| `npm run dev:clean`                       | Same, but wipes `.next/` first                                 |
| `npm run build`                           | Builds shared + Next.js for production                         |
| `npm start`                               | Runs the production server (`next start`)                      |
| `npm run db:setup`                        | Create MongoDB indexes (idempotent)                            |
| `npm run db:create-admin`                 | Create/update **full** admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) |
| `npm run db:create-admin-readonly`        | Create/update **read-only** admin (same env vars)              |
| `npm run db:create-readonly-admins-batch` | Batch read-only admins from CSV (`ADMIN_USERS_FILE`)           |
| `npm run lint`                            | Next.js lint                                                   |


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

- `DATABASE_URL`   — MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/career_craft?retryWrites=true&w=majority`)
- `JWT_SECRET`     — 32+ char random string
- `CRON_SECRET`    — random string for the internal cron header
- `APP_ORIGIN`     — canonical site origin (used for referral share links)

Optional overrides (amounts in rupees / days):

- `STANDARD_PRICE`, `REFERRAL_PRICE`, `CASH_PER_REFERRAL`, `REFUND_WINDOW_DAYS` (pricing UI reads these on the server and passes amounts into client components)

All other knobs (cookie max-age, JWT TTL, bcrypt cost factor, referral code alphabet, message strings) live in `packages/shared/src/`.

## Deploying

### Docker (any host)

```bash
export DATABASE_URL="mongodb+srv://..."
docker compose up --build
```

Runs `npm run db:setup` on boot, then serves on port 3000. Set real `JWT_SECRET`, `CRON_SECRET`, `APP_ORIGIN` via env or compose overrides.

### Node host (Railway / Render / Fly)

1. Provision MongoDB (Atlas or host-managed), copy `DATABASE_URL` into the service env.
2. Set `JWT_SECRET`, `CRON_SECRET`, `APP_ORIGIN` (+ optional pricing overrides).
3. Build command: `npm run install:all && npm run build`
4. Release command: `npm run db:setup`
5. Start command: `npm start`
6. Health check path: `/api/health`
7. Schedule a job hitting `POST /api/internal/qualify-referrals` with the cron secret header (daily is fine).

## Security notes

- Use a 32+ char random `JWT_SECRET` and `CRON_SECRET` in production.
- Replace the mock payment flow with your PSP webhooks; keep referral qualification **after** the refund window.
- Never commit `.env`* files. Rotate database credentials if they were ever exposed.

## Build verification

```bash
npm run build
```



