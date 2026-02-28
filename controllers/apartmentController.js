import db from '../utils/db.js';

/**
 * Get all available apartments from database
 */
export const getAllApartments = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.street as address,
                c.city,
                c.us_state as state,
                u.bedroom as bedrooms,
                u.bathroom as bathrooms,
                u.price as rent,
                u.deposit,
                c.min_credit_score,
                c.min_income_multiplier,
                c.pets_allowed,
                c.pet_types,
                c.max_pets,
                c.pet_deposit,
                c.smoking_allowed,
                c.accepts_evictions,
                c.accepts_bankruptcies,
                c.accepts_criminal_record,
                c.amenities,
                c.image
            FROM complex c
            JOIN unit u ON c.id = u.complex_id
            WHERE c.name IS NOT NULL
            ORDER BY c.id
        `;
        
        const result = await db.query(query);
        
        res.json({
            success: true,
            apartments: result.rows
        });
    } catch (error) {
        console.error('Error fetching apartments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch apartments'
        });
    }
};

/**
 * Get a specific apartment by ID from database
 */
export const getApartmentById = async (req, res) => {
    try {
        const apartmentId = parseInt(req.params.id);
        
        const query = `
            SELECT 
                c.id,
                c.name,
                c.street as address,
                c.city,
                c.us_state as state,
                u.bedroom as bedrooms,
                u.bathroom as bathrooms,
                u.price as rent,
                u.deposit,
                c.min_credit_score,
                c.min_income_multiplier,
                c.pets_allowed,
                c.pet_types,
                c.max_pets,
                c.pet_deposit,
                c.smoking_allowed,
                c.accepts_evictions,
                c.accepts_bankruptcies,
                c.accepts_criminal_record,
                c.amenities,
                c.image
            FROM complex c
            JOIN unit u ON c.id = u.complex_id
            WHERE c.id = $1 AND c.name IS NOT NULL
        `;
        
        const result = await db.query(query, [apartmentId]);
        
        if (result.rows.length > 0) {
            res.json({
                success: true,
                apartment: result.rows[0]
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Apartment not found'
            });
        }
    } catch (error) {
        console.error('Error fetching apartment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch apartment'
        });
    }
};
