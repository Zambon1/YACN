# Quick Reference: Applications vs Requirements

## When to Use Each

### Use `applications.js` Functions When...
- Getting what an applicant submitted
- Storing a new application
- Finding all applicants for a property
- Building applicant profiles

### Use `requirements.js` Functions When...
- Setting landlord criteria
- Updating rental requirements
- Checking if someone qualifies
- Building requirement sets

## Common Tasks

### Task: Store New Application
```javascript
import { createDetailedApplication } from '../data/applications.js';

const appId = await createDetailedApplication({
    user_id: 'uuid-of-user',
    unit_id: 'uuid-of-unit',
    first_name: 'John',           // WHAT APPLICANT HAS
    employment_status: 'employed', // WHAT APPLICANT HAS
    monthly_income: 5000,         // WHAT APPLICANT HAS
    pets: 2,                      // WHAT APPLICANT HAS
    credit_score: 'good'          // WHAT APPLICANT HAS
});
```

### Task: Set Complex Requirements
```javascript
import { createApplicationRequirements } from '../data/requirements.js';

const reqId = await createApplicationRequirements({
    complex_id: 'uuid-of-complex',
    employment_status: 'employed,self-employed',  // ALLOWED VALUES
    min_monthly_income_ratio: 3.0,                 // RATIO (3x rent)
    pets: 1,                                       // MAXIMUM
    credit_score_min: 'fair'                       // MINIMUM
});
```

### Task: Check If Applicant Qualifies
```javascript
import { checkApplicantMeetsRequirements } from '../data/requirements.js';

const result = await checkApplicantMeetsRequirements(
    'uuid-of-application',
    'uuid-of-complex'
);

console.log(result.passes); // true or false
console.log(result.failedRules); // Array of failures
```

### Task: Get Applicant's Submitted Data
```javascript
import { getApplicantSubmissionData } from '../data/applications.js';

const data = await getApplicantSubmissionData('uuid-of-application');
console.log(data.employment_status); // 'employed'
console.log(data.monthly_income); // 5000
```

### Task: Compare Applicant to Requirements
```javascript
import { compareApplicantToRequirements } from '../data/applications.js';

const comparison = await compareApplicantToRequirements(
    'uuid-of-application',
    'uuid-of-complex'
);

console.log(comparison.passes); // true or false
console.log(comparison.applicantData); // What they submitted
console.log(comparison.requirementsData); // What complex requires
console.log(comparison.failedRules); // Specific failures
```

## Field Comparison Logic

### Income
```
Applicant: monthly_income = 5000 (ACTUAL)
Requirement: min_monthly_income_ratio = 3.0 (MULTIPLIER)
Unit Rent: 1600

Formula: applicant_income >= rent * ratio
Test: 5000 >= 1600 * 3.0
Test: 5000 >= 4800 → PASS ✓
```

### Employment Status
```
Applicant: employment_status = 'employed' (ACTUAL STATUS)
Requirement: employment_status = 'employed,self-employed' (ALLOWED LIST)

Formula: applicant_status IN allowed_statuses.split(',')
Test: 'employed' IN ['employed', 'self-employed'] → PASS ✓
```

### Pets
```
Applicant: pets = 2 (ACTUAL COUNT)
Requirement: pets = 1 (MAXIMUM)

Formula: applicant_pets <= requirement_pets
Test: 2 <= 1 → FAIL ✗
```

### Credit Score
```
Applicant: credit_score = 'good' (ACTUAL LEVEL)
Requirement: credit_score_min = 'fair' (MINIMUM REQUIRED)

Mapping: { 'very poor': 0, 'poor': 1, 'fair': 2, 'good': 3, 'excellent': 4 }

Formula: applicant_score >= requirement_score (numerically)
Test: 3 >= 2 → PASS ✓
```

### Evictions/Criminal Record (Boolean)
```
Applicant: evictions = false (HAS HISTORY? NO)
Requirement: evictions = false (ALLOWED? NO)

Formula: NOT (applicant_has AND requirement_disallows)
Test: NOT (false AND false) → PASS ✓

---

Applicant: criminal_record = true (HAS RECORD? YES)
Requirement: criminal_record = false (ALLOWED? NO)

Formula: NOT (applicant_has AND requirement_disallows)
Test: NOT (true AND true) → FAIL ✗
```

## Data Model Cheat Sheet

