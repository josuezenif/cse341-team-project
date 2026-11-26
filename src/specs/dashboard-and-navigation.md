## Kizuna rail Team project Week04 
# Week04 Feature Set 2: User Dashboard and Navigation

### GOAL:
Add a dashboard for standard users, role-aware navigation in the header, and role-based redirects after login.

1. **Standard user dashboard** (`/dashboard`) shows: a welcome message with the user's display name; the list of bookings where the user's email matches one of the passengers, loaded dynamically by client-side JavaScript from the API (no EJS loop over bookings); a link to the booking admin page (`/bookings-admin`); and a link to the user admin page.
2. **Header, signed-out users only:** links to Register and Login.
3. **Header, signed-in users only:** a link to Logout.
4. **Header, signed-in users only:** a link to the dashboard. Admins go to the admin dashboard; everyone else goes to `/dashboard`.
5. **Login redirect:** after a successful login, admins go to the admin dashboard and all other users go to `/dashboard`. The redirect target is decided by the server from the user's role, never from a query-string parameter (this avoids open redirects).

Hiding a link is only a convenience. Every protected page and API route must enforce access on the server.

### Data Model:
**Schemas**
- No new collections. Uses the existing `users` fields (`displayName`, `email`, `role`; use the names your schema has) and `bookings.passengers[].email`.
- Emails are trimmed and lowercased when users register, when they log in, and when a booking is created, so matching is exact and case-insensitive.
- Add an index on `bookings.passengers.email` so the dashboard query does not scan the collection.

**Model functions** (`src/models/bookings.js`)
- `getBookingsByPassengerEmail(email)`: returns bookings where any passenger email equals the (normalized) email, newest first (`createdAt` descending), or `[]`. Uses an exact match, never a regular expression built from input.

**Controller functions** (`src/controllers/`)
- `getMyBookings` (API, `bookings.js`): `GET /api/bookings/me`. The email comes from the signed-in user, never from a query parameter or request body. Returns only the fields the dashboard needs.
- `userDashboardPage` (EJS): `GET /dashboard`, renders `src/views/dashboard.ejs` with the display name (falls back to the email if the display name is empty).
- Login controller (update): redirects to the admin dashboard if `role` is admin, otherwise to `/dashboard`. A failed login re-renders the login page with the error message.
- `dashboard.ejs` client-side script: calls `GET /api/bookings/me`, then builds the list with `textContent` (not `innerHTML`), because passenger names and emails are user-entered.

**Routes**

| Route | Access | Notes |
|---|---|---|
| `GET /dashboard` | signed in | standard dashboard; an admin who opens it is redirected to the admin dashboard |
| `GET /api/bookings/me` | signed in | the user's bookings, with Swagger docs |
| `GET /api/bookings` | admin only (changed) | returns every booking, including passenger data, so it must not stay public; update its Swagger docs with `401` and `403` |
| `/bookings-admin`, user admin page, admin dashboard | admin only | standard users who open them get `403` |
| `GET /login`, `GET /register` | signed out | signed-in users are redirected to their dashboard |

**Middleware**
- `setUserLocals`: runs on every request and sets `res.locals.user` (id, displayName, role) and `res.locals.dashboardUrl` (admin dashboard or `/dashboard`). The shared header partial uses these to show Register and Login or Dashboard and Logout, so every page, including error pages, renders the right header.
- `requireAuth`: signed-out pages redirect to `/login` with the message below; API routes return `401` JSON. If the session or token refers to a user that no longer exists, treat it as signed out.
- `requireAdmin`: runs after `requireAuth`; non-admins get `403` (an error page for pages, JSON for the API).
- `noStore`: sets `Cache-Control: no-store` on the dashboard and admin pages so the back button after logout does not show them.
- Auth hygiene (as supported by your session or token setup): create a fresh session on login, destroy it on logout, and set `httpOnly`, `sameSite`, and (on Render) `secure` cookie flags.

### Errors and Messages
API errors use `{ "error": { "code": "...", "message": "..." } }`.

| Status | Code | Message | Where shown |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Email and password are required. | Login page |
| 401 | `INVALID_CREDENTIALS` | Invalid email or password. (same text for an unknown email and a wrong password) | Login page |
| 401 | `UNAUTHENTICATED` | You must be signed in to access this resource. | API JSON; pages redirect to `/login` with "Please sign in to continue." |
| 403 | `FORBIDDEN` | You do not have permission to access this page. | Error page or API JSON |
| 500 | `INTERNAL_ERROR` | Something went wrong. Please try again later. | Error page or API JSON (no stack traces or database messages) |

Dashboard messages (client side): while loading, "Loading your bookings..."; with no results, "You have no bookings yet."; on a failed request, "We couldn't load your bookings. Please try again."; if the API returns `401`, redirect to `/login` with "Your session has expired. Please sign in again."

## Test Plan
- **Header:** signed out shows only Register and Login; signed in shows only Dashboard and Logout, and the Dashboard link goes to the admin dashboard for an admin and to `/dashboard` for a standard user
- **Login redirect:** an admin logging in lands on the admin dashboard and a standard user lands on `/dashboard`; a signed-in user who opens `/login` is redirected to their dashboard
- **Login errors:** a wrong password and an unknown email both show "Invalid email or password."; an empty form shows "Email and password are required."
- **Dashboard content:** `/dashboard` shows the welcome message with the display name and links to the booking admin page and the user admin page
- **Bookings list:** the list is loaded from `GET /api/bookings/me` (View Source shows no booking rows) and contains only bookings where the user's email is a passenger, ignoring case (`Ana@Mail.com` matches `ana@mail.com`)
- **Empty and error states:** with no bookings the page shows "You have no bookings yet."; when the request fails it shows "We couldn't load your bookings. Please try again."
- **XSS safety:** a display name or passenger name containing `<script>` or `<b>` appears as plain text
- **Signed out:** `/dashboard` redirects to `/login`, and `GET /api/bookings/me` and `GET /api/bookings` return `401` JSON
- **Standard user:** `GET /api/bookings`, the booking admin page, the user admin page, and the admin dashboard return `403`; `GET /api/bookings/me?email=someone@else.com` still returns only the signed-in user's bookings
- **Deployment:** all of the above works on the deployed Render site, and the pull request is linked to this issue and merged to `main`