# Landlord Account & Property Upload System

## Overview

Complete landlord account creation and property management system allowing apartment complexes to register, create account profiles, and upload their properties for renter discovery.

## Features

### Landlord Signup
- Personal information collection (name, email, phone)
- Company/organization details
- License number validation
- Real-time email/username availability checking
- Password validation and confirmation

### Property Management
- Create multiple properties/complexes
- Edit property information
- Delete properties
- View all properties in dashboard
- Property information stored with landlord profile

### Dashboard
- Organized menu-based interface
- Profile management
- Property list view
- Add new property form
- Qualification requirements management
- Applicant applications view

## User Journey

### 1. Landlord Registration

**URL:** `landlord-signup.html`

**Steps:**
1. Navigate to landlord signup page
2. Fill in personal information
   - First Name, Last Name
   - Email (unique)
   - Phone Number (auto-formatted)
3. Enter company information
   - Company/Organization Name (required)
   - License Number (optional)
4. Create account credentials
   - Username (unique, 4-20 characters)
   - Password (minimum 8 characters)
   - Confirm Password
5. Submit to create account

**Real-Time Validation:**
- Email: Checks availability as user types (500ms debounce)
- Username: Checks availability as user types (500ms debounce)
- Red border + error message if taken
- Green border + checkmark if available

**On Success:**
- Account created with 'landlord' role
- Leaser profile automatically created
- Session token generated
- Redirects to landlord dashboard

### 2. Dashboard Navigation

**URL:** `landlord-dashboard.html`

**Sections accessible from sidebar:**
1. **Profile** (📋) - View account information
2. **My Properties** (🏢) - List of all properties
3. **Add Property** (➕) - Form to create new property
4. **Requirements** (⚙️) - Set qualification criteria
5. **Applications** (📝) - View applicant applications

### 3. Property Management

**Create a Property:**
- Click "Add Property" in sidebar or from My Properties
- Enter property details:
  - Property Name
  - Street Address
  - City
  - State
  - Area Code (optional)
- Submit form
- Property appears in My Properties list

**Edit a Property:**
- Click "Edit" button on property card
- Modify information
- Save changes (coming soon)

**Delete a Property:**
- Click "Delete" button on property card
- Confirm deletion
- Property removed from dashboard

## API Endpoints

### Landlord Signup
```
POST /api/landlord/signup
```

**Request Body:**
```json
{
    "firstName": "John",
    "lastName": "Smith",
    "username": "john_smith",
    "email": "john@example.com",
    "phone": "5551234567",
    "password": "securepassword",
    "confirmPassword": "securepassword",
    "companyName": "Standard Properties LLC",
    "licenseNumber": "LIC12345"
}
```

**Response (Success - 201):**
```json
{
    "success": true,
    "message": "Landlord account created successfully",
    "token": "abc123def456...",
    "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Smith",
        "username": "john_smith",
        "email": "john@example.com",
        "phone": "5551234567",
        "role": "landlord",
        "leaser_id": "leaser-uuid",
        "company": "Standard Properties LLC"
    }
}
```

**Response (Duplicate Email - 409):**
```json
{
    "success": false,
    "error": "Email already registered: john@example.com",
    "errorType": "EMAIL_EXISTS",
    "field": "email"
}
```

**Response (Duplicate Username - 409):**
```json
{
    "success": false,
    "error": "Username already taken: john_smith",
    "errorType": "USERNAME_EXISTS",
    "field": "username"
}
```

### Get Landlord Profile
```
GET /api/landlord/profile
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Smith",
        "username": "john_smith",
        "email": "john@example.com",
        "phone": "5551234567",
        "role": "landlord"
    },
    "leaser": {
        "id": "leaser-uuid",
        "first_name": "John",
        "last_name": "Smith",
        "company": "Standard Properties LLC",
        "email": "john@example.com",
        "phone": "5551234567",
        "license_number": "LIC12345",
        "user_id": "user-uuid"
    },
    "complexes": [
        {
            "id": "complex-uuid",
            "leaser_id": "leaser-uuid",
            "property_name": "Downtown Apartments",
            "street": "123 Main St",
            "city": "San Francisco",
            "us_state": "CA",
            "area_code": "415"
        }
    ]
}
```

### Create Property/Complex
```
POST /api/landlord/complex
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "propertyName": "Downtown Apartments",
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "areaCode": "415"
}
```

**Response (Success - 201):**
```json
{
    "success": true,
    "message": "Complex created successfully",
    "complex": {
        "id": "complex-uuid",
        "leaser_id": "leaser-uuid",
        "property_name": "Downtown Apartments",
        "street": "123 Main St",
        "city": "San Francisco",
        "us_state": "CA",
        "area_code": "415",
        "created_at": "2026-02-28T10:00:00Z"
    }
}
```

### Update Property
```
PUT /api/landlord/complex/:complexId
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "propertyName": "Updated Name",
    "street": "456 Oak Ave",
    "city": "San Jose",
    "state": "CA",
    "areaCode": "408"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Complex updated successfully",
    "complex": { ...updated complex data }
}
```

### Delete Property
```
DELETE /api/landlord/complex/:complexId
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "message": "Complex deleted successfully"
}
```

### Check Email Availability
```
GET /api/check-email?email=user@example.com
```

**Response (Available):**
```json
{
    "available": true,
    "email": "user@example.com",
    "message": "Email is available"
}
```

**Response (In Use):**
```json
{
    "available": false,
    "email": "user@example.com",
    "message": "Email already in use"
}
```

### Check Username Availability
```
GET /api/check-username?username=john_smith
```

**Response (Available):**
```json
{
    "available": true,
    "username": "john_smith",
    "message": "Username is available"
}
```

