

# Project Foundation

This project has been built based on these two projects for case study and education purposes:

- [bezkoder/node-express-mongodb](https://github.com/bezkoder/node-express-mongodb) — A foundational Node.js + Express + MongoDB CRUD REST API example
- [bezkoder/jwt-refresh-token-node-js-mongodb](https://github.com/bezkoder/jwt-refresh-token-node-js-mongodb) — Demonstrates JWT authentication with refresh token implementation

This implementation combines both projects to create a complete authentication and authorization system with role-based access control for tutorial management.

---

## Tutorials CRUD API with Role-Based Access Control

The project integrates a Tutorials CRUD REST API protected by JWT authentication and role-based access control (RBAC).

### Roles & Permissions

| Role        | Read | Create | Update | Delete |
|-------------|------|--------|--------|--------|
| `user`      | ✅   | ❌     | ❌     | ❌     |
| `moderator` | ✅   | ✅     | ✅     | ❌     |
| `admin`     | ✅   | ✅     | ✅     | ✅     |

All endpoints require a valid JWT token supplied via the `x-access-token` header.

### Tutorial Endpoints

| Method | Endpoint                     | Required Role        | Description                    |
|--------|------------------------------|----------------------|--------------------------------|
| GET    | `/api/tutorials`             | user / mod / admin   | Retrieve all tutorials         |
| GET    | `/api/tutorials/published`   | user / mod / admin   | Retrieve published tutorials   |
| GET    | `/api/tutorials/:id`         | user / mod / admin   | Retrieve a tutorial by ID      |
| POST   | `/api/tutorials`             | moderator / admin    | Create a new tutorial          |
| PUT    | `/api/tutorials/:id`         | moderator / admin    | Update a tutorial by ID        |
| DELETE | `/api/tutorials/:id`         | admin                | Delete a tutorial by ID        |
| DELETE | `/api/tutorials`             | admin                | Delete all tutorials           |

One of the endpoints is broken

### Endpoint Details & Expected Functionality

#### **GET `/api/tutorials`**
- **Required Role:** user, moderator, or admin
- **Expected Behavior:** Returns all tutorials from the database (published and unpublished)
- **Response:** Array of tutorial objects with pagination support
- **Status Codes:** 200 (Success), 401 (Unauthorized), 403 (Forbidden)

#### **GET `/api/tutorials/published`**
- **Required Role:** user, moderator, or admin
- **Expected Behavior:** Returns only published tutorials (where `published: true`)
- **Response:** Filtered array of tutorials
- **Status Codes:** 200 (Success), 401 (Unauthorized), 403 (Forbidden)

#### **GET `/api/tutorials/:id`**
- **Required Role:** user, moderator, or admin
- **Expected Behavior:** Retrieves a single tutorial by its MongoDB ObjectId
- **Response:** Single tutorial object matching the provided ID
- **Status Codes:** 200 (Success), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)

#### **POST `/api/tutorials`**
- **Required Role:** moderator or admin
- **Expected Behavior:** Creates a new tutorial with provided title, description, and published status
- **Request Body:** `{ "title": "string", "description": "string", "published": boolean }`
- **Response:** Created tutorial object with generated ID and timestamps
- **Status Codes:** 201 (Created), 401 (Unauthorized), 403 (Forbidden), 400 (Bad Request)

#### **PUT `/api/tutorials/:id`**
- **Required Role:** moderator or admin
- **Expected Behavior:** Updates an existing tutorial by ID with new title, description, or published status
- **Request Body:** `{ "title": "string", "description": "string", "published": boolean }`
- **Response:** Updated tutorial object with new `updatedAt` timestamp
- **Status Codes:** 200 (Success), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 400 (Bad Request)

#### **DELETE `/api/tutorials/:id`**
- **Required Role:** admin only
- **Expected Behavior:** Deletes a single tutorial by ID
- **Response:** Confirmation message or empty response
- **Status Codes:** 200 (Success), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)

