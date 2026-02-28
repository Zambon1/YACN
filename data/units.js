// Units database operations - PostgreSQL backend
import db from '../utils/db.js';

export async function getAllUnits(filters = {}) {
    try {
        let query = 'SELECT * FROM unit WHERE 1=1';
        const values = [];
        let paramCount = 1;

        if (filters.available !== undefined) {
            query += ` AND available = $${paramCount++}`;
            values.push(filters.available);
        }
        if (filters.complex_id) {
            query += ` AND complex_id = $${paramCount++}`;
            values.push(filters.complex_id);
        }
        if (filters.min_price) {
            query += ` AND price >= $${paramCount++}`;
            values.push(filters.min_price);
        }
        if (filters.max_price) {
            query += ` AND price <= $${paramCount++}`;
            values.push(filters.max_price);
        }
        if (filters.bedrooms) {
            query += ` AND bedroom = $${paramCount++}`;
            values.push(filters.bedrooms);
        }
        if (filters.bathrooms) {
            query += ` AND bathroom = $${paramCount++}`;
            values.push(filters.bathrooms);
        }

        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching units:', error);
        throw error;
    }
}

export async function getUnitById(id) {
    try {
        const result = await db.query('SELECT * FROM unit WHERE id = $1', [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching unit by ID:', error);
        throw error;
    }
}

export async function createUnit(unitData) {
    try {
        const { complex_id, price, term, bedroom, bathroom, available = true } = unitData;
        const result = await db.query(`
            INSERT INTO unit (complex_id, price, term, bedroom, bathroom, available)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [complex_id, price, term, bedroom, bathroom, available]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating unit:', error);
        throw error;
    }
}

export async function updateUnit(id, updates) {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (updates.price !== undefined) {
            updateFields.push(`price = $${paramCount++}`);
            values.push(updates.price);
        }
        if (updates.term !== undefined) {
            updateFields.push(`term = $${paramCount++}`);
            values.push(updates.term);
        }
        if (updates.bedroom !== undefined) {
            updateFields.push(`bedroom = $${paramCount++}`);
            values.push(updates.bedroom);
        }
        if (updates.bathroom !== undefined) {
            updateFields.push(`bathroom = $${paramCount++}`);
            values.push(updates.bathroom);
        }
        if (updates.available !== undefined) {
            updateFields.push(`available = $${paramCount++}`);
            values.push(updates.available);
        }

        if (updateFields.length === 0) return null;

        values.push(id);
        const result = await db.query(`
            UPDATE unit 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating unit:', error);
        throw error;
    }
}

export async function deleteUnit(id) {
    try {
        const result = await db.query('DELETE FROM unit WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting unit:', error);
        throw error;
    }
}
