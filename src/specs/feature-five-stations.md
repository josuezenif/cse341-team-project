# Feature Set 5: Stations

## Overview

Expose station records through Mongoose-backed JSON endpoints and let visitors
expand station details from the trip details page without reloading the page.

## Data model

The `stations` collection uses the existing seeded records:

- `id`: required, unique string identifier.
- `name`: required station name.
- `prefecture`: required prefecture name.
- `region`: required region identifier.
- `facilities`: required array of facility strings.
- `description`: required station description.

Mongoose timestamps are enabled on the schema.

## API

### `GET /api/stations`

- `200`: JSON array of station objects.
- `500`: JSON error message if the database query fails.

### `GET /api/stations/{id}`

- `200`: matching station object.
- `404`: JSON error message if no station has the requested custom `id`.
- `500`: JSON error message if the database query fails.

## Trip details UI

The start and end station each have a button that fetches
`GET /api/stations/{id}` when expanded. Show prefecture, region, description,
and facilities with DOM text nodes. Cache successfully loaded station records
for repeated toggles, and provide an error message if a request fails.

## Test plan

- Verify `GET /api/stations` returns JSON and all 12 seeded records.
- Verify `GET /api/stations/nagoya` returns the matching station record.
- Verify a missing station returns `404`.
- Verify the trip details page has station-detail controls for both station IDs.
- In a browser, expand a station and confirm its details load, the button
  reports its expanded state, and the rest of the trip page remains available.
- Run `npm test` and `npm run lint`.
