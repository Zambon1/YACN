// Complex/Property database operations - PostgreSQL backend
import db from '../utils/db.js';

export async function getAllComplexes() {
    try {
        const result = await db.query(`
            SELECT c.*, l.first_name, l.last_name, l.company, l.email as leaser_email 
            FROM complex c
            LEFT JOIN leaser l ON c.leaser_id = l.id
            ORDER BY c.city, c.us_state
        `);
        return result.rows;
    } catch (error) {
        console.error('Error fetching complexes:', error);
        throw error;
    }
}

export async function getComplexById(id) {
    try {
        const result = await db.query(`
            SELECT c.*, l.first_name, l.last_name, l.company, l.email as leaser_email, l.phone as leaser_phone
            FROM complex c
            LEFT JOIN leaser l ON c.leaser_id = l.id
            WHERE c.id = $1
        `, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching complex by ID:', error);
        throw error;
    }
}

export async function getComplexWithUnits(id) {
    try {
        const complex = await getComplexById(id);
        if (!complex) return null;

        const unitsResult = await db.query('SELECT * FROM unit WHERE complex_id = $1', [id]);
        complex.units = unitsResult.rows;

        return complex;
    } catch (error) {
        console.error('Error fetching complex with units:', error);
        throw error;
    }
}

export async function createComplex(complexData) {
    try {
        const { leaser_id, us_state, city, street, area_code } = complexData;
        const result = await db.query(`
            INSERT INTO complex (leaser_id, us_state, city, street, area_code)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [leaser_id, us_state, city, street, area_code]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating complex:', error);
        throw error;
    }
}

export async function updateComplex(id, updates) {
    try {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (updates.us_state !== undefined) {
            updateFields.push(`us_state = $${paramCount++}`);
            values.push(updates.us_state);
        }
        if (updates.city !== undefined) {
            updateFields.push(`city = $${paramCount++}`);
            values.push(updates.city);
        }
        if (updates.street !== undefined) {
            updateFields.push(`street = $${paramCount++}`);
            values.push(updates.street);
        }
        if (updates.area_code !== undefined) {
            updateFields.push(`area_code = $${paramCount++}`);
            values.push(updates.area_code);
        }

        if (updateFields.length === 0) return null;

        values.push(id);
        const result = await db.query(`
            UPDATE complex 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, values);

        return result.rows[0];
    } catch (error) {
        console.error('Error updating complex:', error);
        throw error;
    }
}

export async function deleteComplex(id) {
    try {
        const result = await db.query('DELETE FROM complex WHERE id = $1 RETURNING id', [id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error deleting complex:', error);
        throw error;
    }
}
export async function getComplexesByLeaserId(leaserId) {
    try {
        const result = await db.query(`
            SELECT c.*, l.first_name, l.last_name, l.company, l.email as leaser_email 
            FROM complex c
            LEFT JOIN leaser l ON c.leaser_id = l.id
            WHERE c.leaser_id = $1
            ORDER BY c.city, c.us_state
        `, [leaserId]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching complexes by leaser ID:', error);
        throw error;
    }
}