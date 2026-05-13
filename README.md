# CutBook Frontend

Production-ready React frontend for salon discovery and barber-shop queue management.

## Main Routes

```txt
/                  Landing page
/customer/         Customer nearby salon search within 10 km
/customer/:shopId  Customer queue preview and join token flow
/login             Shop-owner login
/register          Shop-owner registration
/dashboard         Shop-owner live queue dashboard
/dashboard/analytics/  Shop-owner analytics
/dashboard/settings/   Shop-owner settings and readiness
```

## Setup

```bash
npm install
```

Create `.env`:

```txt
VITE_API_URL=http://localhost:8082
```

Run locally:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

## Backend Contract

The frontend currently uses **15 API operations**. See:

```txt
docs/API_ENDPOINTS.md
docs/PRODUCTION_ARCHITECTURE.md
```

## Important Backend Requirements

Use PostgreSQL with PostGIS for salon search within 10 km.

Queue token generation must happen in backend transactions. The frontend never creates token numbers.
