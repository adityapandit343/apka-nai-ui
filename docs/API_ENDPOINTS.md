# CutBook API Contract

Frontend base URL comes from `VITE_API_URL`.

Total API operations currently used by the frontend: **15**.

## Auth

### 1. POST `/api/auth/register`
Creates a shop-owner account and returns a token.

Request:
```json
{
  "name": "Amit Kumar",
  "email": "amit@example.com",
  "phone": "9876543210",
  "password": "secret123"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "owner-id",
    "name": "Amit Kumar",
    "email": "amit@example.com",
    "phone": "9876543210"
  }
}
```

### 2. POST `/api/auth/login`
Logs in a shop owner.

Request:
```json
{
  "email": "amit@example.com",
  "password": "secret123"
}
```

Response: same as register.

### 3. GET `/api/auth/me`
Returns the logged-in owner. Requires `Authorization: Bearer <token>`.

Response:
```json
{
  "id": "owner-id",
  "name": "Amit Kumar",
  "email": "amit@example.com",
  "phone": "9876543210"
}
```

## Shops

### 4. GET `/api/shops`
Returns shops owned by the logged-in owner.

Response:
```json
[
  {
    "id": "shop-id",
    "name": "Royal Cuts",
    "address": "MG Road",
    "phone": "9876543210",
    "latitude": 28.6139,
    "longitude": 77.209,
    "avgServiceTime": 15,
    "isOpen": true
  }
]
```

### 5. POST `/api/shops`
Creates a shop. Requires auth.

Request:
```json
{
  "name": "Royal Cuts",
  "address": "MG Road",
  "phone": "9876543210",
  "latitude": 28.6139,
  "longitude": 77.209,
  "avgServiceTime": 15
}
```

Response: created shop object.

### 6. DELETE `/api/shops/{shopId}`
Deletes a shop owned by the logged-in owner.

Response:
```json
{ "success": true }
```

### 7. PUT `/api/shops/{shopId}/toggle`
Toggles open/closed status.

Response:
```json
{
  "id": "shop-id",
  "isOpen": true
}
```

### 8. GET `/api/shops/nearby?lat={lat}&lng={lng}&radiusKm=10`
Customer discovery endpoint. Return open and closed shops within radius, sorted by distance first, then wait time.

Response:
```json
[
  {
    "id": "shop-id",
    "name": "Royal Cuts",
    "address": "MG Road",
    "phone": "9876543210",
    "latitude": 28.6139,
    "longitude": 77.209,
    "distanceKm": 1.4,
    "isOpen": true,
    "avgRating": 4.7,
    "queueSummary": {
      "servingToken": 12,
      "waitingCount": 4,
      "estimatedWait": 60,
      "avgServiceTime": 15
    }
  }
]
```

## Queue

Queue statuses used by the frontend:

```txt
Waiting
Serving
Done
NoShow
```

### 9. GET `/api/shops/{shopId}/queue`
Returns today's queue for a shop.

Response:
```json
{
  "queue": [
    {
      "id": "entry-id",
      "shopId": "shop-id",
      "tokenNumber": 13,
      "customerName": "Rahul",
      "status": "Waiting",
      "createdAt": "2026-05-10T10:00:00Z"
    }
  ],
  "avgServiceTime": 15,
  "estimatedWait": 45
}
```

The frontend also accepts a plain array response, but the object shape above is preferred.

### 10. GET `/api/shops/{shopId}/queue/summary`
Fast summary used by discovery and future realtime refresh.

Response:
```json
{
  "servingToken": 12,
  "waitingCount": 4,
  "estimatedWait": 60,
  "avgServiceTime": 15
}
```

### 11. POST `/api/shops/{shopId}/queue/join`
Customer joins a queue.

Request:
```json
{
  "CustomerName": "Rahul"
}
```

Response:
```json
{
  "id": "entry-id",
  "shopId": "shop-id",
  "tokenNumber": 13,
  "customerName": "Rahul",
  "status": "Waiting",
  "position": 4,
  "estimatedWait": 60
}
```

### 12. POST `/api/shops/{shopId}/queue/next`
Moves the next waiting customer into `Serving`. Requires shop-owner auth.

Response:
```json
{
  "id": "entry-id",
  "tokenNumber": 13,
  "customerName": "Rahul",
  "status": "Serving"
}
```

### 13. PUT `/api/shops/{shopId}/queue/{entryId}/serving`
Manually marks a queue entry as serving. Requires shop-owner auth.

Response: updated queue entry.

### 14. PUT `/api/shops/{shopId}/queue/{entryId}/done`
Marks serving customer as done. Requires shop-owner auth.

Response: updated queue entry.

### 15. PUT `/api/shops/{shopId}/queue/{entryId}/noshow`
Marks customer as no-show. Requires shop-owner auth.

Response: updated queue entry.

## Backend Production Notes

Use PostgreSQL with PostGIS for nearby search:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE INDEX shops_location_gix
ON shops
USING GIST (location);
```

Store shop location as `geography(Point, 4326)`.

Nearby query:

```sql
WHERE ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, :radiusKm * 1000)
ORDER BY ST_Distance(location, ST_MakePoint(:lng, :lat)::geography)
```

Queue token creation must run inside a database transaction with row locking per shop and day. This prevents duplicate token numbers under high traffic.
