// Units Controller - Search and browse available units
import { getAllUnits, getUnitById } from '../data/units.js';
import { getComplexById } from '../data/complexes.js';

export async function searchUnits(req, res) {
    try {
        const filters = {
            available: req.query.available !== 'false', // Default to available units only
            min_price: req.query.min_price ? parseInt(req.query.min_price) : undefined,
            max_price: req.query.max_price ? parseInt(req.query.max_price) : undefined,
            bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms) : undefined,
            bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms) : undefined,
            complex_id: req.query.complex_id ? parseInt(req.query.complex_id) : undefined
        };

        const units = await getAllUnits(filters);

        // Enrich with complex information
        const enrichedUnits = await Promise.all(
            units.map(async (unit) => {
                const complex = await getComplexById(unit.complex_id);
                return {
                    ...unit,
                    complex
                };
            })
        );

        res.json({
            success: true,
            count: enrichedUnits.length,
            units: enrichedUnits
        });
    } catch (error) {
        console.error('Search units error:', error);
        res.status(500).json({
            success: false,
            error: 'Error searching units'
        });
    }
}

export async function getUnit(req, res) {
    try {
        const unitId = parseInt(req.params.id);
        const unit = await getUnitById(unitId);

        if (!unit) {
            return res.status(404).json({
                success: false,
                error: 'Unit not found'
            });
        }

        const complex = await getComplexById(unit.complex_id);

        res.json({
            success: true,
            unit: {
                ...unit,
                complex
            }
        });
    } catch (error) {
        console.error('Get unit error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching unit'
        });
    }
}
