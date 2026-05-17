# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce application with a Node.js/Express backend and a React frontend. The two services are developed and run independently.

## Commands

### Backend (`/backend`)
```bash
npm start          # Start dev server with nodemon (reads .env or .env.local)
```
No test runner or linter is configured. Backend uses ES module syntax (`"type": "module"`), so all imports must use ESM (`import`/`export`).

### Frontend (`/frontend`)
```bash
npm start          # React dev server on port 3000
npm run build      # Production build
npm test           # Jest in watch mode
```

## Required Environment Variables

**Backend** — create `/backend/.env`:
| Variable | Purpose |
|---|---|
| `PORT` | Server port (e.g. 5000) |
| `MONGO_URL` | MongoDB connection URI |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_TIME` | JWT expiration (e.g. `7d`) |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image hosting |
| `STRIPE_SECRET_KEY` | Payment processing |
| `EMAIL_USER` / `EMAIL_PASSWORD` / `SMTP_HOST` | Nodemailer email |

**Frontend** — create `/frontend/.env`:
| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |

Backend CORS allows `localhost:3000`, `localhost:3001`, `localhost:5173` by default.

## Architecture

### Backend (`/backend`)

**Stack:** Express + MongoDB (Mongoose) + JWT auth + Stripe + Cloudinary + PDFKit

**Entry points:** `index.js` → starts HTTP server; `app.js` → configures Express middleware and mounts all routers.

**Layers:**
- `routes/` — thin router files that map HTTP verbs to controller functions
- `controllers/` — request/response handlers; one file per domain
- `models/` — Mongoose schemas (18 models including User, Product, Category, Order, Cart, Payment, Review, Coupon, FlashSale, Return, StockAlert, Bundle, ActivityLog, StoreSettings)
- `middlewares/` — `verifyJWT.middleware.js` (extracts user from cookie, sets `req.user`), `verifyAdmin.middleware.js`, `multer.middleware.js`
- `services/` — `mail.service.js` (nodemailer), `Cloudinary.service.js` (image upload/delete)
- `db/index.js` — connects to MongoDB via `MONGO_URL`

**API surface** (`/api` prefix implied):
`/auth`, `/user`, `/product`, `/category`, `/cart`, `/order`, `/payment`, `/admin`, `/settings`, `/review`, `/coupon`, `/returns`, `/stock-alerts`, `/questions`, `/flash-sales`, `/bundle`, `/bulk`, `/invoice`

### Frontend (`/frontend`)

**Stack:** React 18 (CRA) + React Router v6 + Tailwind CSS + shadcn/ui + Context API

**State management:** Context API only — no Redux. Four providers wrap the app:
- `AuthProvider` — current user session and profile
- `SettingsProvider` — global store configuration from backend
- `FlashSaleProvider` — active flash sale data
- `CompareProvider` — product comparison state

**Routing** is defined in `src/App.js`. Pages split into two areas:
- `src/pages/user/` — 19 customer-facing pages
- `src/pages/admin/` — 18 admin dashboard pages (protected by auth)

**UI:** shadcn/ui components live in `src/components/ui/`. Toast notifications use Sonner. Charts use Recharts. Carousels use Embla Carousel.

**Key conventions:**
- All API calls go to `REACT_APP_API_URL`; credentials are sent via cookies (`withCredentials: true` on axios)
- `next-themes` handles dark/light mode toggled from `SettingsProvider`