#### **DELETE `/api/tutorials`**
- **Required Role:** admin only
- **Expected Behavior:** Deletes all tutorials from the database (bulk delete operation)
- **Response:** Confirmation message with count of deleted documents
- **Status Codes:** 200 (Success), 401 (Unauthorized), 403 (Forbidden)

### Tutorial Object

```json
{
  "id": "<mongo-id>",
  "title": "string",
  "description": "string",
  "published": false,
  "createdAt": "ISO-date",
  "updatedAt": "ISO-date"
}
```

### How It Works

- **`isModeratorOrAdmin` middleware** — added to `app/middlewares/authJwt.js`; allows requests through if the authenticated user holds either the `moderator` or `admin` role.
- **`isAdmin` middleware** — existing middleware; restricts access to `admin` role only.
- **`verifyToken` middleware** — validates the JWT and attaches `req.userId` for downstream role checks.

---

## Authentication Endpoints

These endpoints handle user registration, login, and token refresh operations.

### **POST `/api/auth/signup`**
- **Authentication Required:** No
- **Validation Applied:**
  - Checks for duplicate username
  - Checks for duplicate email
  - Validates assigned roles exist in the system
- **Expected Behavior:** Registers a new user account with username, email, password, and assigned roles
- **Request Body:** 
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "roles": ["user", "moderator", "admin"]
  }
  ```
- **Response:** User object with assigned roles and ID
- **Status Codes:** 201 (Created), 400 (Bad Request - duplicate user/email), 400 (Bad Request - invalid role)

### **POST `/api/auth/signin`**
- **Authentication Required:** No
- **Expected Behavior:** Authenticates user credentials and returns access token and refresh token
- **Request Body:** 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:** 
  ```json
  {
    "id": "<user-id>",
    "username": "string",
    "email": "string",
    "roles": ["user|moderator|admin"],
    "accessToken": "<jwt-token>",
    "refreshToken": "<refresh-token>"
  }
  ```
- **Status Codes:** 200 (Success), 401 (Unauthorized - invalid credentials), 404 (User not found)

### **POST `/api/auth/refreshtoken`**
- **Authentication Required:** No (but refresh token required)
- **Expected Behavior:** Generates a new access token using a valid refresh token
- **Request Body:** 
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:** 
  ```json
  {
    "accessToken": "<new-jwt-token>",
    "refreshToken": "<refresh-token>"
  }
  ```
- **Status Codes:** 200 (Success), 403 (Forbidden - invalid or expired refresh token), 404 (Refresh token not found)

---

## User Board / Test Endpoints

These endpoints demonstrate role-based access control and are used for testing authorization.

### **GET `/api/test/all`**
- **Authentication Required:** No
- **Expected Behavior:** Publicly accessible endpoint; returns a public welcome message
- **Response:** Public access message
- **Status Codes:** 200 (Success)

### **GET `/api/test/user`**
- **Authentication Required:** Yes (valid JWT token required in `x-access-token` header)
- **Required Role:** user (or moderator/admin)
- **Expected Behavior:** Returns user-specific board/dashboard content; accessible to authenticated users
- **Response:** User board message with user information
- **Status Codes:** 200 (Success), 401 (Unauthorized - no token), 401 (Unauthorized - invalid token)

### **GET `/api/test/mod`**
- **Authentication Required:** Yes (valid JWT token required)
- **Required Role:** moderator or admin
- **Expected Behavior:** Returns moderator-specific board/dashboard content; restricted to moderators and admins
- **Response:** Moderator board message with moderation utilities
- **Status Codes:** 200 (Success), 401 (Unauthorized - no token), 403 (Forbidden - insufficient role)

### **GET `/api/test/admin`**
- **Authentication Required:** Yes (valid JWT token required)
- **Required Role:** admin only
- **Expected Behavior:** Returns admin-specific board/dashboard content; restricted to administrators
- **Response:** Admin board message with admin utilities
- **Status Codes:** 200 (Success), 401 (Unauthorized - no token), 403 (Forbidden - insufficient role)

---

## Node.js JWT Refresh Token with MongoDB example
JWT Refresh Token Implementation with Node.js Express and MongoDB. You can know how to expire the JWT, then renew the Access Token with Refresh Token.

For instruction, please visit:
> [Node.js JWT Refresh Token with MongoDB example](https://bezkoder.com/jwt-refresh-token-node-js-mongodb/)

The code in this post bases on previous article that you need to read first:
> [Node.js + MongoDB: User Authentication & Authorization with JWT](https://bezkoder.com/node-js-mongodb-auth-jwt/)

## User Registration, User Login and Authorization process.

The diagram shows flow of how we implement User Registration, User Login and Authorization process.

![jwt-token-authentication-node-js-example-flow](jwt-token-authentication-node-js-example-flow.png)

And this is for Refresh Token:

![jwt-refresh-token-node-js-example-flow](jwt-refresh-token-node-js-example-flow.png)

## More Practice:
> [Node.js, Express & MongoDb: Build a CRUD Rest Api example](https://bezkoder.com/node-express-mongodb-crud-rest-api/)

> [Server side Pagination in Node.js with MongoDB and Mongoose](https://bezkoder.com/node-js-mongodb-pagination/)

Associations:
> [MongoDB One-to-One relationship tutorial with Mongoose examples](https://bezkoder.com/mongoose-one-to-one-relationship-example/)

> [MongoDB One-to-Many Relationship tutorial with Mongoose examples](https://bezkoder.com/mongoose-one-to-many-relationship/)

> [MongoDB Many-to-Many Relationship with Mongoose examples](https://bezkoder.com/mongodb-many-to-many-mongoose/)

Fullstack:
> [Vue.js + Node.js + Express + MySQL example](https://bezkoder.com/vue-js-node-js-express-mysql-crud-example/)

> [Vue.js + Node.js + Express + PostgreSQL example](https://bezkoder.com/vue-node-express-postgresql/)

> [Vue.js + Node.js + Express + MongoDB example](https://bezkoder.com/vue-node-express-mongodb-mevn-crud/)

> [Angular 8 + Node.js + Express + MySQL example](https://bezkoder.com/angular-node-express-mysql/)

> [Angular 8 + Node.js + Express + PostgreSQL example](https://bezkoder.com/angular-node-express-postgresql/)

> [Angular 8 + Node.js + Express + MongoDB example](https://bezkoder.com/angular-mongodb-node-express/)

> [Angular 10 + Node.js + Express + MySQL example](https://bezkoder.com/angular-10-node-js-express-mysql/)

> [Angular 10 + Node.js + Express + PostgreSQL example](https://bezkoder.com/angular-10-node-express-postgresql/)

> [Angular 10 + Node.js + Express + MongoDB example](https://bezkoder.com/angular-10-mongodb-node-express/)

> [Angular 11 + Node.js Express + MySQL example](https://bezkoder.com/angular-11-node-js-express-mysql/)

> [Angular 11 + Node.js + Express + PostgreSQL example](https://bezkoder.com/angular-11-node-js-express-postgresql/)

> [Angular 11 + Node.js + Express + MongoDB example](https://bezkoder.com/angular-11-mongodb-node-js-express/)

> [React + Node.js + Express + MySQL example](https://bezkoder.com/react-node-express-mysql/)

> [React + Node.js + Express + PostgreSQL example](https://bezkoder.com/react-node-express-postgresql/)

> [React + Node.js + Express + MongoDB example](https://bezkoder.com/react-node-express-mongodb-mern-stack/)

Integration (run back-end & front-end on same server/port)
> [Integrate React with Node.js Restful Services](https://bezkoder.com/integrate-react-express-same-server-port/)

> [Integrate Angular with Node.js Restful Services](https://bezkoder.com/integrate-angular-10-node-js/)

> [Integrate Vue with Node.js Restful Services](https://bezkoder.com/serve-vue-app-express/)

## Project setup
```
npm install
```

### Run
```
node server.js
```
