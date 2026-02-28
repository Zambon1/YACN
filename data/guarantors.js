// Guarantor database operations - PostgreSQL backend
import db from '../utils/db.js';

export async function createGuarantor(guarantorData) {
    try {
        const { user_id, monthly_income, criminal_check, credit_score } = guarantorData;
        const result = await db.query(`
            INSERT INTO guarantor (user_id, monthly_income, criminal_check, credit_score)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [user_id, monthly_income, criminal_check || false, credit_score]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating guarantor:', error);
        throw error;
    }
}

export async function getGuarantorById(id) {
    try {
        const result = await db.query('SELECT * FROM guarantor WHERE id = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching guarantor by ID:', error);
        throw error;
    }
}

export async function getGuarantorByUserId(userId) {
    try {
        const result = await db.query('SELECT * FROM guarantor WHERE user_id = $1', [userId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching guarantor by user ID:', error);
        throw error;
    }
}

export async function updateGuarantor(id, updates) {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (updates.monthly_income !== undefined) {
            updateFields.push(`monthly_income = $${paramCount++}`);
            values.push(updates.monthly_income);
        }
        if (updates.criminal_check !== undefined) {
            updateFields.push(`criminal_check = $${paramCount++}`);
            values.push(updates.criminal_check);
        }
        if (updates.credit_score !== undefined) {
            updateFields.push(`credit_score = $${paramCount++}`);
            values.push(updates.credit_score);
        }

        if (updateFields.length === 0) return null;

        values.push(id);
        const result = await db.query(`
            UPDATE guarantor 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating guarantor:', error);
        throw error;
    }
}

export async function deleteGuarantor(id) {
    try {
        const result = await db.query('DELETE FROM guarantor WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting guarantor:', error);
        throw error;
    }
}
