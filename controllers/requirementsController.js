// Requirements controller - API endpoints for managing application requirements
// Handles landlord-defined criteria (symmetrical with what applicants submit)

import * as requirements from '../data/requirements.js';

/**
 * Create requirements for a complex
 * POST /api/requirements
 */
export async function createRequirements(req, res) {
    try {
        const requirementData = req.body;

        // Verify complex_id is provided
        if (!requirementData.complex_id) {
            return res.status(400).json({
                error: 'complex_id is required'
            });
        }

        const result = await requirements.createApplicationRequirements(requirementData);
        res.status(201).json({
            success: true,
            message: 'Requirements created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error creating requirements:', error);
        res.status(500).json({
            error: 'Failed to create requirements',
            details: error.message
        });
    }
}

/**
 * Get requirements for a specific complex
 * GET /api/requirements/:complexId
 */
export async function getRequirements(req, res) {
    try {
        const { complexId } = req.params;

        const result = await requirements.getRequirementsForComplex(complexId);
        if (!result) {
            return res.status(404).json({
                error: 'Requirements not found for this complex'
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting requirements:', error);
        res.status(500).json({
            error: 'Failed to get requirements',
            details: error.message
        });
    }
}

/**
 * Update requirements for a complex
 * PUT /api/requirements/:complexId
 */
export async function updateRequirements(req, res) {
    try {
        const { complexId } = req.params;
        const updates = req.body;

        const result = await requirements.updateApplicationRequirements(complexId, updates);
        if (!result) {
            return res.status(404).json({
                error: 'Requirements not found for this complex'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Requirements updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating requirements:', error);
        res.status(500).json({
            error: 'Failed to update requirements',
            details: error.message
        });
    }
}

/**
 * Delete requirements for a complex
 * DELETE /api/requirements/:complexId
 */
export async function deleteRequirements(req, res) {
    try {
        const { complexId } = req.params;

        const success = await requirements.deleteApplicationRequirements(complexId);
        if (!success) {
            return res.status(404).json({
                error: 'Requirements not found for this complex'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Requirements deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting requirements:', error);
        res.status(500).json({
            error: 'Failed to delete requirements',
            details: error.message
        });
    }
}

/**
 * Check if an applicant meets requirements
 * POST /api/requirements/:complexId/check
 * Body: { applicationId }
 */
export async function checkApplicantMeetsRequirements(req, res) {
    try {
        const { complexId } = req.params;
        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({
                error: 'applicationId is required'
            });
        }

        const result = await requirements.checkApplicantMeetsRequirements(applicationId, complexId);

        res.status(200).json({
            success: true,
            passes: result.passes,
            failedRules: result.failedRules,
            data: result
        });
    } catch (error) {
        console.error('Error checking applicant against requirements:', error);
        res.status(500).json({
            error: 'Failed to check applicant against requirements',
            details: error.message
        });
    }
}

/**
 * Get all requirements with complex info
 * GET /api/requirements
 */
export async function getAllRequirements(req, res) {
    try {
        const result = await requirements.getAllRequirementsWithComplexInfo();

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error('Error getting all requirements:', error);
        res.status(500).json({
            error: 'Failed to get requirements',
            details: error.message
        });
    }
}
