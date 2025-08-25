## API

### `GET /api/juices`

Returns list of all juices with derived status.

**200 OK**
```json
[
  {
    "id": 1,
    "name": "Apple Juice",
    "parLiters": 6,
    "currentLiters": 7,
    "lastUpdated": "2025-08-24T09:12:34.000Z",
    "status": "OK"
  },
  {
    "id": 2,
    "name": "Ginger",
    "parLiters": 4,
    "currentLiters": 3,
    "lastUpdated": "2025-08-24T09:11:10.000Z",
    "status": "BELOW PAR"
  }
]
```

---

### `PUT /api/juices/:id/liters`

Update `currentLiters` for a juice. Also updates `lastUpdated`.  
Returns the updated juice record with derived `status`.

**Request body:**
```json
{ "liters": 5.5 }
```

- `liters` must be a finite number ≥ 0.  
- Invalid input → **400 Bad Request**  
- Unknown id → **404 Not Found**

**200 OK**
```json
{
  "id": 2,
  "name": "Ginger",
  "parLiters": 4,
  "currentLiters": 5.5,
  "lastUpdated": "2025-08-24T09:20:10.000Z",
  "status": "OK"
}
```

---

## Tests

The spec suite (Vitest + Supertest) enforces:

- All list items have required fields and valid ISO `lastUpdated`.  
- `status` is always derived, never stored.  
- PUT updates liters, bumps `lastUpdated`, returns updated record.  
- PUT rejects invalid inputs (string, negative, missing, null, etc.).  
- PUT returns **404** on unknown ID.
