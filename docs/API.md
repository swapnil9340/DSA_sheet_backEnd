# API Catalogue

Base URL: `/api/v1`. JSON responses use `{ "success": true, "data": ... }`; failures use `{ "success": false, "error": { "code", "message", "details?" } }`.

## Health and catalogue

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | Public | ALB health check |
| GET | `/api/v1/health` | Public | API health check |
| GET | `/api/v1/topics` | Public | Ordered list of active chapters |
| GET | `/api/v1/problems` | Optional | Filter/search/paginate problems |
| GET | `/api/v1/problems/:slug` | Public | One problem and its resources |

`GET /problems` query params: `search` or `q`, `chapter` (name) or `topic` (slug/name), `difficulty` (`Easy|Medium|Hard`), `page` (default 1), `limit` (default 50, maximum 100), and optional `status=completed|incomplete` (requires login). Problem records include frontend-compatible fields: `id`, `number`, `title`, `chapter`, `difficulty`, `pattern`, `summary`, `practiceUrl`, `youtubeUrl`, `articleUrl`.

## Auth

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | `{name,email,password}` | Create student account and set session cookie |
| POST | `/api/v1/auth/login` | `{email,password}` | Authenticate and set session cookie |
| POST | `/api/v1/auth/logout` | none | Clear session cookie |
| GET | `/api/v1/auth/me` | none | Return current authenticated user |

Passwords must be 8–72 characters. Email is normalized to lowercase. Public registration always creates a `student`; users cannot set their role through the register endpoint.

## Progress and dashboard (authenticated)

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/progress` | none | List completed problem IDs for the current user |
| PUT | `/api/v1/progress/:problemSlug` | `{completed:boolean}` | Mark a problem complete/incomplete idempotently |
| GET | `/api/v1/dashboard` | none | Stats, chapter progress, difficulty counts, upcoming sessions |

Progress writes are scoped to the current user. A unique `{ userId, problemId }` index prevents duplicate per-user records.

## Calendar and profile (authenticated)

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| GET | `/api/v1/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` | none | List the current user's plans, optionally date-filtered |
| POST | `/api/v1/calendar` | `{title,topic,date,time,duration,notes?}` | Create a study session |
| PATCH | `/api/v1/calendar/:id` | One or more supported fields | Update an owned study session |
| DELETE | `/api/v1/calendar/:id` | none | Delete an owned study session |
| GET | `/api/v1/profile` | none | Read profile |
| PATCH | `/api/v1/profile` | `{name}` | Update display name |

Calendar `date` is `YYYY-MM-DD`; `time` is 24-hour `HH:mm`; `duration` is one of `25,45,60,90,120` minutes. Session ownership is checked in every read/update/delete query.

## Sample requests

```bash
# Register (cookie stored by browser; use credentials: include in frontend)
curl -i -X POST http://localhost:5000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo Student","email":"demo@example.com","password":"long-demo-password"}'

# Public catalogue
curl 'http://localhost:5000/api/v1/problems?chapter=Arrays%20%26%20Hashing&difficulty=Easy&page=1&limit=20'

# Mark a problem complete: use a cookie jar from the register/login call
curl -b cookies.txt -X PUT http://localhost:5000/api/v1/progress/two-sum \
  -H 'Content-Type: application/json' -d '{"completed":true}'
```
