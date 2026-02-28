import db from '../utils/db.js';

export async function createApplicationRecord(payload) {
    const {userId, username, email, applicantData, matchCount, topRejectionReasons} = payload;
    
    const client = await db.connect();
    try {
        // Check if application already exists for this user/email
        let existingApp = null;
        if (userId) {
            const {rows} = await client.query(`
                SELECT * FROM applications WHERE user_id = $1
            `, [userId]);
            existingApp = rows[0];
        } else if (email) {
            const {rows} = await client.query(`
                SELECT * FROM applications WHERE email = $1
            `, [email]);
            existingApp = rows[0];
        }

        if (existingApp) {
            // Update existing application
            await client.query(`
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
            const {rows} = await client.query(`
                INSERT INTO applications (user_id, username, email, applicant_data, match_count, top_rejection_reasons, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING *
            `, [userId || null, username || null, email, JSON.stringify(applicantData), matchCount, JSON.stringify(topRejectionReasons)]);
            
            return rows[0];
        }
    } finally {
        client.release();
    }
}

export async function loadApplications() {
    const client = await db.connect();
    try {
        const {rows} = await client.query(`SELECT * FROM applications`);
        return rows.map(row => ({
            ...row,
            applicantData: typeof row.applicant_data === 'string' ? JSON.parse(row.applicant_data) : row.applicant_data,
            topRejectionReasons: typeof row.top_rejection_reasons === 'string' ? JSON.parse(row.top_rejection_reasons) : row.top_rejection_reasons
        }));
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
        if (rows[0]) {
            return {
                ...rows[0],
                applicantData: typeof rows[0].applicant_data === 'string' ? JSON.parse(rows[0].applicant_data) : rows[0].applicant_data,
                topRejectionReasons: typeof rows[0].top_rejection_reasons === 'string' ? JSON.parse(rows[0].top_rejection_reasons) : rows[0].top_rejection_reasons
            };
        }
        return null;
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
        if (rows[0]) {
            return {
                ...rows[0],
                applicantData: typeof rows[0].applicant_data === 'string' ? JSON.parse(rows[0].applicant_data) : rows[0].applicant_data,
                topRejectionReasons: typeof rows[0].top_rejection_reasons === 'string' ? JSON.parse(rows[0].top_rejection_reasons) : rows[0].top_rejection_reasons
            };
        }
        return null;
    } finally {
        client.release();
    }
}
