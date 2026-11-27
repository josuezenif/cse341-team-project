### Week05 Feature 4 Trains Pagination API
## Goal
Create pagination details in api/trains API. Adding error validations and sending the correct status codes to user before sending MongoDB Atlas information

# Steps to complete feature
- Create `parsePositiveInteger` function to take a string from the URL and transform it to Number()
- Create model function `getPaginatedTrains` which is to retrieve from Mongoose schema the trains given the user filter page, limit, sort, and order
- Create controller function `getTrainsPaginated` which serves as validation to check if req.query.params are OK and send the correct status codes. It should call the model function after validations are done.
- Call controller function in `api-routes.js` to maintain consisten code.

### Data Model

# Model function
- `getPaginatedTrains(filter={}, page, limit, sort, order)` retrieves database trains given the user params (filter = {}, page, limit, order, sort)

# Controller functions
- `parsePositiveInteger(value, defaultValue)` takes a string and converts it to number. Validates if req.query.name (example) is there, if not, return a default value.
- `getTrainsPaginated(filter={}, page, limit, sort, order)` validates integers and converts them to numbers (string -> number) from req.query using `parsePositiveInteger` validation function. Returns valid 400 error messages if validations do not pass. Returns a clear 200 status code with the data and pagination information

## Validation and testing
- The `api/trains` return all trains given the user filer which is page, limit, sort, order
- Returns a 200 status code and the correct information
- Returns 400 status code if page or limit params are not integers (whole numbers)
- Returns a 500 interbal service error or code implemented to handle unexpected errors is there
- App works successfully locally and rendered too