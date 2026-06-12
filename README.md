# CULT Asset Manager — IIT Roorkee

A full-stack Asset Management and Resource Allocation Platform for the Cultural Council of IIT Roorkee.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |
| QR Codes | qrcode npm package |
| Deployment | Docker + Docker Compose |

## Features

### Core (Mandatory)
- ✅ JWT-based User Authentication (Register / Login)
- ✅ Role-based access (Admin / User)
- ✅ Full Inventory Management (CRUD for assets)
- ✅ Asset Discovery with Search & Filter
- ✅ Booking Request System (with quantity validation)
- ✅ Approval Workflow (Approve / Reject with notes)
- ✅ Asset Issue & Return Management
- ✅ Analytics Dashboard (charts, summary cards)
- ✅ Borrowing History (user + admin views)

### Bonus
- ✅ QR Code generation per asset
- ✅ Audit Logs (all admin & booking actions tracked)
- ✅ Asset health/condition tracking
- ✅ Dockerized deployment (Docker Compose)
- ✅ Utilization rate analytics per asset

## Setup — Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)

### 1. Clone & install

```bash
git clone <your-repo>
cd asset-management

# Backend
cd backend
cp .env.example .env       # Edit DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init
node src/prisma/seed.js    # Seeds demo data
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:5000`

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cult.iitroorkee.ac.in | admin123 |
| User | user@iitroorkee.ac.in | user123 |

## Setup — Docker (Recommended)

```bash
docker-compose up --build
```

App available at `http://localhost:5173`

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/assets | List all assets (with search/filter) |
| POST | /api/assets | Create asset (admin) |
| PUT | /api/assets/:id | Update asset (admin) |
| DELETE | /api/assets/:id | Delete asset (admin) |
| GET | /api/bookings | List bookings |
| POST | /api/bookings | Create booking request |
| PATCH | /api/bookings/:id/approve | Approve booking (admin) |
| PATCH | /api/bookings/:id/reject | Reject booking (admin) |
| PATCH | /api/bookings/:id/issue | Issue asset (admin) |
| PATCH | /api/bookings/:id/return | Return asset (admin) |
| GET | /api/analytics/dashboard | Dashboard stats (admin) |
| GET | /api/analytics/utilization | Asset utilization (admin) |
| GET | /api/audit | Audit logs (admin) |

## Database Schema

- **User** — id, name, email, password (hashed), role
- **Asset** — id, name, category, description, totalQuantity, availableQuantity, status, condition, qrCode
- **Booking** — id, userId, assetId, quantity, status, startDate, endDate, issuedAt, returnedAt, adminNote
- **MaintenanceLog** — id, assetId, description, reportedBy
- **AuditLog** — id, userId, assetId, action, details, createdAt
