// Applications database - PostgreSQL backend
// APPLICANT SUBMISSIONS: This file stores what APPLICANTS SUBMIT (their actual data)
// SYMMETRICAL WITH requirements.js which stores what LANDLORDS REQUIRE (criteria)
//
// Both store the same types of information:
//   - name, employment status, monthly income, credit score, pets, children, evictions, criminal record
//   - But applications.js = ACTUAL VALUES from applicants
//   - And requirements.js = CRITERIA set by landlords
//
// Example:
//   - applicant submits: monthly_income = $5000, credit_score = 'good', pets = 2
//   - landlord requires: min_monthly_income_ratio = 3.0, credit_score_min = 'fair', pets = 1
import db from '../utils/db.js';

function parseOptionalInt(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function parseOptionalBoolean(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(normalized)) {
        return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalized)) {
        return false;
    }

    return null;
}

function normalizeEnum(value, allowedValues) {
    if (!value) {
        return null;
    }

    const normalized = String(value).trim();
    const exactMatch = allowedValues.find((allowed) => allowed === normalized);
    if (exactMatch) {
        return exactMatch;
    }

    const lower = normalized.toLowerCase();
    const caseInsensitiveMatch = allowedValues.find((allowed) => allowed.toLowerCase() === lower);
    return caseInsensitiveMatch || null;
}

function normalizeDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 10);
}

function mapPayloadToApplicationColumns(payload) {
    const applicantData = payload?.applicantData || {};

    return {
        user_id: payload?.userId || payload?.user_id || null,
        unit_id: parseOptionalInt(applicantData.unitId),
        first_name: applicantData.firstName || null,
        last_name: applicantData.lastName || null,
        gender: normalizeEnum(applicantData.gender, ['male', 'female']),
        email: payload?.email || applicantData.email || null,
        photo_id: parseOptionalBoolean(applicantData.photoId),
        employment_status: normalizeEnum(applicantData.employmentStatus, ['Employed', 'Self-Employed', 'Unemployed', 'Other']),
        monthly_income: parseOptionalInt(applicantData.monthlyIncome),
        valid_pay_stubs: parseOptionalBoolean(applicantData.validPayStubs),
        pets: parseOptionalInt(applicantData.numberOfPets ?? applicantData.pets),
        birthday: normalizeDate(applicantData.birthday ?? applicantData.dob),
        driver_license: parseOptionalInt(applicantData.driverLicense),
        employment_hist: parseOptionalBoolean(applicantData.employmentHist),
        children: parseOptionalInt(applicantData.children),
        guarantor_id: applicantData.guarantorId || null,
        credit_score: normalizeEnum(applicantData.creditScore, ['poor', 'fair', 'good', 'excellent']),
        evictions: parseOptionalBoolean(applicantData.evictions),
        criminal_record: parseOptionalBoolean(applicantData.criminalRecord)
    };
}

function toApplicationResponse(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        userId: row.user_id,
        email: row.email,
        applicantData: {
            firstName: row.first_name,
            lastName: row.last_name,
            gender: row.gender,
            email: row.email,
            photoId: row.photo_id,
            employmentStatus: row.employment_status,
            monthlyIncome: row.monthly_income,
            validPayStubs: row.valid_pay_stubs,
            pets: row.pets,
            birthday: row.birthday,
            driverLicense: row.driver_license,
            employmentHist: row.employment_hist,
            children: row.children,
            guarantorId: row.guarantor_id,
            creditScore: row.credit_score,
            evictions: row.evictions,
            criminalRecord: row.criminal_record,
            unitId: row.unit_id
        },
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        topRejectionReasons: []
    };
}

