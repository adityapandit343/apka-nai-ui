# CutBook Production Architecture

## Product Flow

1. Customer opens `/customer/`.
2. Browser asks for location permission.
3. Frontend calls `POST /api/shop/search-nearby`.
4. Customer chooses a shop and opens `/customer/{shopId}`.
5. Customer selects services and sends `POST /api/queue/request`.
6. Barber dashboard accepts or rejects the request.
7. Accepted customers receive a token and appear in `GET /api/queue/live-queue`.

## Recommended Backend Modules

Use a modular monolith first. It is easier to ship, easier to debug, and can still scale well.

```txt
Auth Module
Shop Module
Geo Search Module
Queue Module
Notification Module
Realtime Module
```

## Data Model

### users

```txt
id
name
email unique
phone
password_hash
created_at
```

### shops

```txt
id
owner_id
name
address
phone
location geography(Point, 4326)
avg_service_time
is_open
created_at
updated_at
```

### queue_entries

```txt
id
shop_id
customer_name
customer_phone nullable
token_number
status
queue_date
served_at nullable
completed_at nullable
created_at
updated_at
```

Unique index:

```txt
shop_id + queue_date + token_number
```

## Scaling Choices

MVP:

```txt
React + REST API + PostgreSQL/PostGIS + polling every 8 seconds
```

Next production step:

```txt
Replace polling with WebSocket or Server-Sent Events for queue updates.
```

High scale:

```txt
Redis cache for queue summaries
Background workers for notifications
Read replicas for discovery/search
CDN for frontend assets
```

## Queue Consistency Rule

Joining queue should be atomic:

1. Begin transaction.
2. Lock queue counter for shop and date.
3. Generate next token.
4. Insert queue entry.
5. Commit transaction.

Never generate token numbers in frontend.

## Frontend Structure

```txt
src/constants/apiEndpoints.js
Central API route map.

src/api/httpClient.js
Axios client, auth token injection, timeout, 401 handling.

src/pages/NearbyShopsPage.jsx
Customer discovery by location.

src/pages/CustomerPage.jsx
Customer service request and token status flow.

src/pages/DashboardPage.jsx
Shop owner request approval and live queue dashboard.
```

## Deployment Checklist

Set environment variable:

```txt
VITE_API_URL=https://your-api-domain.com
```

Backend must enable CORS for the frontend domain.

Backend must return these HTTP statuses:

```txt
200 success
201 created
400 validation error
401 missing or invalid token
403 owner cannot access this shop
404 shop or queue entry not found
409 duplicate active queue entry or invalid queue transition
500 unexpected server error
```
