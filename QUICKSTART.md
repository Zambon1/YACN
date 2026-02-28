# Quick Start Guide - Login/Signup System

## Prerequisites

1. **PostgreSQL Installed** ✅ (You mentioned you have it!)
2. **Node.js and npm** installed
3. **Dependencies installed**: Run `npm install` if not already done

## Step 1: Set Up PostgreSQL Database

### Option A: Automated Setup (Recommended)

Run the PowerShell setup script:

```powershell
.\setup-db.ps1
```

This will:
- Check if PostgreSQL is running
- Create the `rentmatch` database
- Create the `rentmatch` user
- Run all schema migrations
- Set up tables: users, sessions, applications, settings, preferences, etc.

### Option B: Manual Setup

If the script doesn't work, follow [DATABASE_SETUP.md](DATABASE_SETUP.md) for manual instructions.

### Verify Database Setup

After running the setup, verify the tables were created:

```bash
psql -U rentmatch -d rentmatch -c "\dt"
```

You should see:
- users
- sessions  
- applications
- settings
- preferences
- leaser
- complex
- unit
- guarantor
- application_events
- application_rule_logs

## Step 2: Start the Server

```bash
npm start
```

You should see:
```
✅ Connected to PostgreSQL database
🏠 RentMatch server running at http://localhost:5000
```

## Step 3: Test Login/Signup

1. **Open your browser** to http://localhost:5000/login.html

2. **Create an account**:
   - Click "Create Account"
   - Fill in all required fields:
     - First Name
     - Last Name
     - Email
     - Phone (10 digits, no dashes)
     - Username (4-20 characters)
     - Password (min 8 characters)
     - Confirm Password
   - Click "Create Account"

3. **Login**:
   - Enter your email or username
   - Enter your password
   - Click "Log In"

4. **Success!** You should be redirected to the application page

## Troubleshooting

### Error: "Unable to connect to server"

**Problem**: Server is not running or database is not connected

**Solution**:
1. Make sure you ran `npm start`
2. Check the console for `✅ Connected to PostgreSQL database`
3. If you see database connection errors, verify PostgreSQL is running:
   ```powershell
   Get-Service postgresql*
   ```
4. If PostgreSQL is stopped, start it:
   ```powershell
   Start-Service postgresql-x64-16  # Replace with your version
   ```

### Error: "Email already registered" or "Username already taken"

**Problem**: User already exists in database

**Solution**: Either:
- Login with existing credentials
- Use a different email/username
- Or reset the database:
  ```bash
  psql -U postgres
  DROP DATABASE rentmatch;
  CREATE DATABASE rentmatch;
  \q
  ```
  Then run `.\setup-db.ps1` again

### Error: "Password do not match"

**Problem**: Frontend validation issue

**Solution**: Make sure both password fields match exactly (case-sensitive)

### Browser Console Shows Errors

**Problem**: Missing dependencies or CORS issues

**Solution**:
1. Open browser DevTools (F12)
2. Check the Console tab for specific errors
3. Common fixes:
   - Clear browser cache and localStorage
   - Restart the server
   - Check network tab to see if API calls are failing

## What Happens Behind the Scenes

### Signup Flow

1. **Frontend** (`script.js`):
   - Validates form inputs
   - Sends POST request to `/api/signup`
   - Includes: firstName, lastName, email, phone, username, password

2. **Backend** (`authController.js`):
   - Validates all fields
   - Checks email/username don't already exist
   - Creates default settings and preferences records
   - Creates user with UUID primary key
   - Generates session token (128-char hex)
   - Returns user data (without password) and token

3. **Frontend Response**:
   - Stores user and token in localStorage
   - Redirects to application page

### Login Flow

1. **Frontend**:
   - Validates form inputs
   - Sends POST request to `/api/login`
   - Includes: emailOrUsername, password

2. **Backend**:
   - Looks up user by email or username
   - Verifies password (supports both `password` and `password_hash` fields)
   - Creates new session token
   - Returns user data and token

3. **Frontend Response**:
   - Stores user and token in localStorage
   - Redirects to application page

### Session Management

- **Token**: 128-character hex string stored in `sessions` table
- **Expiration**: Sessions persist until logout
- **Storage**: Token stored in localStorage as `session_token`
- **API Requests**: Include token in `Authorization: Bearer <token>` header

## Database Schema

### Users Table (UUID-based)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
first_name VARCHAR(255)
last_name VARCHAR(255)
username VARCHAR(255) UNIQUE
email TEXT UNIQUE
phone VARCHAR(20)
password_hash TEXT
settings_id INT
preferences_id INT
role VARCHAR(255) DEFAULT 'renter'
```

### Sessions Table
```sql
id SERIAL PRIMARY KEY
user_id UUID REFERENCES users(id)
token VARCHAR(255) UNIQUE
created_at TIMESTAMP DEFAULT NOW()
```

## Next Steps

After successful login:
1. Fill out the application form at `/application.html`
2. View your results at `/results.html`
3. Update settings at `/settings.html`

## API Endpoints Reference

### Authentication
- `POST /api/signup` - Create new account
- `POST /api/login` - Login to existing account
- `GET /api/user` - Get current user (requires token)
- `POST /api/logout` - Logout (destroys session)

### Settings
- `GET /api/settings` - Get user settings (requires token)
- `PUT /api/settings` - Update settings (requires token)

### Applications
- `GET /api/user-application` - Check application status
- `POST /api/submit-application` - Submit rental application

## Development Tips

### Clear User Data
To test signup/login flow from scratch:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### View Current User
```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('rentmatch_user')));
console.log(localStorage.getItem('session_token'));
```

### Test Database Connection
```bash
psql -U rentmatch -d rentmatch
SELECT * FROM users;
SELECT * FROM sessions;
\q
```
