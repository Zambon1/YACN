# 🎯 LOGIN/SIGNUP SYSTEM - READY TO USE!

The login and signup pages are now fully working with the PostgreSQL backend! 🚀

## Quick Start (3 Steps)

### 1. Run Complete Setup

```powershell
.\complete-setup.ps1
```

This will:
- ✅ Check PostgreSQL is running
- ✅ Create `rentmatch` database and user
- ✅ Run all schema migrations
- ✅ Verify everything is set up correctly

### 2. Start the Server

```powershell
npm start
```

Look for these messages:
```
✅ Connected to PostgreSQL database
🏠 RentMatch server running at http://localhost:5000
```

### 3. Test Login/Signup

Open your browser to: **http://localhost:5000/login.html**

## What's Fixed

### ✅ Frontend Fixed
- **Login form** now properly wrapped in DOMContentLoaded
- **Signup form** handler in correct scope
- **Error messages** show meaningful backend errors
- **Console logging** for debugging
- **Network error handling** with user-friendly messages

### ✅ Backend Enhanced
- **PostgreSQL integration** with UUID primary keys
- **Password field** supports both `password` and `password_hash`
- **Session tokens** using crypto.randomBytes (128-char hex)
- **Settings & Preferences** auto-created for new users
- **Comprehensive schema** with 11 tables including:
  - users (UUID-based)
  - sessions
  - applications
  - settings
  - preferences
  - complexes, units, guarantors, etc.

### ✅ Database Schema
- **UUID extension** enabled (pgcrypto)
- **Foreign keys** properly set up
- **Indexes** for performance
- **Event logging** for compliance
- **Check constraints** for data validation

## Features That Work Now

### Signup Page ✅
- First Name, Last Name
- Email (unique validation)
- Phone (10-digit validation)
- Username (unique validation, 4-20 chars)
- Password (min 8 chars)
- Confirm Password (client-side matching)
- **Backend creates**:
  - User with UUID
  - Default settings record
  - Default preferences record
  - Session token

### Login Page ✅
- Email **OR** Username (flexible login)
- Password validation
- Session token generation
- Proper error messages

### After Login ✅
- User data stored in `localStorage.rentmatch_user`
- Session token stored in `localStorage.session_token`
- Automatic redirect to application form
- User dropdown menu with username
- Application status checking
- Settings page access
- Logout functionality

## Testing the System

### Create a Test Account

1. Go to http://localhost:5000/login.html
2. Click "Create Account"
3. Fill in the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@example.com
   Phone: 5551234567
   Username: johndoe
   Password: password123
   Confirm Password: password123
   ```
4. Click "Create Account"
5. You should be redirected to the application page
6. Check the browser console - you'll see success messages

### Login with Test Account

1. Go to http://localhost:5000/login.html
2. Enter: `johndoe` or `john.doe@example.com`
3. Enter password: `password123`
4. Click "Log In"
5. Should redirect to application page

### Verify in Database

```bash
psql -U rentmatch -d rentmatch

SELECT * FROM users;
SELECT * FROM sessions;
SELECT * FROM settings;
SELECT * FROM preferences;

\q
```

## Error Handling

The system now shows proper error messages:

### Frontend Errors
- ❌ "Passwords do not match" - Client-side validation
- ❌ "Unable to connect to server" - Network/server is down

### Backend Errors
- ❌ "Email already registered" - Duplicate email
- ❌ "Username already taken" - Duplicate username
- ❌ "Invalid email address" - Email format validation
- ❌ "Invalid phone number" - Phone format validation
- ❌ "Invalid email/username or password" - Login failed

## Troubleshooting

### "Unable to connect to server"

**Problem**: Server not running or database not connected

**Fix**:
```powershell
# 1. Check PostgreSQL is running
Get-Service postgresql*

# 2. Start if needed
Start-Service postgresql-x64-16

# 3. Test database connection
.\test-db.ps1

# 4. Start server
npm start
```

### "Email already registered"

**Problem**: User already exists

**Fix**: Either login with that email, or use a different email

**Reset database** (if testing):
```powershell
.\complete-setup.ps1
# Answer 'y' when asked to recreate
```

### Console shows network errors

**Problem**: Backend not responding

**Fix**:
1. Make sure `npm start` is running
2. Check you see "✅ Connected to PostgreSQL database"
3. If not, run `.\complete-setup.ps1` again
4. Check `.env` file has correct credentials

### Password field shows as invalid

**Problem**: Password too short or mismatch

**Fix**: 
- Password must be at least 8 characters
- Confirm Password must match exactly (case-sensitive)

## API Testing with curl

### Test Signup
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"email\":\"jane@example.com\",\"phone\":\"5559876543\",\"username\":\"janesmith\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"emailOrUsername\":\"janesmith\",\"password\":\"password123\"}"
```

## Development Console Commands

### Check Current User
```javascript
console.log('User:', JSON.parse(localStorage.getItem('rentmatch_user')));
console.log('Token:', localStorage.getItem('session_token'));
```

### Clear Session (Logout)
```javascript
localStorage.clear();
location.reload();
```

### Test API Call
```javascript
fetch('http://localhost:5000/api/user', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('session_token')
  }
}).then(r => r.json()).then(console.log);
```

## What's Next

After successful login, you can:

1. **Fill Application** - http://localhost:5000/application.html
   - Uses authenticated user data
   - Saves to database with user_id

2. **View Results** - http://localhost:5000/results.html
   - Shows matched apartments
   - Displays rejection reasons

3. **Settings** - http://localhost:5000/settings.html
   - Update notification preferences
   - Manage account settings

4. **Search Units** (NEW!)
   - `/api/units/search?bedrooms=2&min_price=1000&max_price=2000`
   - Database-driven unit listings

## Files Changed

### Frontend
- ✅ `script.js` - Fixed login/signup handlers, proper DOMContentLoaded wrapping
- ✅ `login.html` - Already had all fields needed

### Backend
- ✅ `data/users.js` - UUID support, auto-create settings/preferences
- ✅ `data/sessions.js` - UUID foreign keys
- ✅ `controllers/authController.js` - Password field compatibility
- ✅ `database/base/000_base_schema.sql` - Comprehensive schema with UUID

### New Files
- ✅ `complete-setup.ps1` - One-command setup script
- ✅ `test-db.ps1` - Database verification script
- ✅ `QUICKSTART.md` - Detailed user guide
- ✅ `SCHEMA_DOCUMENTATION.md` - Full schema reference

## Success Criteria ✅

- [x] User can create account
- [x] User receives meaningful error messages
- [x] User can login with email or username
- [x] Session persists across page loads
- [x] User can logout
- [x] Database stores user data correctly
- [x] Settings and preferences auto-created
- [x] UUID primary keys working
- [x] Foreign keys enforced
- [x] No console errors on success path

## 🎉 Everything is Ready!

Just run `.\complete-setup.ps1` and then `npm start` - your login/signup system is production-ready!
