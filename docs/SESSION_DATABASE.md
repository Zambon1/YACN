# Session Database & Authentication System

## Overview
This authentication system uses a backend session database to manage user login information and maintain secure user sessions.

## Architecture

### Backend Components

#### 1. **User Database** (`data/users.js`)
- Stores all registered user accounts
- Contains: id, email, username, password, createdAt
- Functions available:
  - `findUserByEmail(email)` - Search user by email
  - `findUserByUsername(username)` - Search user by username
  - `findUserById(id)` - Search user by ID
  - `createUser(email, username, password)` - Register new user
  - `getUserPublic(user)` - Return user data without password

#### 2. **Session Database** (`data/sessions.js`)
- Stores active user sessions/login tokens
- Each session contains: userId, email, username, createdAt
- Functions available:
  - `createSession(userId, email, username)` - Create new session token
  - `getSession(token)` - Retrieve session by token
  - `destroySession(token)` - End a session
  - `isValidSession(token)` - Check if session is valid
  - `getAllSessions()` - List all active sessions (for debugging)

#### 3. **Auth Controller** (`controllers/authController.js`)
Handles authentication logic:
- `signup()` - Register new account
- `login()` - Authenticate user and create session
- `getCurrentUser()` - Validate and return current session user
- `logout()` - End user session

### API Endpoints

```
POST   /api/signup              - Create new account
POST   /api/login               - Login and get session token
GET    /api/user                - Get current user (requires session token)
POST   /api/logout              - End current session
```

## How It Works

### Signup Flow
1. User submits signup form with email, username, password
2. Backend validates input (unique email/username, password requirements)
3. User is added to `users` database
4. New session is created and session token is returned
5. Frontend stores token in `localStorage` with key `session_token`
6. User is redirected to application page

### Login Flow
1. User submits login form with email and password
2. Backend finds user by email and verifies password
3. If valid, new session is created and token is returned
4. Frontend stores token in `localStorage`
5. User is redirected to application page

### Session Validation
- Token is stored in `session_token` localStorage key
- Token is sent in request headers: `Authorization: Bearer <token>`
- Backend validates token exists in sessions database
- Invalid/expired tokens return 401 Unauthorized

### Logout Flow
1. User clicks logout
2. Frontend sends logout request with session token
3. Backend destroys the session (removes from sessions database)
4. Frontend clears localStorage and redirects to home

## Frontend Integration

**Auth Helpers** (in `script.js`):
- `isLoggedIn()` - Check if user has valid session token
- `getCurrentUser()` - Get logged-in user data from localStorage
- `setCurrentUser(user, token)` - Store user and token after login
- `logout()` - Clear session and destroy server-side session

**Storage**:
- `rentmatch_user` - User object (email, username, id)
- `session_token` - Active session token for API requests

## Security Notes

### Current Implementation (Demo)
- Tokens are simple random strings (not cryptographically signed)
- Passwords stored in plain text (NOT RECOMMENDED FOR PRODUCTION)
- Sessions stored in server memory (lost when server restarts)

### Production Improvements Needed
1. **Password Hashing** - Use bcrypt or similar to hash passwords
2. **JWT Tokens** - Use signed JWT tokens instead of random strings
3. **Persistent Database** - Replace in-memory storage with MongoDB/PostgreSQL
4. **HTTPS Only** - Require HTTPS for all auth endpoints
5. **Session Expiration** - Add timeout for inactive sessions
6. **Secure Cookies** - Store tokens in HttpOnly, Secure cookies instead of localStorage
7. **Rate Limiting** - Add rate limiting on login/signup endpoints
8. **CSRF Protection** - Add CSRF tokens for state-changing requests

## Testing

### Create Account
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123","confirmPassword":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Current User
```bash
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer <session_token>"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/logout \
  -H "Authorization: Bearer <session_token>"
```

## Files Modified/Created

### New Files
- `data/users.js` - User database
- `data/sessions.js` - Session database
- `controllers/authController.js` - Auth logic

### Modified Files
- `routes/api.js` - Added auth endpoints
- `script.js` - Updated to use backend auth instead of localStorage-only
