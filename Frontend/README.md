# KIIT EventSphere - Week 1 Frontend

KIIT EventSphere is a campus event discovery platform featuring student and admin/society portals. This repository contains the Week 1 single React (Vite) + Tailwind CSS app.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Google OAuth Client ID
Create a `.env` file inside the `frontend/` directory (or copy `.env.example`):
```bash
cp .env.example .env
```
Update `VITE_GOOGLE_CLIENT_ID` with your Google Cloud Console OAuth Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

> **Note**: Both Student and Admin logins use `@react-oauth/google` and strictly enforce `@kiit.ac.in` domain emails. If no Google Client ID is configured during local testing, an instant sign-in option is also available to test `@kiit.ac.in` domain validation.

### 3. Run Development Server
```bash
npm run dev
```

---

## 📁 Project Structure

```
frontend/src/
├── pages/
│   ├── student/          ← Student pages
│   │   ├── Login.jsx     ← OAuth Sign-in with @kiit.ac.in validation
│   │   ├── Onboarding.jsx← Tag selection grid (3-8 choices required)
│   │   └── Home.jsx       ← Happening Today carousel & recommended feed
│   └── admin/            ← Admin/Society pages
│       ├── Login.jsx     ← Shared OAuth Sign-in
│       └── CreateEvent.jsx ← Event creator form logging structured JSON
├── components/           ← Shared UI (Navbar, Layout, ProtectedRoute, AdminRoute)
├── context/
│   └── AuthContext.jsx   ← Auth state, Google OAuth, role toggle & interests
├── api/
│   └── events.js         ← Data layer abstraction (imports mockEvents.json)
└── data/
    ├── mockEvents.json   ← 12 realistic KIIT campus events for feed
    └── seedEvents.json   ← 15 seed events formatted for backend developer handoff
```

---

## 🔐 Routes & Access Control

- `/login` — Student Login Page (Google OAuth restricted to `@kiit.ac.in`).
- `/onboarding` — Interest tag selection (requires 3–8 selected tags).
- `/home` — Student Event Discovery Feed (Today Carousel + Personalization).
- `/admin/login` — Admin/Society Portal Login.
- `/admin/create-event` — Event Creator Form (Outputs structured JSON object to console upon submission).

---

## 📄 Seed Data Handoff

The `src/data/seedEvents.json` file contains 15 detailed events featuring KIIT society names (e.g. *Kreative Eye, Konnexions, Qutopia, KRS Robotics Society, KIITMUN Society*) and campus venues (*Campus 6 Auditorium, Campus 15, KSAC Main Stage*). This file is ready for backend API seed ingestion.
