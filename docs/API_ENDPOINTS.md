# CutBook API Contract

Frontend base URL comes from `VITE_API_URL`.

This contract was implemented from `D:/LatestCutbookApis/cutbook_api_docs.html`.

## Authentication

- `POST /api/auth/register/customer` registers a customer.
- `POST /api/auth/register/shopowner` registers a shop owner and starts the free trial.
- `POST /api/auth/login` logs in either role.

Auth responses use:

```json
{
  "token": "jwt-token",
  "role": "Customer",
  "userId": 1,
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com"
}
```

All non-auth endpoints require `Authorization: Bearer <token>`.

## Shop Management

- `POST /api/shop` creates a shop.
- `PUT /api/shop` updates shop details.
- `POST /api/shop/go-live` makes the shop visible in search.
- `POST /api/shop/go-offline` hides the shop from search.
- `GET /api/shop/my-shop` returns the owner shop.
- `POST /api/shop/services` adds a service.
- `DELETE /api/shop/services/{serviceId}` removes a service.

## Shop Discovery

- `POST /api/shop/search-nearby` finds live shops by location.

Request:

```json
{
  "latitude": 30.735,
  "longitude": 76.778,
  "radiusKm": 5,
  "salonType": "Unisex"
}
```

## Customer Queue Requests

- `POST /api/queue/request` sends a haircut request to a shop.
- `GET /api/queue/my-request` returns the customer's active request and token status.

## Shop Owner Queue Management

- `GET /api/queue/pending` returns incoming requests.
- `POST /api/queue/accept/{requestId}` accepts a request and assigns a token.
- `POST /api/queue/reject/{requestId}` rejects a request.
- `GET /api/queue/live-queue` returns all non-done queue entries.
- `POST /api/queue/next` completes the current customer and moves the next waiting customer to `InProgress`.

Queue status values used by the frontend:

```txt
Waiting
InProgress
Done
```

Request status values used by the frontend:

```txt
Pending
Accepted
Rejected
Completed
Cancelled
```

## SignalR Notes

The supplied docs include `/hubs/shop` with these events:

- Shop owner: `NewRequest`, `QueueUpdated`
- Customer: `RequestAccepted`, `RequestRejected`, `YourTurn`, `HaircutCompleted`

The current frontend uses polling every 8 seconds. SignalR can be added later without changing the REST service modules.
