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
        // Check if application already exists for this user/email
        let existingApp = null;
        if (applicationValues.user_id) {
            const {rows} = await client.query(`
                SELECT * FROM applications WHERE user_id = $1
            `, [applicationValues.user_id]);
            existingApp = rows[0];
        } else if (applicationValues.email) {
            const {rows} = await client.query(`
                SELECT * FROM applications WHERE email = $1
            `, [applicationValues.email]);
            existingApp = rows[0];
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
        } else {
            const {rows} = await client.query(`
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
        }
    } finally {
        client.release();
    }
}

export async function loadApplications() {
    const client = await db.connect();
    try {
        const {rows} = await client.query(`SELECT * FROM applications`);
        return rows.map(toApplicationResponse);
    } finally {
        client.release();
    }
}

export async function getApplicationByUserId(userId) {
    const client = await db.connect();
    try {
        const {rows} = await client.query(`
            SELECT * FROM applications WHERE user_id = $1
        `, [userId]);
        return toApplicationResponse(rows[0]);
    } finally {
        client.release();
    }
}

export async function getApplicationByEmail(email) {
    const client = await db.connect();
    try {
        const {rows} = await client.query(`
            SELECT * FROM applications WHERE email = $1
        `, [email]);
        return toApplicationResponse(rows[0]);
    } finally {
        client.release();
    }
}