**Response (Taken):**
```json
{
    "available": false,
    "username": "john_smith",
    "message": "Username already taken"
}
```

## Database Schema Updates

### Users Table (Role Support)
```sql
-- Updated with role field
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'renter';

-- Landlord users have role = 'landlord'
-- Renter users have role = 'renter'
```

### Leaser Table (Enhanced)
```sql
-- Updated to support user linkage
ALTER TABLE leaser ADD COLUMN license_number VARCHAR(255);
ALTER TABLE leaser ADD COLUMN user_id UUID REFERENCES users(id);

-- Creates direct link between user and leaser profile
```

### Complex Table
```sql
-- Added property_name field
ALTER TABLE complex ADD COLUMN property_name VARCHAR(255);

-- Stores property name/identifier for easier management
```

## Data Layer Functions

### users.js
```javascript
// Now accepts optional role parameter
createUser(firstName, lastName, username, email, phone, password, role = 'renter')

// Default role is 'renter'
// Pass 'landlord' for landlord accounts
```

### leasers.js
```javascript
// Enhanced to support license_number and user_id
createLeaser({
    first_name,
    last_name,
    company,
    phone,
    email,
    license_number,
    user_id
})

// New function to get leaser by user_id
getLeaserByUserId(userId)
```

### complexes.js
```javascript
// New function to get all complexes for a landlord
getComplexesByLeaserId(leaserId)
```

## Frontend Implementation

### landlord-signup.html
- Multi-section form for landlord registration
- Real-time email/username validation
- Phone number auto-formatting
- Organized form with sections

### landlord-dashboard.html
- Responsive dashboard layout
- Sidebar navigation
- Multiple sections:
  - Profile view
  - Properties list/grid
  - Add property form
  - Requirements management
  - Applications tracking

### landlord.js
- Authentication helpers
- Phone formatting
- Real-time validation
- Dashboard section management
- Property CRUD operations
- Form submission handling

## Security Features

✓ **Role-based access control**
- Only 'landlord' role can access landlord endpoints
- 401 error if not authenticated
- 403 error if not landlord role

✓ **Ownership verification**
- Landlords can only edit/delete their own properties
- Checks leaser_id on all modifications
- Prevents cross-landlord access

✓ **Email/Username uniqueness**
- Database constraints prevent duplicates
- API validation with specific error types
- Frontend real-time checking

✓ **Password security**
- Minimum 8-character requirement
- Frontend confirmation validation
- Backend password hashing

✓ **Session management**
- Token-based authentication
- Session validation on protected routes
- Automatic logout on token expiration

## File Structure

```
Controllers:
  landlordController.js      ← Landlord endpoints

Data Layer:
  users.js                   ↑ Enhanced with role support
  leasers.js                 ↑ Enhanced with user_id linking
  complexes.js               ↑ Enhanced with leaser queries

Routes:
  api.js                     ↑ Added landlord routes

Frontend:
  landlord-signup.html       ← Signup page
  landlord-dashboard.html    ← Dashboard page
  landlord.js                ← Signup & dashboard logic
```

## Testing Checklist

- [ ] Landlord can sign up with valid data
- [ ] Email validation prevents duplicates
- [ ] Username validation prevents duplicates
- [ ] Real-time email check shows availability
- [ ] Real-time username check shows availability
- [ ] Password confirmation validation works
- [ ] Phone number auto-formats correctly
- [ ] Login redirects to dashboard
- [ ] Profile loads correctly on dashboard
- [ ] Can create new property
- [ ] Property appears in My Properties
- [ ] Can edit property details
- [ ] Can delete property with confirmation
- [ ] Cannot access landlord features as renter
- [ ] Session expires properly
- [ ] Logout clears session and redirects

## Next Steps

1. **Units Management** - Add ability to create units within properties
2. **Requirements Editor** - UI to set qualification criteria per property
3. **Application Viewing** - View and manage applicant applications
4. **Bulk Upload** - CSV import for multiple properties
5. **Analytics Dashboard** - View application statistics
6. **Communication** - Message applicants directly
7. **Document Upload** - Upload property images/documents
8. **Pricing Tiers** - Premium features for landlords

## Usage Examples

### Create Landlord Account via API

```bash
curl -X POST http://localhost:5000/api/landlord/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "janedoe",
    "email": "jane@properties.com",
    "phone": "5559876543",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "companyName": "Premium Properties",
    "licenseNumber": "CA-LIC98765"
  }'
```

### Add Property

```bash
curl -X POST http://localhost:5000/api/landlord/complex \
  -H "Authorization: Bearer token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyName": "Sunset Heights",
    "street": "456 Sunset Blvd",
    "city": "Los Angeles",
    "state": "CA",
    "areaCode": "310"
  }'
```

### View Dashboard Profile

```bash
curl -X GET http://localhost:5000/api/landlord/profile \
  -H "Authorization: Bearer token_here"
```

## Error Handling

| Scenario | Status | Error Message |
|----------|--------|---------------|
| Email already registered | 409 | "Email already registered: ..." |
| Username already taken | 409 | "Username already taken: ..." |
| Invalid email format | 400 | "Invalid email address" |
| Password mismatch | 400 | "Passwords do not match" |
| Missing required fields | 400 | "All fields are required" |
| Not authenticated | 401 | "Authentication required" |
| Not landlord role | 403 | "Only landlords can create complexes" |
| Property not found | 404 | "Complex not found" |
| Not property owner | 403 | "You do not have permission to edit this complex" |

## Future Enhancements

- [ ] Property image gallery
- [ ] Bulk property import
- [ ] Application scoring algorithm
- [ ] Automated communication templates
- [ ] Report generation
- [ ] Multi-user landlord accounts
- [ ] Payment processing
- [ ] API webhooks for integrations
