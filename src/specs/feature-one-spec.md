# Kizuna Rail Week 03 Spec for Feature 1
# Feature 1: Trips 

### GOAL
Create and implement the mongoose schema, model, controller, and routes functions for trips database. The functions include mongoose schema, GET routes (getAll, getById), controller functions (handlers), route callings for APIs and deploying .ejs pages.

### Data Model
Trip documents will be stored in `trips` collection.

Required trip fields:
- `id`: string, required, unique, custom id such as `jt1` stands for Japan Trip 1 (t1 will be used for trains documents)
- `name`: string, required
- `description`: string, required
- `imageUrl`: string (url), required
- `region`: string, required
- `durationHours`: Number, required (can accept decimals)
- `distanceKm`: Number, required (can accept decimals)
- `bestSeason`: string, required

### Routes

## GET /trips
Purpose: Return all trips

Success:
- Status code : `200`
- Response body: an array of all trips

Errors:
- `500` if an unexpected server or database error occurs

## GET /trips/:id
Purpose: Return one trips by its custom id.

Success:
- Status code: `200`
- Response body: the matching trip object

Errors:
- `404` if no trip exists with that id
- `500` if an unexpected server or database error occurs


### Swagger Documentation
Swagger comments must document every trips route

### Deployment expectations 
After implemenation, code and program must work successfully locally, handling success messages and errors. Then after deploying from Github, the program must work from deployed Render page.


### PART 2 UPDATING EJS PAGES 
 ### GOAL: 
 Update the list.ejs static page (page to show all trips) to use dynamic web information from APIs GET /trips

- Update the trip list page (/src/view/trips/list.ejs) to use the web service hydration approach
- Refactor the current details.js EJS controller function to use the new trips model function
- Refactor the current list.js EJS controller function
- Update the current routing logic for the trips EJS routes to use the new EJS controller functions

## Testing and deploying
- `list.ejs` page dynamically displays trips information from recent created API
- Must work locally and then deployed on render site
