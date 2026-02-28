# Applications vs Requirements Architecture

## Overview

The YACN system now separates **applicant submission data** from **landlord-defined criteria** into two symmetrical but distinct systems:

### Applications (Applicant Submissions)
- **What it stores**: The actual data applicants submit when applying to a property
- **Table**: `applications`
- **Module**: `data/applications.js`
- **Examples**:
  - "I earn $5,000/month"
  - "I have 2 pets"
  - "I was evicted once"
  - "My credit score is 'good'"

### Requirements (Landlord Criteria)
- **What it stores**: The qualification criteria landlords set for their properties
- **Table**: `application_requirements`
- **Module**: `data/requirements.js`
- **Examples**:
  - "Must earn at least 3x the rent (income ratio 3.0)"
  - "Maximum of 1 pet allowed"
  - "No eviction history allowed"
  - "Minimum credit score: 'fair'"

## Symmetrical Field Structure

Both systems track the same **types** of information, but with different meanings:

| Field | Applications | Requirements |
|-------|--------------|--------------|
| `first_name` | Whether applicant provided | Whether first name is required |
| `last_name` | Whether applicant provided | Whether last name is required |
| `employment_status` | Applicant's actual status (e.g., 'employed', 'self-employed', 'student') | Allowed statuses (e.g., 'employed,self-employed') |
| `monthly_income` | Applicant's actual income ($) | Income ratio requirement (e.g., 3.0 = 3x rent) |
| `pets` | Number of pets applicant has (0-10) | Maximum pets allowed |
| `children` | Number of children (0+) | Maximum children allowed |
| `credit_score` | Applicant's credit level ('poor', 'fair', 'good', 'excellent') | Minimum required level |
| `evictions` | Boolean: applicant has eviction? | Boolean: are evictions allowed? |
| `criminal_record` | Boolean: applicant has record? | Boolean: are criminal records allowed? |

## Database Schema

### Applications Table
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    unit_id UUID REFERENCES unit(id),
    -- Personal info (what applicant submitted)
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    -- Financial info (what applicant submitted)
    employment_status VARCHAR(50),
    monthly_income DECIMAL(10,2),
    -- Housing preferences (what applicant submitted)
    pets INTEGER DEFAULT 0,
    children INTEGER DEFAULT 0,
    -- History (what applicant submitted)
    credit_score VARCHAR(50),
    evictions BOOLEAN DEFAULT false,
    criminal_record BOOLEAN DEFAULT false,
    -- Flexible data
    applicant_data JSONB,
    -- Status tracking
    current_status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Application Requirements Table
```sql
CREATE TABLE application_requirements (
    id UUID PRIMARY KEY,
    complex_id UUID REFERENCES complex(id),
    -- What fields are required
    first_name BOOLEAN DEFAULT true,
    last_name BOOLEAN DEFAULT true,
    email BOOLEAN DEFAULT true,
    -- Employment requirements
    employment_status VARCHAR(255),  -- Comma-separated list of allowed statuses
    min_monthly_income_ratio DECIMAL(4,2),  -- Multiply by rent to get minimum income
    -- Housing limits
    pets INTEGER DEFAULT 0,  -- Maximum pets allowed
    children_allowed INTEGER,  -- Maximum children allowed
    -- History requirements
    credit_score_min VARCHAR(50),  -- Minimum credit score ('fair', 'good', etc.)
    evictions BOOLEAN DEFAULT false,  -- Are evictions allowed?
    criminal_record BOOLEAN DEFAULT false,  -- Are criminal records allowed?
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Data Layer Functions

### applications.js (Applicant Submissions)

```javascript
// Get applicant's submitted data
await getApplicantSubmissionData(applicationId)
// Returns what the applicant actually submitted

// Get all applications for a unit
await getApplicationsByUnit(unitId)
// Returns all applicants who applied to a property

// Create an application
await createDetailedApplication({
    user_id,
    unit_id,
    first_name: "John",          // ACTUAL
    employment_status: "employed",  // ACTUAL
    monthly_income: 5000,           // ACTUAL
    pets: 2                         // ACTUAL
})

// Compare applicant to requirements
await compareApplicantToRequirements(applicationId, complexId)
// Shows which applicant matches which complex requirements
```

### requirements.js (Landlord Criteria)

```javascript
// Create requirements for a complex
await createApplicationRequirements({
    complex_id: complexUUID,
    first_name: true,              // REQUIRED?
    employment_status: "employed,self-employed",  // ALLOWED VALUES
    min_monthly_income_ratio: 3.0,  // RATIO
    pets: 1,                        // MAXIMUM
    credit_score_min: "fair"        // MINIMUM
})

// Get requirements for a complex
await getRequirementsForComplex(complexId)

