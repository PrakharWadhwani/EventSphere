# Demo script (about 8 minutes)

This follows the PRD's success path: login → onboarding → feed → search → event detail → admin posting → push notification.

## Before the demo

- [ ] Run `npm run seed` in `backend/` the same morning, so "Happening Today" has events on the right date.
- [ ] Use **Chrome**. Open two windows side by side: a normal window (student) and a second Chrome profile or guest window (society rep). They must not share a login.
- [ ] In the student window, allow notifications for the site (lock icon → Notifications → Allow).
- [ ] Check the Wi-Fi connection. Seed banners load from Unsplash, so the cards look empty offline.
- [ ] Keep a backup recording of the full flow in case the network fails.

## 1. Problem (30 s)

Juniors miss fests, workshops and hackathons because announcements are scattered across WhatsApp, email and Instagram.

## 2. Student flow (3 min)

1. **Login**: sign in with a `@kiit.ac.in` address. Then show that a Gmail address is rejected, and point out that the server enforces this, not just the UI.
2. **Onboarding**: pick Coding, Robotics and Music. Step 2 suggests societies based on those tags. Follow **KIIT Music Club**.
3. **Feed**: walk through Happening Today, then Recommended for You (highlighted tags show why each event matched), then Upcoming with the category tabs.
4. **Search**: type "quiz", filter Type = Cultural. Results update as you type (the API answers in about 10 ms).
5. **Event detail**: date, time, venue, Register button (external form), and the Follow button for the organiser.
6. Accept the **Enable notifications** banner, or turn notifications on from the Profile page.

## 3. Society rep flow (2 min)

1. In the second window, open **Society portal login**, choose **KIIT Music Club**, and sign in as `kmclead@kiit.ac.in`.
2. The dashboard lists the society's events with Published, Draft and Archived counts.
3. Click **New event**, fill it in, upload a banner, add tags, keep the status **Published** → Publish.
4. **The student window shows a push notification.** Click it and the event page opens.
5. Optionally, show a Draft (hidden from students), then publishing it, then archiving it.

## 4. Engineering (1.5 min)

- Architecture: React SPA → Express API → SQLite, with Web Push and Google Sign-In.
- Security: KIIT-only login checked on the server, JWT sessions, per-society authorisation, rate limits, CSP headers, and a production config guard.
- Quality: 8 automated API tests. Load test at 20 concurrent users: p99 163 ms, 0 failures.

## 5. Phase 2/3 roadmap (30 s)

Automated KSAC email parsing (LLM ingestion), weekly digest emails, RSVP and QR attendance, fine-grained society roles (President/VP/Tech Lead), payments and chat.

## If something breaks

- **No push notification**: check Chrome's site notification setting and make sure the student follows that society. As a fallback, refresh the student feed; the new event is there.
- **Login button missing**: Google login needs `GOOGLE_CLIENT_ID`. Use the demo email login instead (`ALLOW_DEV_LOGIN=true`).
- **Empty "Happening Today"**: the seed is older than today. Stop the server, run `npm run seed`, and restart.
