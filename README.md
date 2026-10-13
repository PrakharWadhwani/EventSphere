# EventSphere
A single, simple platform where KIIT students can discover society events and workshops, and society leads can post them, replacing fragmented WhatsApp/email/Instagram announcements.

## Features (MVP scope)

- **KIIT-only login**: Google Sign-In restricted to `@kiit.ac.in` (verified on the server), plus an email-only demo login
- **Onboarding**: pick 3–8 interest tags, then follow 2–3 suggested societies
- **Home feed**: happening today, "Recommended for you" (tag overlap + followed societies), upcoming events with Technical / Cultural / Workshops tabs
- **Search**: keyword search over title, society and tags, with Society, Date and Event Type filters
- **Event detail**: title, society, date, time, venue, description and an external Register link
- **Society profiles** with a Follow button
- **Society admin portal**: create, edit, delete, save as Draft or Publish (banner image upload included)
- **Push notifications** (Web Push): followers get notified when a society publishes a new event

Out of scope for this phase (Phase 2/3): email parsing, weekly digest, RSVP/QR attendance, fine-grained admin roles, payments and chat.

## Project structure

```
backend/    Express API (Node 20+), JSON-file datastore, Web Push
Frontend/   React 19 + Vite + Tailwind CSS
```

## Running locally

```bash
# 1. Backend (http://localhost:6767)
cd backend
cp .env.example .env      # then edit values
npm install
npm run dev

# 2. Frontend (http://localhost:5173), in a second terminal
cd Frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. In dev, Vite proxies `/api` to the backend.

On first start the backend creates `backend/data/db.json` with 10 societies and 54 events, all dated relative to today. Run `npm run seed` in `backend/` to reset it.

### Demo walkthrough

1. **Student**: sign in with any `@kiit.ac.in` email → pick tags → follow societies → browse the feed, search and event details.
2. **Society rep**: go to *Society portal login*, choose a society, sign in with a `@kiit.ac.in` email → create or publish events from the dashboard.
3. **Push**: as a student, follow a society and click *Enable notifications*. Then publish an event for that society as a rep and the student's browser gets a notification. Web Push needs `localhost` or HTTPS.

## Configuration

| Variable (backend `.env`) | Purpose |
|---|---|
| `PORT` | API port (default 6767) |
| `JWT_SECRET` | Secret for session tokens. **Set this in production.** |
| `GOOGLE_CLIENT_ID` | OAuth client ID. Google ID tokens must be issued for this client. |
| `ADMIN_EMAILS` | Society reps as `email:societyId` pairs, e.g. `lead@kiit.ac.in:soc_krs` |
| `ALLOW_DEV_LOGIN` | `true` enables email-only demo login. Set to `false` in production. With it off, only emails listed in `ADMIN_EMAILS` can use the society portal. |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Optional Web Push keys. Generated and stored in the DB automatically if empty. |

| Variable (Frontend `.env`) | Purpose |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Shows the Google Sign-In button. Leave empty to use demo login only. |
| `VITE_API_URL` | Backend origin if the API isn't served from the same host |

## Deploying

```bash
cd Frontend && npm run build
cd ../backend && npm start
```

When `Frontend/dist` exists, the backend serves it, so the whole app runs on a single port.

## Tests

```bash
cd backend && npm test
```

The tests boot the API on a temporary database and run through login, onboarding, search, follow and the admin publish flow.

## API overview (`/api/v1`)

| Method | Path | Auth |
|---|---|---|
| GET | `/auth/config` | – |
| POST | `/auth/google`, `/auth/dev-login` | – |
| GET / PATCH | `/auth/me` | user |
| GET | `/events?q=&society=&date=today\|week\|YYYY-MM-DD&type=` | – |
| GET | `/events/recommended` | user |
| GET | `/events/:id` | – |
| GET | `/societies`, `/societies/suggested?tags=`, `/societies/:id` | – |
| POST / DELETE | `/societies/:id/follow` | user |
| GET / POST | `/admin/events` | admin |
| PUT / DELETE | `/admin/events/:id` | admin |
| GET | `/push/public-key` | – |
| POST / DELETE | `/push/subscribe` | user |