### Applications (What Applicant Submitted)
```javascript
{
    id: UUID,
    user_id: UUID,
    unit_id: UUID,
    first_name: String,
    last_name: String,
    email: String,
    phone: String,
    employment_status: String,      // e.g., 'employed'
    monthly_income: Number,         // e.g., 5000
    pets: Number,                   // e.g., 2
    children: Number,               // e.g., 1
    credit_score: String,          // e.g., 'good'
    evictions: Boolean,            // e.g., false
    criminal_record: Boolean,      // e.g., false
    applicant_data: Object,        // Extra JSON fields
    current_status: String,        // 'submitted', 'accepted', 'rejected'
    created_at: Date
}
```

### Requirements (What Complex Requires)
```javascript
{
    id: UUID,
    complex_id: UUID,
    first_name: Boolean,           // e.g., true (required?)
    last_name: Boolean,            // e.g., true
    email: Boolean,                // e.g., true
    employment_status: String,     // e.g., 'employed,self-employed'
    min_monthly_income_ratio: Number,  // e.g., 3.0
    pets: Number,                  // e.g., 1 (maximum)
    children_allowed: Number,      // e.g., 3 (maximum)
    credit_score_min: String,      // e.g., 'fair'
    evictions: Boolean,            // e.g., false (allowed?)
    criminal_record: Boolean,      // e.g., false (allowed?)
    guarantor_allowed: Boolean,    // e.g., true
    created_at: Date
}
```

## Testing Matching

### Test Case 1: Applicant Passes
```
Applicant:
- employed (employed required) ✓
- $6000 (3x $1600 = $4800 required) ✓
- 1 pet (max 1 allowed) ✓
- credit 'good' (min 'fair' = 2) ✓
- no evictions (not allowed) ✓
→ QUALIFIES
```

### Test Case 2: Applicant Fails Income
```
Applicant:
- employed ✓
- $3000 (3x $1600 = $4800 required) ✗
- 1 pet ✓
- credit 'good' ✓
- no evictions ✓
→ FAILS (income too low)
```

### Test Case 3: Applicant Fails Multiple
```
Applicant:
- self-employed (employed only) ✗
- $3000 (needs $4800) ✗
- 2 pets (max 1) ✗
- credit 'fair' (needs 'good') ✗
- has evictions (not allowed) ✗
→ FAILS (5 violations)
```

## API Cheat Sheet

```bash
# Create requirements
POST /api/requirements
{ "complex_id": "...", "employment_status": "...", ... }

# Get requirements
GET /api/requirements/:complexId

# Update requirements
PUT /api/requirements/:complexId
{ "pets": 2, "credit_score_min": "fair" }

# Check if applicant qualifies
POST /api/requirements/:complexId/check
{ "applicationId": "..." }
→ { "passes": true/false, "failedRules": [...] }

# Get applicant's submitted data
GET /api/application/:applicationId/submission

# Compare applicant to requirements
POST /api/application/:applicationId/compare/:complexId
```

## Debugging Tips

### Check What Applicant Submitted
```javascript
const submitted = await getApplicantSubmissionData(appId);
console.log(JSON.stringify(submitted, null, 2));
```

### Check What Complex Requires
```javascript
const required = await getRequirementsForComplex(complexId);
console.log(JSON.stringify(required, null, 2));
```

### See Detailed Comparison
```javascript
const result = await compareApplicantToRequirements(appId, complexId);
console.log('Passes:', result.passes);
console.log('Failed Rules:', result.failedRules);
result.failedRules.forEach(fail => {
    console.log(`  ${fail.rule}: required ${fail.required}, got ${fail.provided}`);
});
```

## Common Mistakes

❌ **Don't confuse field meanings:**
```javascript
// WRONG: employment_status is applicant's actual status, not allowed list
requirement.employment_status = 'employed'; // No! This is a single value

// RIGHT: employment_status in requirements is comma-separated allowed list
requirement.employment_status = 'employed,self-employed'; // Yes
```

❌ **Don't mix monthly_income between tables:**
```javascript
// WRONG: Requirement income is a ratio multiplier, not actual dollars
requirement.min_monthly_income_ratio = 5000; // No! This should be 3.0

// RIGHT:
requirement.min_monthly_income_ratio = 3.0; // Yes, multiply by rent
application.monthly_income = 5000; // Actual dollars
```

❌ **Don't forget to handle CSV fields:**
```javascript
// WRONG: Comparing string directly
if (applicant.employment === requirement.employment_status) // May fail

// RIGHT: Split and check inclusion
const allowed = requirement.employment_status.split(',').map(s => s.trim());
if (allowed.includes(applicant.employment_status)) // Correct
```

## Performance Notes

- Both tables indexed on `uuid` primary keys
- `application_requirements.complex_id` indexed for fast lookups
- `applications.user_id` indexed for user app retrieval
- `applications.unit_id` indexed for property app retrieval
- Use JOINs when getting related data (complex, unit, user info)
