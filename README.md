# EventSphere
A single, simple platform where KIIT students can discover society events and workshops, and society leads can post them, replacing fragmented WhatsApp/email/Instagram announcements.

## Features (MVP scope)

- **KIIT-only login**: Google Sign-In restricted to `@kiit.ac.in` and verified on the server, plus an email-only demo login
- **Onboarding**: pick 3–8 interest tags, then follow 2–3 suggested societies
- **Home feed**: happening today, "Recommended for you" (tag overlap + followed societies), upcoming events with Technical / Cultural / Workshops tabs
- **Search**: keyword search over title, society and tags, with Society, Date and Event Type filters
- **Event detail**: title, society, date, time, venue, description, external Register link
- **Society profiles** with Follow; a **Profile** page to edit name and interests
- **Society admin portal**: create, edit, delete; Draft → Published → Archived; banner image upload
- **Push notifications** (Web Push): followers are notified when a society publishes a new event

Out of scope for this phase (Phase 2/3): email parsing, weekly digest, RSVP/QR attendance, fine-grained admin roles, payments and chat.

## Architecture

```
React 19 SPA (Vite, Tailwind)  ──/api/v1 (JSON + JWT)──▶  Express 5 API (Node 22.13+)
  service worker ◀── Web Push ──  push service  ◀── web-push (VAPID)   │
  Google Sign-In ── ID token ──▶ verified via Google tokeninfo         ▼
                                                     SQLite (node:sqlite, WAL) + data/uploads/
```

- **Backend** (`backend/src`): `routes/` → auth middleware (`lib/auth.js`) → `controllers/` → SQLite (`lib/db.js`, schema in `lib/schema.sql`).
  Security: helmet with a CSP, per-IP rate limits, and a production config guard (the server refuses to start with a weak `JWT_SECRET`).
- **Database tables**: `societies`, `users`, `events`, `follows`, `push_subscriptions`, `settings`. The feed and follow lookups are indexed.
- **Frontend** (`Frontend/src`): route guards (`ProtectedRoute`, `AdminRoute`), `api/client.js` for every HTTP call, `context/AuthContext.jsx` for the session.
- In production, Express serves the built frontend as well, so the whole app is one service on one port.

## Running locally

Requires Node 22.13 or newer (Node 24 recommended).

```bash
# 1. Backend (http://localhost:6767)
cd backend
cp .env.example .env
npm install
npm run dev

# 2. Frontend (http://localhost:5173), in a second terminal
cd Frontend
npm install
npm run dev
```

On first start the backend creates `backend/data/eventsphere.db` with 10 societies and 54 events, dated relative to today. `npm run seed` resets it (stop the server first).

See [docs/DEMO.md](docs/DEMO.md) for the presentation walkthrough.

## Configuration (backend `.env`)

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `production` turns on the safety checks and turns dev login off by default |
| `JWT_SECRET` | Token signing secret. Required in production (32+ random characters). |
| `GOOGLE_CLIENT_ID` | OAuth client ID. Google login is disabled without it. The frontend reads it from the server. |
| `ADMIN_EMAILS` | Society reps as `email:societyId` pairs, e.g. `lead@kiit.ac.in:soc_krs` |
| `ALLOW_DEV_LOGIN` | Email-only demo login. Defaults to on in development and off in production. |
| `TZ` | Campus timezone for "today" (default `Asia/Kolkata`) |
| `DB_PATH`, `UPLOAD_DIR` | Database file and banner upload folder (point both at a persistent disk) |
| `RATE_LIMIT_PER_MIN`, `LOGIN_RATE_LIMIT` | Per-IP limits (defaults: 3000/min overall, 200 logins per 15 min) |
| `VAPID_*` | Optional fixed Web Push keys (generated and stored in the database otherwise) |

Society IDs: `soc_krs`, `soc_fed`, `soc_gdg`, `soc_kalakaar`, `soc_kmc`, `soc_kfs`, `soc_mun`, `soc_fin`, `soc_quiz`, `soc_dance`.

## Deploying

There are two ways:

- **Docker**: `docker build -t eventsphere .` then `docker run -p 8080:8080 -v eventsphere-data:/data -e JWT_SECRET=... eventsphere`.
- **Render** (free plan): `render.yaml` is a Blueprint (New → Blueprint → this repo). It generates `JWT_SECRET`. You enter `GOOGLE_CLIENT_ID`, `ADMIN_EMAILS` and the two VAPID keys (`npx web-push generate-vapid-keys`). With no disk, the database re-seeds on every restart; see the comments in `render.yaml` to switch to a paid plan with a disk.

When deployed, add the site URL to the Google OAuth client's **Authorized JavaScript origins**.

## Quality checks

```bash
cd backend
npm test          # 8 API tests: auth, onboarding, search, follow, admin, uploads, archive, config guards
npm run loadtest  # needs a running server started with RATE_LIMIT_PER_MIN=1000000
```

Load test results, measured locally against the production build with SQLite:

| Concurrent users | Throughput | p50 | p99 | Failures |
|---|---|---|---|---|
| 20 (PRD target) | 569 req/s | 30 ms | 163 ms | 0 |
| 100 | 601 req/s | 153 ms | 503 ms | 0 |

## API overview (`/api/v1`)

| Method | Path | Auth |
|---|---|---|
| GET | `/health`, `/auth/config` | – |
| POST | `/auth/google`, `/auth/dev-login` | – |
| GET / PATCH | `/auth/me` | user |
| GET | `/events?q=&society=&date=today\|week\|YYYY-MM-DD&type=` | – |
| GET | `/events/recommended` | user |
| GET | `/events/:id` | – (drafts only for the owning society) |
| GET | `/societies`, `/societies/suggested?tags=`, `/societies/:id` | – |
| POST / DELETE | `/societies/:id/follow` | user |
| GET / POST | `/admin/events` | admin |
| PUT / DELETE | `/admin/events/:id` | admin (own society only) |
| GET | `/push/public-key` | – |
| POST / DELETE | `/push/subscribe` | user |
