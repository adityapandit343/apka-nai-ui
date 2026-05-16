# CutBook Frontend

Production-ready React frontend for salon discovery and barber-shop queue management.

## Main Routes

```txt
/                  Landing page
/customer/         Customer nearby salon search
/customer/:shopId  Customer service request and token status flow
/customer/login    Customer login
/customer/register Customer registration
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

The frontend uses the API operations documented in:

```txt
docs/API_ENDPOINTS.md
docs/PRODUCTION_ARCHITECTURE.md
```

## Important Backend Requirements

Use PostgreSQL with PostGIS for salon search within 10 km.

Queue token generation must happen in backend transactions. The frontend never creates token numbers.
