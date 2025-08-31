# Toastique Juice Inventory

A tiny Node/Express + SQLite app to track juices and PAR levels, with PIN-based staff login.

## Features
- SQLite schema for juices with PAR levels
- REST API for listing and updating juices
- Staff authentication with PIN-based login
  - First login: set a 4-digit PIN
  - Subsequent logins: enter PIN
  - Cookie-based sessions
- Frontend:
  - Dynamic inventory table with sorting (by name or status)
  - Status column (OK, BELOW PAR, OUT)
  - Editing disabled when logged out; enabled when logged in
  - Auth box in header with Login/Logout

---

## API

### `GET /api/juices`

Returns list of all juices with derived status.

#### Sorting (server-side)
This endpoint supports server-side sorting via query params:

- `sort` → `name` | `status` (default: `name`)
- `dir`  → `asc`  | `desc`   (default: `asc`)

When sorting by **status**, the ranking is:
`OUT` < `BELOW PAR` < `OK` (ties break by name A→Z).

**Examples**
```
GET /api/juices?sort=name&dir=asc
GET /api/juices?sort=name&dir=desc
GET /api/juices?sort=status&dir=asc
```

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

### `PUT /api/juices/:id/liters` (protected)

Update `currentLiters` for a juice. Also updates `lastUpdated`.  
**Requires login.**

**Request body:**
```json
{ "liters": 5.5 }
```

- `liters` must be a finite number ≥ 0.  
- Invalid input → **400 Bad Request**  
- Unknown id → **404 Not Found**  
- Not logged in → **401 Unauthorized**

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

### Auth API

#### `GET /api/auth/users`
Returns list of staff users (id + name).  
_No PINs are ever returned._

#### `POST /api/auth/begin`
Start auth flow for a user.  
Body: `{ "userId": 1 }` → Response: `{ "name": "Rhea", "needsPinSetup": true }`

#### `POST /api/auth/set-pin`
First-time PIN setup.  
Body: `{ "userId": 1, "pin": "1234", "confirm": "1234" }`  
Response: `{ "id": 1, "name": "Rhea" }` and session is started.

#### `POST /api/auth/login`
Login with existing PIN.  
Body: `{ "userId": 1, "pin": "1234" }`  
Response: `{ "id": 1, "name": "Rhea" }`

#### `POST /api/auth/logout`
Logout. Returns **204 No Content**.

#### `GET /api/auth/me`
Returns current session user: `{ "id": 1, "name": "Rhea" }`  
If not logged in → **401 Unauthorized**.

---

## Environment

Example `.env` for local dev:

```
DB_PATH=db.sqlite
PORT=3000
SEED=true                # seed default juices + users
SESSION_SECRET=dev-secret # use a long random string in production!
```

- `SESSION_SECRET` is required in production for secure cookie signing.  
- In development, it falls back to `"dev-secret"` if unset.

---

## Tests

Run the spec suite (Vitest + Supertest):

```bash
npm test
```

Coverage includes:
- Juices API: GET returns valid statuses; PUT updates liters and bumps `lastUpdated`
- Auth API: `/begin`, `/set-pin`, `/login`, `/logout`, `/me`, `/users`
- Authz: PUT liters requires login (401 logged out, 200 logged in)
- Schema: `users` table exists and seeds default names
- Helpers: `loginAs` / `logout` for specs

---

## Deployment

On Render or other hosts:
- Set environment variable `SESSION_SECRET` to a long random string.
- Run with `NODE_ENV=production` for secure session cookies.
- Use `SEED=true` to seed default juices and users on first deploy.
