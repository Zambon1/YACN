// Leaser/Landlord database operations - PostgreSQL backend
import db from '../utils/db.js';

export async function createLeaser(leaserData) {
    try {
        const { first_name, last_name, company, phone, email } = leaserData;
        const result = await db.query(`
            INSERT INTO leaser (first_name, last_name, company, phone, email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [first_name, last_name, company, phone, email]);
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
