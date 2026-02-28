// Leaser/Landlord database operations - PostgreSQL backend
import db from '../utils/db.js';

export async function createLeaser(leaserData) {
    try {
        const { first_name, last_name, company, phone, email, username, license_number, user_id } = leaserData;

        const columnInfoResult = await db.query(`
            SELECT column_name, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'leaser'
        `);

        const columnInfo = columnInfoResult.rows.reduce((acc, row) => {
            acc[row.column_name] = row;
            return acc;
        }, {});

        const hasLicenseNumberColumn = !!columnInfo.license_number;
        const licenseIsRequired = hasLicenseNumberColumn && columnInfo.license_number.is_nullable === 'NO';
        const hasUsernameColumn = !!columnInfo.username;
        const usernameIsRequired = hasUsernameColumn && columnInfo.username.is_nullable === 'NO';

        if (licenseIsRequired && (license_number === null || license_number === undefined || String(license_number).trim() === '')) {
            throw new Error('License number is required');
        }

        if (usernameIsRequired && (username === null || username === undefined || String(username).trim() === '')) {
            throw new Error('Username is required');
        }

        const valuesByColumn = {
            first_name,
            last_name,
            company,
            phone,
            email,
            username: username || null,
            license_number: license_number || null,
            user_id: user_id || null
        };

        const insertableColumns = Object.keys(valuesByColumn).filter((column) => !!columnInfo[column]);
        const values = insertableColumns.map((column) => valuesByColumn[column]);
        const placeholders = insertableColumns.map((_, index) => `$${index + 1}`);

        const result = await db.query(`
            INSERT INTO leaser (${insertableColumns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating leaser:', error);
        throw error;
    }
}

export async function getLeaserById(id) {
    try {
        const result = await db.query('SELECT * FROM leaser WHERE id = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching leaser by ID:', error);
        throw error;
    }
}

export async function getAllLeasers() {
    try {
        const result = await db.query('SELECT * FROM leaser ORDER BY last_name, first_name');
        return result.rows;
    } catch (error) {
        console.error('Error fetching leasers:', error);
        throw error;
    }
}

export async function getLeaserWithComplexes(id) {
    try {
        const leaser = await getLeaserById(id);
        if (!leaser) return null;

        const complexesResult = await db.query('SELECT * FROM complex WHERE leaser_id = $1', [id]);
        leaser.complexes = complexesResult.rows;

        return leaser;
    } catch (error) {
        console.error('Error fetching leaser with complexes:', error);
        throw error;
    }
}

export async function updateLeaser(id, updates) {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (updates.first_name !== undefined) {
            updateFields.push(`first_name = $${paramCount++}`);
            values.push(updates.first_name);
        }
        if (updates.last_name !== undefined) {
            updateFields.push(`last_name = $${paramCount++}`);
            values.push(updates.last_name);
        }
        if (updates.company !== undefined) {
            updateFields.push(`company = $${paramCount++}`);
            values.push(updates.company);
        }
        if (updates.phone !== undefined) {
            updateFields.push(`phone = $${paramCount++}`);
            values.push(updates.phone);
        }
        if (updates.email !== undefined) {
            updateFields.push(`email = $${paramCount++}`);
            values.push(updates.email);
        }

        if (updateFields.length === 0) return null;

        values.push(id);
        const result = await db.query(`
            UPDATE leaser 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating leaser:', error);
        throw error;
    }
}

export async function deleteLeaser(id) {
    try {
        const result = await db.query('DELETE FROM leaser WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting leaser:', error);
        throw error;
    }
}
export async function getLeaserByUserId(userId) {
    try {
        const result = await db.query(`
            SELECT l.*
            FROM leaser l
            JOIN users u ON LOWER(u.email) = LOWER(l.email)
            WHERE u.id = $1
            LIMIT 1
        `, [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching leaser by user ID:', error);
        throw error;
    }
}