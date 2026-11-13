# Dog Adoption Platform API

A REST API for a dog adoption platform, built with Node.js, Express, and MongoDB.
Users can register, log in, register dogs for adoption, adopt dogs, and list
the dogs they have registered or adopted.

## Features

- User registration with hashed passwords (bcrypt)
- Login that issues a JWT valid for 24 hours
- Register a dog with a name and description
- Adopt a dog, with a thank-you message for the owner
- Remove a dog you registered, if it has not been adopted
- List your registered dogs, with status filtering and pagination
- List your adopted dogs, with pagination

## Setup

1. Install the dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to a new file named `.env` and fill in your own values:

   | Key | Description |
   |---|---|
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `DB_NAME` | Name of the database |
   | `PORT` | Port for the server (for example 3000) |
   | `JWT_SECRET` | A long random string used to sign tokens |

3. Start the server:

   ```
   npm run dev
   ```

## Endpoints

All `/api/dogs` routes require an `Authorization: Bearer <token>` header.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with `username` and `password` |
| POST | `/api/auth/login` | Log in and receive a token |
| POST | `/api/dogs` | Register a dog with `name` and `description` |
| GET | `/api/dogs` | List your registered dogs. Optional: `status`, `page`, `limit` |
| GET | `/api/dogs/adopted` | List dogs you adopted. Optional: `page`, `limit` |
| POST | `/api/dogs/:id/adopt` | Adopt a dog. Optional body: `thankYouMessage` |
| DELETE | `/api/dogs/:id` | Remove a dog you registered |

## Rules

- A dog that is already adopted cannot be adopted again.
- Users cannot adopt dogs they registered.
- Only the owner can remove a dog, and adopted dogs cannot be removed.

## Tests

The tests use Mocha and Chai, and run against a separate test database
(`DB_NAME` with `Test` added to the end).

```
npm test
```

## Project structure

- `controllers`: request handling and business rules
- `models`: Mongoose schemas for users and dogs
- `routes`: maps URLs to controllers
- `middlewares`: JWT authentication
- `tests`: endpoint tests
- `app.js`: configures the Express app
- `db.js`: connects to MongoDB