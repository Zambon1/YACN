// Applications database - PostgreSQL backend
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
    const client = await db.connect();

    try {
        let existingApp = null;

        if (applicationValues.user_id) {
            const { rows } = await client.query(
                'SELECT * FROM applications WHERE user_id = $1 LIMIT 1',
                [applicationValues.user_id]
            );
            existingApp = rows[0] || null;
        } else if (applicationValues.email) {
            const { rows } = await client.query(
                'SELECT * FROM applications WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
                [applicationValues.email]
            );
            existingApp = rows[0] || null;
        }

        if (existingApp) {
            const { rows } = await client.query(`
                UPDATE applications
                SET
                    user_id = $1,
                    unit_id = $2,
                    first_name = $3,
                    last_name = $4,
                    gender = $5,
                    email = $6,
                    photo_id = $7,
                    employment_status = $8,
                    monthly_income = $9,
                    valid_pay_stubs = $10,
                    pets = $11,
                    birthday = $12,
                    driver_license = $13,
                    employment_hist = $14,
                    children = $15,
                    guarantor_id = $16,
                    credit_score = $17,
                    evictions = $18,
                    criminal_record = $19
                WHERE id = $20
                RETURNING *
            `, [
                applicationValues.user_id,
                applicationValues.unit_id,
                applicationValues.first_name,
                applicationValues.last_name,
                applicationValues.gender,
                applicationValues.email,
                applicationValues.photo_id,
                applicationValues.employment_status,
                applicationValues.monthly_income,
                applicationValues.valid_pay_stubs,
                applicationValues.pets,
                applicationValues.birthday,
                applicationValues.driver_license,
                applicationValues.employment_hist,
                applicationValues.children,
                applicationValues.guarantor_id,
                applicationValues.credit_score,
                applicationValues.evictions,
                applicationValues.criminal_record,
                existingApp.id
            ]);

            return toApplicationResponse(rows[0]);
        }

        const { rows } = await client.query(`
            INSERT INTO applications (
                user_id,
                unit_id,
                first_name,
                last_name,
                gender,
                email,
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
                criminal_record
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19
            )
            RETURNING *
        `, [
            applicationValues.user_id,
            applicationValues.unit_id,
            applicationValues.first_name,
            applicationValues.last_name,
            applicationValues.gender,
            applicationValues.email,
            applicationValues.photo_id,
            applicationValues.employment_status,
            applicationValues.monthly_income,
            applicationValues.valid_pay_stubs,
            applicationValues.pets,
            applicationValues.birthday,
            applicationValues.driver_license,
            applicationValues.employment_hist,
            applicationValues.children,
            applicationValues.guarantor_id,
            applicationValues.credit_score,
            applicationValues.evictions,
            applicationValues.criminal_record
        ]);

        return toApplicationResponse(rows[0]);
    } finally {
        client.release();
    }
}

export async function loadApplications() {
    const { rows } = await db.query('SELECT * FROM applications ORDER BY created_at DESC');
    return rows.map(toApplicationResponse);
}

export async function getApplicationByUserId(userId) {
    const { rows } = await db.query(
        'SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
    );
    return toApplicationResponse(rows[0]);
}

export async function getApplicationByEmail(email) {
    const { rows } = await db.query(
        'SELECT * FROM applications WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
        [email]
    );
    return toApplicationResponse(rows[0]);
}

export async function createDetailedApplication(applicationData) {
    return createApplicationRecord({
        userId: applicationData?.user_id || null,
        email: applicationData?.email || null,
        applicantData: {
            unitId: applicationData?.unit_id,
            firstName: applicationData?.first_name,
            lastName: applicationData?.last_name,
            gender: applicationData?.gender,
            email: applicationData?.email,
            photoId: applicationData?.photo_id,
            employmentStatus: applicationData?.employment_status,
            monthlyIncome: applicationData?.monthly_income,
            validPayStubs: applicationData?.valid_pay_stubs,
            pets: applicationData?.pets,
            birthday: applicationData?.birthday,
            driverLicense: applicationData?.driver_license,
            employmentHist: applicationData?.employment_hist,
            children: applicationData?.children,
            guarantorId: applicationData?.guarantor_id,
            creditScore: applicationData?.credit_score,
            evictions: applicationData?.evictions,
            criminalRecord: applicationData?.criminal_record
        }
    });
}

export async function updateApplicationStatus(id) {
    const { rows } = await db.query('SELECT * FROM applications WHERE id = $1', [id]);
    return toApplicationResponse(rows[0]);
}

export async function getApplicationWithDetails(id) {
    const { rows } = await db.query(`
        SELECT
            a.*,
            u.username,
            u.role as user_role,
            un.price as unit_price,
            un.bedroom,
            un.bathroom,
            un.term,
            c.city,
            c.us_state,
            c.street,
            g.monthly_income as guarantor_income,
            g.credit_score as guarantor_credit_score
        FROM applications a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN unit un ON a.unit_id = un.id
        LEFT JOIN complex c ON un.complex_id = c.id
        LEFT JOIN guarantor g ON a.guarantor_id = g.id
        WHERE a.id = $1
    `, [id]);

    return rows[0] || null;
}

export async function getApplicationsByStatus() {
    return [];
}

export async function logApplicationRule(applicationId, ruleName, renterValue, ruleThreshold, result) {
    const hasRuleLogTableResult = await db.query(
        "SELECT to_regclass('public.application_rule_logs') as table_name"
    );

    if (!hasRuleLogTableResult.rows[0]?.table_name) {
        return;
    }

    await db.query(`
        INSERT INTO application_rule_logs (application_id, rule_name, renter_value, rule_threshold, result)
        VALUES ($1, $2, $3, $4, $5)
    `, [applicationId, ruleName, renterValue, ruleThreshold, result]);
}

export async function getApplicantSubmissionData(applicationId) {
    const { rows } = await db.query(`
        SELECT
            id,
            user_id,
            first_name,
            last_name,
            gender,
            email,
            employment_status,
            monthly_income,
            pets,
            children,
            credit_score,
            evictions,
            criminal_record,
            created_at
        FROM applications
        WHERE id = $1
    `, [applicationId]);

    const app = rows[0];
    if (!app) {
        return null;
    }

    return {
        id: app.id,
        user_id: app.user_id,
        first_name: app.first_name,
        last_name: app.last_name,
        gender: app.gender,
        email: app.email,
        employment_status: app.employment_status,
        monthly_income: app.monthly_income,
        pets: app.pets || 0,
        children: app.children || 0,
        credit_score: app.credit_score,
        evictions: app.evictions || false,
        criminal_record: app.criminal_record || false,
        additional_data: null,
        submitted_at: app.created_at
    };
}

export async function getApplicationsByUnit(unitId) {
    const { rows } = await db.query(`
        SELECT * FROM applications
        WHERE unit_id = $1
        ORDER BY created_at DESC
    `, [unitId]);

    return rows.map(toApplicationResponse);
}

export async function compareApplicantToRequirements(applicationId, complexId) {
    const applicant = await getApplicantSubmissionData(applicationId);
    if (!applicant) {
        throw new Error('Application not found');
    }

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
}
