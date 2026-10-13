# Connecting the Existing React Frontend

The current frontend still stores demo accounts/progress/calendar in `localStorage`. Keep it as the Phase 1 visual prototype until this API is configured. During the integration phase:

1. Add `VITE_API_BASE_URL=http://localhost:5000/api/v1` to the frontend `.env` (Vite env files are frontend-only and must not contain secrets).
2. Create a shared `apiFetch(path, options)` helper that calls `fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } })`, parses the JSON response and throws `error.message` when `success` is false.
3. Replace `AppContext.login/register/logout` localStorage handlers with calls to `/auth/login`, `/auth/register`, `/auth/logout`; restore session by calling `/auth/me` when the app boots.
4. Read the catalogue from `/topics` and `/problems`, retaining `id` as the `slug` value so links like `/problems/two-sum` stay compatible.
5. On checkbox click, call `PUT /progress/:problemSlug` with `{completed:true|false}` and refresh `GET /progress`. Do not optimistically confirm permanently if the API returns an error.
6. Read/create/delete calendar sessions via `/calendar`; API responses use the frontend-compatible `date` and `duration` fields.
7. Load `/dashboard` and `/profile`; save profile changes with `PATCH /profile`.
8. Update register password help/validation from 6 to 8 characters to match backend validation.

During UI integration, handle loading and error states; never treat a localStorage demo user as an authenticated backend session.