export async function createApplicationRecord(payload) {
    const applicationValues = mapPayloadToApplicationColumns(payload);
    
    try {
        // Check if application already exists for this user/email
        let existingApp = null;
        if (userId) {
            const result = await db.query('SELECT * FROM applications WHERE user_id = $1', [userId]);
            existingApp = result.rows[0];
        } else if (email) {
            const result = await db.query('SELECT * FROM applications WHERE email = $1', [email]);
            existingApp = result.rows[0];
        }

        if (existingApp) {
            // Update existing application
            await db.query(`
                UPDATE applications 
                SET applicant_data = $1, match_count = $2, top_rejection_reasons = $3, updated_at = NOW()
                WHERE id = $4
            `, [JSON.stringify(applicantData), matchCount, JSON.stringify(topRejectionReasons), existingApp.id]);
            
            return {
                id: existingApp.id,
                userId,
                username,
                email,
                applicantData,
                matchCount,
                topRejectionReasons
            };
        } else {
            // Create new application
            const result = await db.query(`
                INSERT INTO applications (user_id, username, email, applicant_data, match_count, top_rejection_reasons)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [userId || null, username || null, email, JSON.stringify(applicantData), matchCount, JSON.stringify(topRejectionReasons)]);
            
            return {
                id: result.rows[0].id,
                userId,
                username,
                email,
                applicantData,
                matchCount,
                topRejectionReasons
            };
        }
    } catch (error) {
        console.error('Error creating application record:', error);
        throw error;
    }
}

export async function loadApplications() {
    try {
        const result = await db.query('SELECT * FROM applications');
        return result.rows.map(row => ({
            ...row,
            applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
            topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
        }));
    } catch (error) {
        console.error('Error loading applications:', error);
        throw error;
    }
}

export async function getApplicationByUserId(userId) {
    try {
        const result = await db.query('SELECT * FROM applications WHERE user_id = $1', [userId]);
        const row = result.rows[0];
        if (row) {
            return {
                ...row,
                applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
                topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting application by user ID:', error);
        throw error;
    }
}

export async function getApplicationByEmail(email) {
    try {
        const result = await db.query('SELECT * FROM applications WHERE email = $1', [email]);
        const row = result.rows[0];
        if (row) {
            return {
                ...row,
                applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
                topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting application by email:', error);
        throw error;
    }
}

// Enhanced application creation with detailed fields
// This stores APPLICANT SUBMITTED DATA - what the renter provides
// Symmetrical fields with requirements.js but stores ACTUAL VALUES not CRITERIA
export async function createDetailedApplication(applicationData) {
    try {
        const {
            user_id,
            unit_id,
            first_name,
            last_name,
            gender,
            email,
            phone,
            photo_id,
            employment_status,
            monthly_income,
            valid_pay_stubs,
            pets,
            birthday,
            driver_license,
            employment_hist,
            children,
            guarantor_id,
            credit_score,
            evictions,
            criminal_record,
            applicant_data,
            match_count = 0,
            top_rejection_reasons,
            current_status = 'submitted'
        } = applicationData;

        const result = await db.query(`
            INSERT INTO applications (
                user_id, unit_id, first_name, last_name, gender, email, phone,
                photo_id, employment_status, monthly_income, valid_pay_stubs,
                pets, birthday, driver_license, employment_hist, children,
                guarantor_id, credit_score, evictions, criminal_record,
                applicant_data, match_count, top_rejection_reasons, current_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
            RETURNING *
        `, [
            user_id, unit_id, first_name, last_name, gender, email, phone,
            photo_id, employment_status, monthly_income, valid_pay_stubs,
            pets, birthday, driver_license, employment_hist, children,
            guarantor_id, credit_score, evictions, criminal_record,
            applicant_data ? JSON.stringify(applicant_data) : null,
            match_count,
            top_rejection_reasons ? JSON.stringify(top_rejection_reasons) : null,
            current_status
        ]);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating detailed application:', error);
        throw error;
    }
}

export async function updateApplicationStatus(id, status, reason = null) {
    try {
        const result = await db.query(`
            UPDATE applications 
            SET current_status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        // Log the event
        if (result.rows[0]) {
            await db.query(`
                INSERT INTO application_events (application_id, event_type, triggered_by, reason)
                VALUES ($1, $2, $3, $4)
            `, [id, 'status_change', 'system', reason]);
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
}

export async function getApplicationWithDetails(id) {
    try {
        const result = await db.query(`
            SELECT 
                a.*,
                u.username, u.role as user_role,
                un.price as unit_price, un.bedroom, un.bathroom, un.term,
                c.city, c.us_state, c.street,
                g.monthly_income as guarantor_income, g.credit_score as guarantor_credit_score
            FROM applications a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN unit un ON a.unit_id = un.id
            LEFT JOIN complex c ON un.complex_id = c.id
            LEFT JOIN guarantor g ON a.guarantor_id = g.id
            WHERE a.id = $1
        `, [id]);

        const row = result.rows[0];
        if (row) {
            return {
                ...row,
                applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
                topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting application with details:', error);
        throw error;
    }
}

export async function getApplicationsByStatus(status) {
    try {
        const result = await db.query(
            'SELECT * FROM applications WHERE current_status = $1 ORDER BY created_at DESC',
            [status]
        );
        return result.rows.map(row => ({
            ...row,
            applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
            topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
        }));
    } catch (error) {
        console.error('Error getting applications by status:', error);
        throw error;
    }
}

export async function logApplicationRule(applicationId, ruleName, renterValue, ruleThreshold, result) {
    try {
        await db.query(`
            INSERT INTO application_rule_logs (application_id, rule_name, renter_value, rule_threshold, result)
            VALUES ($1, $2, $3, $4, $5)
        `, [applicationId, ruleName, renterValue, ruleThreshold, result]);
    } catch (error) {
        console.error('Error logging application rule:', error);
        throw error;
    }
}
/**
 * Get applicant submission data extracted from an application
 * Returns only the fields that are comparable to requirements
 * This is the ACTUAL DATA applicant provided (vs. requirements.js which has criteria)
 */
export async function getApplicantSubmissionData(applicationId) {
    try {
        const result = await db.query(`
            SELECT 
                id,
                user_id,
                first_name,
                last_name,
                gender,
                email,
                phone,
                employment_status,
                monthly_income,
                pets,
                children,
                credit_score,
                evictions,
                criminal_record,
                applicant_data,
                created_at
            FROM applications
            WHERE id = $1
        `, [applicationId]);

        if (!result.rows[0]) return null;

        const app = result.rows[0];
        return {
            id: app.id,
            user_id: app.user_id,
            first_name: app.first_name,
            last_name: app.last_name,
            gender: app.gender,
            email: app.email,
            phone: app.phone,
            employment_status: app.employment_status,
            monthly_income: app.monthly_income,
            pets: app.pets || 0,
            children: app.children || 0,
            credit_score: app.credit_score,
            evictions: app.evictions || false,
            criminal_record: app.criminal_record || false,
            additional_data: app.applicant_data ? JSON.parse(app.applicant_data) : null,
            submitted_at: app.created_at
        };
    } catch (error) {
        console.error('Error getting applicant submission data:', error);
        throw error;
    }
}

/**
 * Get all applicant submissions for a unit
 * Shows all who applied to a specific property/unit
 */
export async function getApplicationsByUnit(unitId) {
    try {
        const result = await db.query(`
            SELECT * FROM applications
            WHERE unit_id = $1
            ORDER BY created_at DESC
        `, [unitId]);

        return result.rows.map(row => ({
            ...row,
            applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
            topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
        }));
    } catch (error) {
        console.error('Error getting applications by unit:', error);
        throw error;
    }
}

/**
 * Compare a single applicant submission against complex requirements
 * Returns a detailed matching report
 */
export async function compareApplicantToRequirements(applicationId, complexId) {
    try {
        const applicant = await getApplicantSubmissionData(applicationId);
        if (!applicant) throw new Error('Application not found');

        // Import requirements module to get requirements data
        const { getRequirementsForComplex, checkApplicantMeetsRequirements } = await import('./requirements.js');
        
        const requirements = await getRequirementsForComplex(complexId);
        if (!requirements) {
            return {
                applicantId: applicationId,
                complexId,
                result: 'no_requirements',
                message: 'No requirements set for this complex'
            };
        }

        // Use requirements module to check
        const matchResult = await checkApplicantMeetsRequirements(applicationId, complexId);

        return {
            applicationId,
            complexId,
            applicantData: applicant,
            requirementsData: requirements,
            matchResult,
            passes: matchResult.passes,
            failedRules: matchResult.failedRules
        };
    } catch (error) {
        console.error('Error comparing applicant to requirements:', error);
        throw error;
    }
}