// Check if specific applicant meets requirements
await checkApplicantMeetsRequirements(applicationId, complexId)
// Returns passing/failing with detailed failure reasons
```

## API Endpoints

### Application Endpoints

```
GET    /api/user-application              - Check if user has submitted app
POST   /api/submit-application            - Submit new application
GET    /api/application/:id/submission    - Get applicant's submitted data
POST   /api/application/:id/compare/:cid  - Compare applicant vs requirements
```

### Requirement Endpoints

```
GET    /api/requirements                  - Get all requirements
POST   /api/requirements                  - Create new requirements
GET    /api/requirements/:complexId       - Get requirements for complex
PUT    /api/requirements/:complexId       - Update complex requirements
DELETE /api/requirements/:complexId       - Delete complex requirements
POST   /api/requirements/:cid/check       - Check applicant vs requirements
```

## Matching Logic

### How Comparison Works

When comparing applicant to requirements:

1. **Get Applicant Data** from `applications` table
   - Extract: employment_status, monthly_income, pets, credit_score, etc.
   - These are ACTUAL VALUES from applicant submission

2. **Get Requirements** from `application_requirements` table
   - Extract: employment_status (allowed list), min_monthly_income_ratio, pets (max), etc.
   - These are CRITERIA from landlord

3. **Compare Each Field**
   ```
   INCOME:
   - Applicant earned: $5000/month
   - Requirement: 3.0x rent
   - Unit rent: $1600
   - Required income: $4800
   - Status: PASS ($5000 > $4800)

   PETS:
   - Applicant has: 2 pets
   - Requirement: max 1 pet
   - Status: FAIL (2 > 1)

   CREDIT:
   - Applicant has: 'good' (score 3)
   - Requirement minimum: 'fair' (score 2)
   - Status: PASS (3 >= 2)
   ```

4. **Return Results**
   - `passes`: true/false
   - `failedRules`: array of specific failures
   - `failureReasons`: details for each failure

## Common Use Cases

### Landlord Setting Requirements
```javascript
// Complex owner defines what they require
POST /api/requirements
{
    "complex_id": "uuid-of-complex",
    "first_name": true,
    "employment_status": "employed,self-employed,retired",
    "min_monthly_income_ratio": 3.0,
    "pets": 2,
    "children_allowed": 3,
    "credit_score_min": "fair",
    "evictions": false,
    "criminal_record": false
}
```

### Applicant Submitting Application
```javascript
// Applicant submits their actual data
POST /api/submit-application
{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "employment_status": "employed",
    "monthly_income": 6000,
    "pets": 1,
    "children": 0,
    "credit_score": "good",
    "evictions": false,
    "criminal_record": false
}
```

### Checking Eligibility
```javascript
// Check if Jane qualifies for the complex
POST /api/requirements/complex-uuid/check
{
    "applicationId": "janes-application-uuid"
}

// Returns:
{
    "passes": true,
    "failedRules": [],
    "applicantData": { ...Jane's actual data },
    "requirementsData": { ...Complex requirements }
}
```

### Filtering Applicants
```javascript
// Find all applicants for a property who pass requirements
// Using: compareApplicantToRequirements() for each application

GET /api/requirements/complex-uuid
GET /api/unit/unit-uuid/applications
// For each: POST /api/requirements/complex-uuid/check with applicationId
```

## Implementation Notes

1. **Field Types Differ**
   - `applications.monthly_income`: Number (actual income)
   - `application_requirements.min_monthly_income_ratio`: Decimal (ratio, e.g., 3.0)
   - This compares as: `applicant_income >= (rent * income_ratio)`

2. **Multi-Select Fields**
   - `applications.employment_status`: Single value (what applicant has)
   - `application_requirements.employment_status`: CSV of allowed values
   - Compare: `applicant_status IN allowed_statuses`

3. **Credit Score Mapping**
   - Values: 'very poor', 'poor', 'fair', 'good', 'excellent'
   - Internally maps to: 0, 1, 2, 3, 4
   - Compare numerically: `applicant_score >= requirement_score`

4. **Boolean Inversions**
   - For evictions/criminal_record:
   - `applications.evictions = true` means applicant HAS history
   - `application_requirements.criminal_record = false` means NOT allowed
   - Fail if: `applicant_has_history AND not_allowed`

5. **JSON Flexibility**
   - Both tables include `applicant_data` (applications) and future expandability
   - Allows storing additional fields without schema changes

## File Structure

```
data/
  applications.js          ← Applicant submission functions
  requirements.js          ← Landlord criteria functions

controllers/
  applicationController.js  ← API endpoints for applications
  requirementsController.js ← API endpoints for requirements

routes/
  api.js                   ← Application + requirement routes
```

## Next Steps

1. **Matching Algorithm**: Build advanced matching that finds best-fit properties
2. **Rules Engine**: Create custom rules for complex matching logic
3. **Notifications**: Alert applicants when they qualify for properties
4. **Reporting**: Dashboard for landlords showing applicant matches
5. **Fair Housing**: Ensure matching logic doesn't discriminate (title VIII compliance)
