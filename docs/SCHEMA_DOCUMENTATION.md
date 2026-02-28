# RentMatch - Enhanced Database Schema and API

## Overview

The RentMatch system now includes a comprehensive PostgreSQL database schema that supports:
- User authentication with role-based access (renter, owner, manager)
- User settings and preferences
- Property complexes and units
- Detailed rental applications with structured fields
- Guarantor support
- Application tracking and compliance logging

## Database Schema

### Core Tables

#### Users
- **Primary Key**: UUID (auto-generated)
- **Fields**: first_name, last_name, username, email, phone, password_hash, role
- **Relations**: settings (1:1), preferences (1:1)
- **Roles**: 'renter', 'owner', 'manager'

#### Settings
- User notification preferences
- **Fields**: text_messages, email_list, dark_mode

#### Preferences
- User search/filter preferences
- **Fields**: price_min, price_max, pet_preference, bedroom_preference, bathroom_preference, term_preference

#### Sessions
- Token-based authentication
- **Fields**: user_id (UUID), token, created_at

### Property Management

#### Leaser (Landlords)
- **Primary Key**: UUID
- **Fields**: first_name, last_name, company, phone, email

#### Complex (Properties)
- **Primary Key**: SERIAL
- **Fields**: leaser_id, us_state, city, street, area_code
- **Relations**: leaser (many:1), units (1:many)

#### Unit (Individual Rentals)
- **Primary Key**: SERIAL
- **Fields**: complex_id, price, term, bedroom, bathroom, available
- **Constraints**: bedroom (1-10), bathroom (1-6), term (1,3,6,9,12 months)

#### Application Requirements
- Per-complex application rules
- **Fields**: complex_id, employment_status, min_monthly_income_ratio, pets, credit_score_min, evictions, criminal_record, etc.

### Applications

#### Applications Table
Enhanced with both structured fields AND flexible JSON storage:

**Structured Fields**:
- Personal: first_name, last_name, gender, email, phone, birthday
- Employment: employment_status, monthly_income, valid_pay_stubs, employment_hist
- Background: driver_license, credit_score, evictions, criminal_record
- Family: pets, children
- Relations: user_id, unit_id, guarantor_id

**Flexible Fields**:
- applicant_data (JSONB) - Full form data
- top_rejection_reasons (JSONB) - Match analysis
- current_status - 'submitted', 'auto_rejected', 'auto_approved', 'manual_override', 'withdrawn'

#### Guarantor
- **Primary Key**: UUID
- **Fields**: user_id, monthly_income, criminal_check, credit_score

#### Application Events
- Compliance logging
- **Fields**: application_id, event_type, triggered_by, reason, created_at

#### Application Rule Logs
- Track which qualification rules passed/failed
- **Fields**: application_id, rule_name, renter_value, rule_threshold, result

## API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - Login and get session token
- `GET /api/user` - Get current user info (requires token)
- `POST /api/logout` - Logout and destroy session

### Settings & Preferences
- `GET /api/settings` - Get user settings (requires token)
- `PUT /api/settings` - Update settings (requires token)
- `GET /api/preferences` - Get user preferences (requires token)
- `PUT /api/preferences` - Update preferences (requires token)

### Units (Database-driven)
- `GET /api/units/search?min_price=1000&max_price=2000&bedrooms=2&available=true` - Search units
- `GET /api/units/:id` - Get unit details with complex info

### Applications
- `GET /api/user-application` - Check if user has submitted application
- `POST /api/submit-application` - Submit new application
- Enhanced functions available in `data/applications.js`:
  - `createDetailedApplication()` - With structured fields
  - `updateApplicationStatus()` - Update status with event logging
  - `getApplicationWithDetails()` - Full JOIN query
  - `getApplicationsByStatus()` - Filter by status
  - `logApplicationRule()` - Track rule evaluation

### Apartments (Static data)
- `GET /api/apartments` - Get all apartments
- `GET /api/apartments/:id` - Get apartment by ID

## Data Layer Functions

### Users (`data/users.js`)
- `createUser()` - Auto-creates settings & preferences
- `findUserByEmail()`, `findUserByUsername()`, `findUserById()`
- `getUserPublic()` - Remove sensitive fields
- `getUserSettings()`, `updateUserSettings()`
- `getUserPreferences()`, `updateUserPreferences()`

### Units (`data/units.js`)
- `getAllUnits(filters)` - Search with filters
- `getUnitById(id)`
- `createUnit()`, `updateUnit()`, `deleteUnit()`

### Complexes (`data/complexes.js`)
- `getAllComplexes()` - With leaser info
- `getComplexById(id)`, `getComplexWithUnits(id)`
- `createComplex()`, `updateComplex()`, `deleteComplex()`

### Guarantors (`data/guarantors.js`)
- `createGuarantor()`, `getGuarantorById()`, `getGuarantorByUserId()`
- `updateGuarantor()`, `deleteGuarantor()`

### Leasers (`data/leasers.js`)
- `createLeaser()`, `getAllLeasers()`, `getLeaserById()`
- `getLeaserWithComplexes(id)`
- `updateLeaser()`, `deleteLeaser()`

## Migration Notes

### Backward Compatibility

The enhanced schema maintains backward compatibility:

1. **Password Field**: Supports both `password` and `password_hash`
2. **Applications**: Both old JSON-only and new structured fields work
3. **User ID**: Sessions now use UUID but existing integer IDs still work for lookups

### Key Changes

1. **Users table**:
   - `id` changed from SERIAL to UUID
   - `password` renamed to `password_hash`
   - Added `role`, `settings_id`, `preferences_id`

2. **Applications table**:
   - Added 20+ structured fields
   - Kept `applicant_data` JSONB for flexibility
   - Added `current_status` and tracking

3. **New tables**: settings, preferences, leaser, complex, unit, guarantor, application_events, application_rule_logs

## Usage Examples

### Create User with Settings
```javascript
const user = await createUser('John', 'Doe', 'johndoe', 'john@example.com', '5551234567', 'hashedPassword');
// Automatically creates default settings and preferences
```

### Search Available Units
```javascript
const units = await getAllUnits({
    available: true,
    min_price: 1000,
    max_price: 2000,
    bedrooms: 2
});
```

### Submit Detailed Application
```javascript
const app = await createDetailedApplication({
    user_id: 'uuid-here',
    unit_id: 123,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    monthly_income: 5000,
    credit_score: 'good',
    pets: 1,
    // ... other fields
});
```

### Update Application Status
```javascript
await updateApplicationStatus(appId, 'auto_approved', 'Meets all requirements');
// Automatically logs to application_events table
```

## Database Setup

Run the setup script:
```powershell
.\setup-db.ps1
```

Or see [DATABASE_SETUP.md](DATABASE_SETUP.md) for manual instructions.

## Testing

After setup, test the enhanced features:

1. **Create account** - Verify settings/preferences are auto-created
2. **Update settings** - Use `PUT /api/settings`
3. **Search units** - Use `GET /api/units/search`
4. **Submit application** - Backend now supports detailed fields

## Future Enhancements

The schema is ready for:
- Multi-tenant landlord organizations
- Income verification with guarantors
- Fair housing compliance logging
- Advanced matching algorithms using structured data
- Real-time unit availability updates
