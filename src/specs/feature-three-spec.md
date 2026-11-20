# Kizuna Rail Week 03 Spec for Feature Set 3
# Feature Set 3: Bookings

### GOAL
Rename the `confirmations` collection to `bookings`, and create and implement the Mongoose schema, model functions, API controller, API route, and EJS pages for bookings. The work includes the bookings schema, model functions (create, getAll, getById), the `getAllBookings` API handler, the `/api/bookings` route with Swagger documentation, moving and refactoring the existing booking handlers, and a new bookings admin page. This feature set is required for all teams because it will be used in future assignments.

### Data Model
Booking documents will be stored in the `bookings` collection. The collection and all related code (variable names, comments, imports, Swagger text) must use the term `bookings` instead of `confirmations`. Existing documents in `confirmations` must be moved to `bookings` so no data is lost.

The schema is defined in `src/models/schemas/bookings.js`. It must include every field the application currently saves when a booking is created, including passenger data, as Mongoose fields with types and required rules. Baseline fields:

- `id`: string, required, unique, custom id such as `bk1`
- `passengers`: array of passenger objects, required, at least one passenger. Each passenger holds the passenger data the booking form currently collects (for example `name`, `email`)
- trip or train reference: string, required, references the `id` of the trip or train being booked
- `createdAt`: date, set automatically (Mongoose `timestamps`)

Bookings use their custom string `id` rather than MongoDB `_id` in route parameters and in responses.

### Model Functions (`src/models/bookings.js`)
All model functions use Mongoose and the new schema to query the database and return the results. They do not send HTTP responses.

- `createBooking(bookingData)`: receives all necessary booking information, including passenger data, and creates a new booking document. Returns the created booking. Throws an error if the data fails schema validation or the `id` already exists.
- `getAllBookings()`: returns an array of all bookings (an empty array if there are none).
- `getBookingById(id)`: returns the booking with that custom `id`, or `null` if none exists.

### Routes

## GET /api/bookings
Purpose: Return all bookings.

Controller: `getAllBookings` in `src/controllers/bookings.js`, which calls the model function and sends a JSON response. Route defined in `src/routes/api-routes.js`.

Success:
- Status code: `200`
- Response body: an array of all bookings (`[]` when there are none)

Errors:
- `500` with a JSON error message if an unexpected server or database error occurs

### Swagger Documentation
Swagger comments must document `/api/bookings`, including the `200` response schema with an example booking and the `500` error response.

### Deployment expectations
After implementation, the code must work successfully locally, handling success responses and errors. After deploying from GitHub, the program must work on the deployed Render page, using the renamed `bookings` collection.

---

### PART 2 UPDATING EXISTING BOOKING CODE AND ADDING THE ADMIN PAGE
### GOAL:
Move the existing booking logic into the bookings controller using the new model functions, and add a bookings admin page that loads its data from `GET /api/bookings`.

- Move `processBookingRequest` to `src/controllers/bookings.js` and refactor it to use `createBooking`. It must not query the database directly. On success it continues the booking flow as before, and on a validation or database error it handles the failure gracefully (an error message, not a crash).
- Move `bookingPage` to `src/controllers/bookings.js` and refactor it to use `getBookingById` and/or `getAllBookings`. If the booking is not found, it responds with a `404`. On an unexpected error, it responds with a `500`.
- Update the routing logic for the existing booking routes so they use the controller functions in `src/controllers/bookings.js`.
- Create the bookings admin page `src/views/bookings.ejs`, an EJS controller function in `src/controllers/bookings.js`, and an EJS route that maps to `/bookings-admin`.
- The admin page uses client-side JavaScript to call `GET /api/bookings` and dynamically populate the list of bookings (follow the approach of the trains page). It must not use EJS to loop over bookings and render them. The page shows a loading state, an empty state when there are no bookings, and an error message if the request fails.

## Testing and deploying
- No references to `confirmations` remain in the code, and the database uses the `bookings` collection
- Creating a booking through the app saves a document in `bookings` that includes the passenger data
- `GET /api/bookings` returns `200` and an array, and Swagger "Try it out" works for it
- `processBookingRequest` and `bookingPage` are in `controllers/bookings.js` and use only model functions
- The existing booking routes still work
- `/bookings-admin` populates the list dynamically from `/api/bookings` (view source shows no booking rows)
- Must work locally and then deployed on the Render site