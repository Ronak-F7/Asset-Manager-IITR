# CULT Asset Manager — IIT Roorkee

A web-based platform for the Cultural Council of IIT Roorkee to manage shared equipment like cameras, audio systems, lighting, costumes, and event infrastructure.

Built as part of the CULT Open Projects 2026 challenge.

Live at: https://asset-manager-iitr.vercel.app

---

## What it does

The platform lets the council manage who borrows what equipment, for how long, and whether it's been returned. There are two types of users:

**Admin** — can add/edit/delete assets, approve or reject booking requests, issue equipment, mark returns, and view analytics and audit logs.

**User** — can browse available equipment, request to borrow something for specific dates, and track the status of their requests.

---

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT (JSON Web Tokens)
- Charts: Recharts
- Deployment: Vercel (frontend), Render (backend), Neon (database)

---

## Running locally

You have two options — Docker (easier) or manual setup.

### Option 1 — Docker

Make sure Docker Desktop is installed and running, then:

```bash
git clone https://github.com/Ronak-F7/Asset-Manager-IITR.git
cd Asset-Manager-IITR
docker-compose up --build
```

Open http://localhost:5173 in your browser.

### Option 2 — Manual

You'll need Node.js and PostgreSQL installed.

**Database setup:**
```bash
psql -U postgres
CREATE DATABASE asset_management;
\q
```

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
node src/prisma/seed.js
npm run dev
```

**Frontend (open a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Environment Variables

Create a `.env` file inside the `backend` folder:

```
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/asset_management"
JWT_SECRET="any-secret-string-you-choose"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

---

## Default login after setup

After running the seed file, one admin account is created:

- Email: ronak@cult.com
- Password: ronak123

New users can register themselves from the login page. Registered users get the User role by default.

---

## How to use the app

**As a user:**
1. Register a new account from the login page
2. Browse the Assets page to see available equipment
3. Click on any asset to see details and request it
4. Fill in the quantity, dates, and purpose, then submit
5. Go to My Bookings to track your request status
6. Once approved and issued, you'll see the status update in real time

**As an admin:**
1. Log in with the admin credentials
2. Go to Assets to add, edit, or remove equipment
3. Go to All Bookings to see pending requests — approve or reject with an optional note
4. After approving, click Issue when you physically hand over the equipment
5. Click Return when the equipment comes back
6. Check the Dashboard for an overview of activity and charts
7. Check Analytics to see which assets are used most
8. Check Audit Logs to see a full history of every action taken

---

## Features

**Core:**
- Secure login and registration with role-based access
- Full inventory management with categories and status tracking
- Asset booking with date range and quantity validation
- Approval workflow with admin notes
- Issue and return tracking with timestamps
- Analytics dashboard with charts
- Borrowing history for users and system-wide view for admins

**Bonus:**
- QR code generation for every asset
- Audit logging for all actions
- Asset condition tracking
- Dockerized deployment with Docker Compose
- Utilization rate analytics per asset

---

## Project Structure

```
Asset-Manager-IITR/
├── backend/          # Express API + Prisma + PostgreSQL
│   ├── src/
│   │   ├── routes/   # Auth, assets, bookings, analytics, audit
│   │   ├── middleware/
│   │   └── prisma/   # Schema and seed file
│   └── package.json
├── frontend/         # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── api/
│   └── package.json
└── docker-compose.yml
```
