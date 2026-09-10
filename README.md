# Shadow Alert — AI Missing Streetlight Detection

A full MERN-stack application for reporting, tracking, and resolving broken or
missing streetlights, with an AI photo-analysis engine that flags likely
outages automatically.

## Stack

- **MongoDB** — geospatial report storage (2dsphere index for map/duplicate queries)
- **Express + Node.js** — REST API, JWT auth, Socket.io real-time notifications
- **React (Vite) + Tailwind CSS** — responsive dashboard-style UI
- **AI Detection** — a real, deterministic image-analysis heuristic (`backend/utils/aiDetection.js`)
  built on pixel-level luminance/contrast analysis (via Jimp). It classifies each
  uploaded photo as `likely_faulty`, `likely_functional`, or `inconclusive` with
  a confidence score — no external API keys required.

## Features

- Email/password auth with JWT, citizen and admin roles
- Report a streetlight: photo upload, browser geolocation or manual coordinates,
  category, description, "sensitive zone" flag (school/hospital/crosswalk)
- Automatic AI brightness/contrast analysis on every uploaded photo
- Automatic nearby-duplicate detection (merges confirmations instead of spamming the map)
- Community confirmations ("I see this too") that raise a report's priority score
- Priority scoring combining AI confidence, confirmations, and sensitive-zone flag
- Searchable, filterable, paginated report list
- Live interactive map (Leaflet) with color-coded status markers
- Report detail page with AI analysis breakdown, status timeline, and a comment thread
- Admin operations console: sortable/filterable triage table, one-click status updates, delete
- Analytics dashboard: status breakdown, category breakdown, and reports-over-time charts (Recharts)
- Real-time in-app notifications via Socket.io (status changes, comments, confirmations)
- Fully responsive, modern dark UI with a custom design system (Tailwind)

## Project structure

```
shadow-alert/
  backend/     Express API, MongoDB models, AI detection engine, Socket.io
  frontend/    React (Vite) client, Tailwind design system, Leaflet map, Recharts
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local `mongod` or a MongoDB Atlas connection string)

## 1. Backend setup

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev                # starts the API on http://localhost:5000
```

Optional: seed a default admin account (`admin@shadowalert.app` / `ChangeMe123!`
unless overridden by `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`):

```bash
npm run seed:admin
```

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev                # starts the client on http://localhost:5173
```

The Vite dev server proxies `/api`, `/uploads`, and `/socket.io` to
`http://localhost:5000`, so both servers just need to be running side by side.

## 3. Using the app

1. Open `http://localhost:5173` and create an account (or log in as the seeded admin).
2. Click **Report a streetlight**, take/upload a photo, use "Use my location" (or type
   coordinates), and submit — the AI analysis runs automatically on submit.
3. Browse **Reports** or the **Map** to see everything the community has filed.
4. Log in as an admin to access the **Admin** console and change a report's status —
   the original reporter gets a real-time notification.

## Environment variables (backend/.env)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens — set this to a long random value |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend origin, used for CORS and Socket.io |
| `PORT` | API port (default `5000`) |

## Notes on the AI engine

The detection engine is a genuine, deterministic computer-vision heuristic — not
a mocked or random result. It downsamples each photo, computes perceived
luminance per pixel, locates the brightest region of the frame, and measures how
strongly that region stands out from its surroundings (contrast). A concentrated
bright "hot spot" against a darker frame reads as a working lamp; a uniformly
dark frame with no hot spot reads as a likely outage; a uniformly bright frame
(daytime) is marked inconclusive since a lamp's on/off state can't be judged
visually in daylight. This keeps the feature fully functional without requiring
any paid third-party ML API.
