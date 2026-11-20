## Kizuna rail Team project Week04 
# Week04 Feature 1: Core authentication

### GOAL:
Create functionality to register new users, login user and create a session, and logout user (destroy session)
For POST /logout, the code must be completed for Feature 2. Feature 1 must be completed before any other feature. It is dependant on other features.

## GOALS IN DETAIL
- Create a Mongoose schema in `src/models/schema/.user.js` for users 
- Create a Mongoose schema in `src/models/schema/.roles.js` for roles `customer` and `admin`
- Update `src/db/initialize.js` to add the roles from `roles.js` schema. Import to database by running in command: `npm run db:import`
- Create register and login pages in `src/views` directory
- Add register and login routes to view the forms in the app. Hint: `router.get('/regiser', registerPage)`. Same for login page. Make sure to use the ejs-router.js when you implement router GET calls
- Create model functions to `createUser(name, email, passwordHash)`, `findUserByEmail(email)`, and `verifyPassword(password, passwordHash)`. Hint: use `bcrypt.compare()`. Note: all model functions must be coded using Mongoose methods. Ex: User.findOne({email: userEmail}), etc.
- Create logout() model function. This function should take `req.session.user` (user's session) and delete it or destroy the session. Use `delete` keyword. EXAMPLE: if (session){ delete session}. This is just an example not actual working code. 
- Create controller functions for models functions and wrap around try/catch blocks. Handle different errors like 401 unauthorized and 403 Forbidden. Finish with `res.render()` and in case of errors, `res.redirect()`.
- Create register route logic for each controller function. Use the `POST` to create. Ex: `router.post('register', register)`, same goas for all other controller functions.
- Create middleware functions to protect admin or customer only pages. This functions are: 
requireApiLogin()
requirePageLogin()
requireApiRole(roleName)
requirePageRole(roleName)
See Learning Activity #2: Session Authentication and Middleware for more details or click link: https://byui-cse.github.io/cse341-ww-course-v2/week04/prepare-auth-middleware.html

- Create ejs admin page and use middleware functions so only admin users can view the page. Other `role` users must receive a 403 Forbidden error.


### Data Model

## Users schema
- `name`: {
        type: String,
        required: true
    },
- `email`: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
- `passwordHash`: {
        type: String,
        required: true
    },
- `role`: { (must reference `roles` id)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    }

## Roles schema
- `name`: {
        type: String,
        enum: ['customer', 'admin'],
        unique: true,
        required: true
    }
Id is given automatically once db:import is run 

## Model functions
- `createUser` function must receive the next parameters: name, email, passwordHash. For passwordHash, you must hash it before sending it to the function.
- `findEmailById` function must receive the user's email as a parameter and findOne() in the database and return it. The possible errors are 404 Not found, 500 Internal service error. Success codes must be: 200 with the user info
- `verifyPassword` function must verify the user's password and the hashed password from the database. This function will be used in the login page. Use bcrypt.compare() to verify. Returns true or false (boolean). Redirect to login if password is false.


### Controller functions
- `register` functions must call the createUser model function and its parameters are the same as the model function. Use req.body to get the info from the form.

- `login` verifies password by getting user info from `getUserById` and then comparing the form password with the user.passwordHash taken from the database. Return a user session if passoword matches. Else, return back to login

- `logout` function will be used in Feature 2. This function destroys the user's session when  `POST /logout` is called.


### Middleware 

- `requireApiLogin()`: Return JSON with a 401 error if the user is not authenticated.
- `requirePageLogin()`: Redirect to the login page if the user is not authenticated.
- `requireApiRole(role)`: Return JSON with a 401 error if the user is not authenticated or a 403 error if the user does not have the required role.
- `requirePageRole(role)`: Redirect to the login page if the user is not authenticated or to a 403 error page if the user does not have the required role.


### Test plan

- All model and controller functions are created and return the correct information when called by `GET` or `POST`
- EJS views were created for `register` and `login`. They are called and defined in the `ejs-router.js`.
- Users schema and Roles schema were created with the correct information as defined in ### Goals in detail
- All middleware functions are successfully created and admin page can only be viewed by an admin role user. If no admin role, redirect to `forbidden.ejs` page. If user with no session tries to get in admin page, redirect back to `login.ejs` page.

- App works locally and rendered in Render.com

