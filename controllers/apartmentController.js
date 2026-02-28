import { APARTMENTS } from '../data/apartments.js';

/**
 * Get all available apartments
 */
export const getAllApartments = (req, res) => {
    res.json({
        success: true,
        apartments: APARTMENTS
    });
};

/**
 * Get a specific apartment by ID
 */
export const getApartmentById = (req, res) => {
    const apartmentId = parseInt(req.params.id);
    const apartment = APARTMENTS.find(apt => apt.id === apartmentId);
    
    if (apartment) {
        res.json({
            success: true,
            apartment: apartment
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Apartment not found'
        });
    }
};
